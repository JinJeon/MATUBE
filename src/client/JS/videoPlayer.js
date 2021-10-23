const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeLine = document.getElementById("timeline");
const fullScreen = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoController = document.getElementById("videoController");

const playBtnIcon = playBtn.querySelector("i");
const muteBtnIcon = muteBtn.querySelector("i");
const fullScreenIcon = fullScreen.querySelector("i");

let timeoutControl = null;
let movementTimeoutControl = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (seconds) =>
  // new Date(seconds * 1000).toISOString().substr(11, 8);
  new Date(seconds * 1000).toISOString().substr(14, 5);

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  // playBtn.innerText = video.paused ? "PLAY" : "PAUSE";
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  // muteBtn.innerText = video.muted ? "UNMUTE" : "MUTE";
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

// const handleMuteBtn = () => {
//   muteBtnIcon.classList = video.muted
//     ? "fas fa-volume-mute"
//     : "fas fa-volume-up";
//   volumeRange.value = video.muted ? 0 : volumeValue;
// };

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  }
  volumeValue = Number(value);
  video.volume = value;
  if (volumeValue === 0) {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
  }
};

const handleLoadedMetaData = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  console.log(video.duration);
  timeLine.max = Math.floor(video.duration);
};

const handleTimeupdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeLine.value = Math.floor(video.currentTime);
};

const handleTimeLineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreenElement = document.fullscreenElement;
  if (fullscreenElement) {
    document.exitFullscreen();
    // fullScreen.innerText = "ENTER FULL";
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    // fullScreen.innerText = "EXIT FULL";
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideController = () => videoController.classList.remove("showing");

const handleMousemove = () => {
  if (timeoutControl) {
    clearTimeout(timeoutControl);
    timeoutControl = null;
  }
  if (movementTimeoutControl) {
    clearTimeout(movementTimeoutControl);
    movementTimeoutControl = null;
  }
  videoController.classList.add("showing");
  movementTimeoutControl = setTimeout(hideController, 3000);
};
const handleMouseleave = () => {
  timeoutControl = setTimeout(hideController, 1000);
};
const handleSpaceBar = (event) => {
  if (event.code === "Space") {
    // if (video.paused) {
    //   video.play();
    // } else {
    //   video.pause();
    // }
    handlePlayClick();
  }
};
const handleVideoFinish = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/video/${id}/view`, { method: "POST" });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
// video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("loadeddata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeupdate);
timeLine.addEventListener("input", handleTimeLineChange);
fullScreen.addEventListener("click", handleFullScreen);
// video.addEventListener("mousemove", handleMousemove);
// video.addEventListener("mouseleave", handleMouseleave);
videoContainer.addEventListener("mousemove", handleMousemove);
videoContainer.addEventListener("mouseleave", handleMouseleave);
videoContainer.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleVideoFinish);

const keyHandler = (keyNumber, handler) => {
  document.addEventListener("keydown", (e) => {
    if (e.keyCode === keyNumber) {
      handler();
    }
  });
};
keyHandler(32, handlePlayClick);
keyHandler(77, handleMute);
