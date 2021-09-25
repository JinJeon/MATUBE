import mongoose from "mongoose";

// export const makeHashtags = (hashtags) =>
//   hashtags.split(",").map((word) => (word.startsWith("#")? word : `#${word}`))

const videoSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    ratings: { type: Number, default: 0, required: true },
  },
});

// videoSchema.pre('save', async function(){
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => (word.startsWith("#")? word : `#${word}`));
// })

videoSchema.static("makeHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const movieModel = mongoose.model("Video", videoSchema);
export default movieModel;
