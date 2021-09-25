import User from "../models/user";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const userGetJoin = (req, res) =>
  res.render("join", { pageTitle: "JOIN" });
export const userPostJoin = async (req, res) => {
  const { email, password, passwordCheck, username, name, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (password !== passwordCheck) {
    return res.status(400).render("join", {
      pageTitle: "JOIN",
      errorMessage: "Password confirmation does not match",
    });
  }
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "JOIN",
      errorMessage: "This username/email is already taken",
    });
  }
  try {
    await User.create({
      email,
      password,
      passwordCheck,
      username,
      name,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .render("join", { pageTitle: "JOIN FAIL", errorMessage: error._message });
  }
};
export const userGetLogin = (req, res) =>
  res.render("login", { pageTitle: "LOGIN" });
export const userPostLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    res.status(400).render("login", {
      pageTitle: "LOGIN",
      errorMessage: "NONEXISTENT ACCOUNT",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  console.log(password);
  const compare = await bcrypt.compare(password, user.password);
  if (!compare) {
    res.status(400).render("login", {
      pageTitle: "LOGIN",
      errorMessage: "WRONG PASSWORD",
    });
  }
  res.redirect("/");
};
export const userGetEdit = (req, res) => {
  res.render("user-edit", { pageTitle: "EDIT YOUR PROFILE" });
};

export const userPostEdit = async (req, res) => {
  try {
    // session, body 값 불러오기
    const {
      session: {
        user: {
          _id,
          avatarUrl,
          email: sessionEmail,
          username: sessionUsername,
        },
      },
      body: { name, email, username, location },
      file,
    } = req;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (sessionEmail !== email || sessionUsername !== username) {
      // email or username 수정 있을 시
      if (exists._id.toString() !== _id) {
        return res.status(400).render("user-edit", {
          pageTitle: "EDIT YOUR PROFILE",
          errorMessage: "This username/email is already taken",
        });
      }
      const updateUser = await User.findByIdAndUpdate(
        // 중복이 없을 시 수정
        _id,
        {
          avatarUrl: file ? file.path : avatarUrl,
          name,
          email,
          username,
          location,
        },
        { new: true }
      );
      req.session.user = updateUser;
      return res.redirect("/user/edit");
    }
    const updateUser = await User.findByIdAndUpdate(
      // email or username 수정 없을 시
      _id,
      {
        avatarUrl: file ? file.path : avatarUrl,
        name,
        email,
        username,
        location,
      },
      { new: true }
    );
    req.session.user = updateUser;
    return res.redirect("/user/edit");
  } catch (error) {
    return res.status(400).render("user-edit", {
      pageTitle: "EDIT YOUR PROFILE",
      errorMessage: error._message,
    });
  }
};
export const userDelete = (req, res) => res.send("User delete");
export const userLogout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const userSee = (req, res) => res.send("user see");
export const userGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const afterUrl = `${baseUrl}?${params}`;
  return res.redirect(afterUrl);
};
export const userGithubFinish = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_ID,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const afterUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(afterUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const userUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${userUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${userUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        email: emailObj.email,
        password: "",
        username: userData.login,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        location: userData.location,
        socialOnly: true,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/");
  }
};
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("change-password", { pageTitle: "CHANGE PASSWORD" });
};
export const postChangePassword = async (req, res) => {
  console.log(req.session.user);
  const {
    session: {
      user: { _id },
    },
    body: { password, newpassword, checkpassword },
  } = req;
  const user = await User.findById(_id);
  const compare = await bcrypt.compare(password, user.password);
  if (!compare) {
    return res.status(400).render("change-password", {
      pageTitle: "CHANGE PASSWORD",
      errorMessage: "Password incorrect",
    });
  }
  if (newpassword !== checkpassword) {
    return res.status(400).render("change-password", {
      pageTitle: "CHANGE PASSWORD",
      errorMessage: "New password is not matched",
    });
  }
  user.password = password;
  await user.save();
  req.session.user = user;
  res.redirect("/logout");
};
