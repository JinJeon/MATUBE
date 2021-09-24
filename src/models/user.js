import bcrypt from "bcrypt";
import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  password: { type: String },
  location: { type: String },
  socialOnly: { type: Boolean, default: false },
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 5);
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
