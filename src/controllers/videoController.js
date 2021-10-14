import { Console } from "console";
import Video from "../models/video";
import User from "../models/user";

// export const videoTrend = (req, res) => {
//   Video.find({},(error, vids) => {
//     return res.render("home", { pageTitle : "home", vids : [] });
//   });
// }
export const videoTrend = async (req, res) => {
  const vids = await Video.find({})
    .sort({ createdAt: "asc" })
    .populate("owner");
  return res.render("home", { pageTitle: "HOME", vids });
};
export const videoSearch = async (req, res) => {
  let videos = [];
  const { keyword } = req.query;
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  res.render("search", { pageTitle: "SEARCH VIDEO", videos });
};
export const videoGetUpload = (req, res) => {
  res.render("upload", { pageTitle: "UPLOAD VIDEO" });
};
export const videoPostUpload = async (req, res) => {
  const { path: fileUrl } = req.file;
  const { user: _id } = req.session;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      fileUrl,
      title,
      description,
      owner: _id,
      hashtags: Video.makeHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.video.push(newVideo._id);
    await user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.render("upload", {
      pageTitle: "UPLOAD VIDEO",
      errorMessage: error._message,
    });
  }
};
export const videoSee = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  console.log(video);
  if (!video) {
    res.render("404", { pageTitle: "VIDEO NOT FOUND" });
  } else {
    res.render("watch", {
      pageTitle: `WATCHING : ${video.title}`,
      video,
    });
  }
};
export const videoGetEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    res.status(404).render("404", { pageTitle: "VIDEO NOT FOUND" });
  }
  if (String(_id) !== String(video.owner)) {
    res.status(403).redirect("/");
  } else {
    res.render("edit", { pageTitle: `EDITING : ${video.title}`, video });
  }
};
export const videoPostEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.exists({ _id: id });
  if (!video) {
    res.render("404", { pageTitle: "VIDEO NOT FOUND" });
  }
  if (String(_id) !== String(video.owner)) {
    res.status(403).redirect("/");
  } else {
    const { title, description, hashtags } = req.body;
    await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.makeHashtags(hashtags),
    });
  }
  return res.redirect(`/video/${id}`);
};
export const videoDelete = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    res.status(404).render("404", { pageTitle: "VIDEO NOT FOUND" });
  }
  if (String(_id) !== String(video.owner)) {
    res.status(403).redirect("/");
  } else {
    await Video.findByIdAndDelete(id);
  }
  return res.redirect("/");
};
export const registerViews = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};
