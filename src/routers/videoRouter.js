import express from "express";
import {
  videoSee,
  videoGetEdit,
  videoPostEdit,
  videoGetUpload,
  videoPostUpload,
  videoDelete,
} from "../controllers/videoController";
import { protectorMiddleware, uploadVideo } from "../middlewares";

const videoRouter = express.Router();

videoRouter.route("/:id([0-9a-f]{24})").get(videoSee);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(videoGetUpload)
  .post(
    uploadVideo.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    videoPostUpload
  );
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(videoGetEdit)
  .post(videoPostEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(videoDelete);

export default videoRouter;
