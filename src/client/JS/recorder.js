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
  recorder = new MediaRecorder(stream, { MimeType: "video/mp4" });
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    preview.srcObject = null;
    preview.src = videoFile;
    preview.loop = true;
    preview.play();
  };
  recorder.start();
};

const downloadRecord = () => {
  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "recordedFile.mp4";
  document.body.appendChild(a);
  a.click();
};

startBtn.addEventListener("click", startRecord);
