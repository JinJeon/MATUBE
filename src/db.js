import mongoose from "mongoose";
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
const handleOpen = () => console.log("Connected on DB🌙");

db.on("error", (error) => console.log("DB error : ", error));
db.once("open", handleOpen);
