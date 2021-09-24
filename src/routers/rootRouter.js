import express from "express";
import {
  userGetJoin,
  userPostJoin,
  userGetLogin,
  userPostLogin,
  userLogout,
} from "../controllers/userController";
import { videoTrend, videoSearch } from "../controllers/videoController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", videoTrend);
rootRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(userGetJoin)
  .post(userPostJoin);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(userGetLogin)
  .post(userPostLogin);
rootRouter.get("/logout", userLogout);
rootRouter.get("/search", videoSearch);

export default rootRouter;
