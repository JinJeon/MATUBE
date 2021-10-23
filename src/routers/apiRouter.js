import express from "express";
import {
  registerViews,
  createComment,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();
apiRouter.post("/video/:id([0-9a-f]{24})/view", registerViews);
apiRouter.post("/video/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/video/:id([0-9a-f]{24})/delete", deleteComment);

export default apiRouter;
