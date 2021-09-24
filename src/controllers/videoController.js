import { Console } from "console";
import Video from "../models/video";

// export const videoTrend = (req, res) => {
//   Video.find({},(error, vids) => {
//     return res.render("home", { pageTitle : "home", vids : [] });
//   });
// }
export const videoTrend = async (req, res) => {
  const vids = await Video.find({}).sort({ createdAt: "asc" });
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
    });
  }
  res.render("search", { pageTitle: "SEARCH VIDEO", videos });
};
export const videoGetUpload = (req, res) => {
  return res.render("upload", { pageTitle: "UPLOAD VIDEO" });
};
export const videoPostUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    const video = new Video({
      title,
      description,
      hashtags: Video.makeHashtags(hashtags),
    });
    await video.save();
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
  console.log(req.params);
  const video = await Video.findById(id);
  if (!video) {
    res.render("404", { pageTitle: "VIDEO NOT FOUND" });
  } else {
    res.render("watch", { pageTitle: `WATCHING : ${video.title}`, video });
  }
};
export const videoGetEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    res.render("404", { pageTitle: "VIDEO NOT FOUND" });
  } else {
    res.render("edit", { pageTitle: `EDITING : ${video.title}`, video });
  }
};
export const videoPostEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.exists({ _id: id });
  if (!video) {
    res.render("404", { pageTitle: "VIDEO NOT FOUND" });
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
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};
