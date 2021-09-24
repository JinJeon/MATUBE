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
  uploadFiles,
} from "../middlewares";

const userRouter = express.Router();

userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(userGetEdit)
  .post(uploadFiles.single("avatar"), userPostEdit);
userRouter.get("/delete", protectorMiddleware, userDelete);
userRouter.get("/:id(\\d+)", userSee);
userRouter.get("/github/login", publicOnlyMiddleware, userGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, userGithubFinish);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
// userRouter.use("/useruser", useruserRouter);

export default userRouter;
