import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  text: { type: String, required: true, maxlength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Video",
  },
});

const commentModel = mongoose.model("Comment", commentSchema);

export default commentModel;
