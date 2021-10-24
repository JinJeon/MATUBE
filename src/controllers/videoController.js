import { Console } from "console";
import Video from "../models/video";
import User from "../models/user";
import Comment from "../models/comment";
import { async } from "regenerator-runtime";

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
  const { video, thumb } = req.files;
  const { user: _id } = req.session;
  const { title, description, hashtags } = req.body;
  const isHeroku = process.env.NODE_ENV === "production";
  try {
    const newVideo = await Video.create({
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbUrl: isHeroku ? thumb[0].location : thumb[0].path,
      title,
      description,
      owner: _id,
      hashtags: Video.makeHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.video.push(newVideo._id);
    await user.save();
    req.flash("success", "VIDEO UPLOADED");
    return res.redirect("/");
  } catch (error) {
    req.flash("error", "ERROR!");
    return res.render("upload", {
      pageTitle: "UPLOAD VIDEO",
      errorMessage: error._message,
    });
  }
};
export const videoSee = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comment");
  if (!video) {
    req.flash("error", "ERROR!");
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
    req.flash("error", "ERROR!");
    res.status(404).render("404", { pageTitle: "VIDEO NOT FOUND" });
  }
  if (String(_id) !== String(video.owner)) {
    req.flash("error", "ERROR!");
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
  const idVideo = await Video.findById(id);
  if (String(_id) !== String(idVideo.owner)) {
    req.flash("error", "NOT AUTHORIZED");
    return res.status(403).redirect("/");
  } else {
    const { title, description, hashtags } = req.body;
    await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.makeHashtags(hashtags),
    });
    req.flash("success", "EDIT SUCCESS!");
    return res.redirect(`/video/${id}`);
  }
};
export const videoDelete = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    req.flash("error", "ERROR!");
    res.status(404).render("404", { pageTitle: "VIDEO NOT FOUND" });
  }
  if (String(_id) !== String(video.owner)) {
    req.flash("error", "NOT AUTHORIZED");
    res.status(403).redirect("/");
  } else {
    await Video.findByIdAndDelete(id);
  }
  req.flash("info", "VIDEO DELETED");
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

export const createComment = async (req, res) => {
  const {
    body: { text },
    params: { id },
    session: { user },
  } = req;
  const video = await Video.findById(id);
  const commentUser = await User.findById(user._id);
  if (!video) {
    return res.sendStatus(404);
  }
  if (!commentUser) {
    return res.sendStatus(403);
  }
  if (text.length > 20) {
    return res.sendStatus(404);
  }
  console.log(text);
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comment.push(comment._id);
  video.save();
  commentUser.comment.push(comment._id);
  commentUser.save();
  return res.status(201).json({ newCommentId: comment._id });
};
export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: { user },
  } = req;
  const comment = await Comment.findById(id)
    .populate("video")
    .populate("owner");
  if (String(comment.owner._id) !== user._id) {
    return res.sendStatus(403);
  }
  if (!comment) {
    return res.sendStatus(404);
  }
  const videoId = comment.video._id;
  const userId = comment.owner._id;
  const video = await Video.findById(videoId);
  const commentUser = await User.findById(userId);
  video.comment.splice(video.comment.indexOf(id), 1);
  video.save();
  commentUser.comment.splice(commentUser.comment.indexOf(id), 1);
  commentUser.save();
  await Comment.findByIdAndRemove(id);
  return res.sendStatus(201);
};
