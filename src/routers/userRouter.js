import express from "express";
import {
  userGetEdit,
  userPostEdit,
  userDelete,
  userSee,
  userGithubLogin,
  userGithubFinish,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  uploadAvatar,
} from "../middlewares";

const userRouter = express.Router();

userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(userGetEdit)
  .post(uploadAvatar.single("avatar"), userPostEdit);
// single 안에는 name을 입력함
userRouter.get("/delete", protectorMiddleware, userDelete);
userRouter.get("/:id([0-9a-f]{24})", userSee);
userRouter.get("/github/login", publicOnlyMiddleware, userGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, userGithubFinish);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
// userRouter.use("/useruser", useruserRouter);

export default userRouter;
