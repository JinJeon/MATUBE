import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});
const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "jin-matube/image",
  acl: "public-read",
});
const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "jin-matube/video",
  acl: "public-read",
});
const isHeroku = process.env.NODE_ENV === "production";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "MATUBE";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isHeroku = isHeroku;
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
  storage: isHeroku ? s3ImageUploader : undefined,
}); // avatar uploads link
export const uploadVideo = multer({
  dest: "uploads/video/",
  limits: {
    fileSize: 50000000,
  },
  storage: isHeroku ? s3VideoUploader : undefined,
}); // movie uploads link
