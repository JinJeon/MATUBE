import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const flowBtn = document.getElementById("flowBtn");
const preview = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recordedFile.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 400, height: 400 },
  });
  preview.srcObject = stream;
  preview.play();
};
init();

const stopRecord = () => {
  if (recorder.state === "recording") {
    recorder.stop();
  }
  flowBtn.innerText = "DOWNLOAD";
  flowBtn.removeEventListener("click", stopRecord);
  flowBtn.addEventListener("click", downloadRecord);
};
const startRecord = () => {
  flowBtn.innerText = "STOP RECORD";
  flowBtn.removeEventListener("click", startRecord);
  flowBtn.addEventListener("click", stopRecord);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    preview.srcObject = null;
    preview.src = videoFile;
    preview.loop = true;
    preview.width = 400;
    preview.play();
  };
  recorder.start();
  setTimeout(() => stopRecord(), 3000);
};

const downloadRecord = async () => {
  flowBtn.removeEventListener("click", downloadRecord);
  flowBtn.innerText = "NOW TRANSCODING";
  flowBtn.disabled = true;
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "recordedFile.mp4");
  downloadFile(thumbUrl, "thumbFile.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);
  URL.revokeObjectURL(mp4Blob);
  URL.revokeObjectURL(thumbBlob);
  URL.revokeObjectURL(videoFile);

  flowBtn.disabled = false;
  flowBtn.innerText = "RECORD AGAIN";
  flowBtn.addEventListener("click", startRecord);
};

flowBtn.addEventListener("click", startRecord);
