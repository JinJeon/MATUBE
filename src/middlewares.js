import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "MATUBE";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "LOGIN FIRST!");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "ALREADY LOGIN");
    return res.redirect("/");
  }
};

export const uploadAvatar = multer({
  dest: "uploads/avatar/",
  limits: {
    fileSize: 3000000,
  },
}); // avatar uploads link
export const uploadVideo = multer({
  dest: "uploads/video/",
  limits: {
    fileSize: 50000000,
  },
}); // movie uploads link
