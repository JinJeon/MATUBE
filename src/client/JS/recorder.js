import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const startBtn = document.getElementById("startBtn");
const preview = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 50, height: 50 },
  });
  preview.srcObject = stream;
  preview.play();
};
init();

const stopRecord = () => {
  startBtn.innerText = "DOWNLOAD";
  startBtn.removeEventListener("click", stopRecord);
  startBtn.addEventListener("click", downloadRecord);
  recorder.stop();
};
const startRecord = () => {
  startBtn.innerText = "STOP RECORD";
  startBtn.removeEventListener("click", startRecord);
  startBtn.addEventListener("click", stopRecord);
  console.log(stream);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    console.log(videoFile);
    preview.srcObject = null;
    preview.src = videoFile;
    preview.loop = true;
    preview.play();
  };
  recorder.start();
};

const downloadRecord = async () => {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  ffmpeg.FS("writeFile", "recordedFile.webm", await fetchFile(videoFile));
  await ffmpeg.run("-i", "recordedFile.webm", "-r", "60", "output.mp4");
  const mp4File = ffmpeg.FS("readFile", "output.mp4");
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const a = document.createElement("a");
  a.href = mp4Url;
  a.download = "recordedFile.mp4";
  document.body.appendChild(a);
  a.click();
};

startBtn.addEventListener("click", startRecord);
