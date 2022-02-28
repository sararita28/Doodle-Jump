const grid = document.querySelector(".grid");
const doodler = document.createElement("div");
const startBtn = document.createElement("button");
startBtn.classList.add("startBtn");
startBtn.innerHTML = "START";
const gameOverSound = new Audio("./sounds/gameOver.mp3");
const jumpSound = new Audio("./sounds/jump.mp3");
const difficultyDiv = document.querySelector(".difficulty");
const easy = document.getElementById("easy");
const hard = document.getElementById("hard");
const launchSong = new Audio("./sounds/doodleSong.mp3");
const doodleHi = document.createElement("img");
doodleHi.src = "./images/doodle-hi.gif";
doodleHi.classList.add("doodleHi");
const header = document.createElement("div");
header.classList.add("header");
header.innerHTML = "Doodle Jump!";
const doodleCry = document.createElement("img");
doodleCry.src = "./images/doodle-crying.gif";
doodleCry.classList.add("doodleCry");

function start() {
  launchSong.pause();
  difficultyDiv.style.display = "none";
  if (!isGameOver) {
    createPlatforms();
    createDoodler();
    document.addEventListener("keydown", control);
    setInterval(movePlatforms, 30);
    jump();
  }
}

//start to play when we click on 'Start'
startBtn.addEventListener("click", () => {
  score = 0;
  isGameOver = false;
  platforms = [];
  doodler.remove();
  clearInterval(movePlatforms);
  clearInterval(upTimerId);
  grid.innerHTML = "";
  start();
});

// create a function that you will call right away on window launch
function onLaunch() {
  grid.append(header);
  grid.append(doodleHi);
  grid.append(startBtn);
  window.onload(launchSong.play());
}

window.onload = onLaunch;

//Variables definitions
let [doodlerLeftSpace, startPoint] = [50, 150];
//have your doodler's initial position start at the first platform
let doodlerBottomSpace = startPoint;
let [noOfPlatforms, score] = [5, 0];
let [gridWidth, gridHeight, doodlerWidth, doodlerHeight, gridWminusPlatW] = [
  400, 600, 85, 85, 315,
];
let upTimerId, downTimerId, leftTimerId, rightTimerId;
let isJumping = true;
let goLeft,
  goRight,
  isGameOver = false;
let platforms = [];
let difficultyLevel = 20;

//difficulty levels
function easyMode() {
  hard.style.borderColor = "black";
  easy.style.borderColor = "yellow";
  difficultyLevel = 20;
}

function hardMode() {
  easy.style.borderColor = "black";
  hard.style.borderColor = "yellow";
  difficultyLevel = 15;
}

//function to create a doodler
function createDoodler() {
  grid.appendChild(doodler);
  doodler.classList.add("doodler");
  doodlerLeftSpace = platforms[0].left;
  doodler.style.left = doodlerLeftSpace + "px";
  doodler.style.bottom = doodlerBottomSpace + "px";
}

//class to construct a platform
class Platform {
  constructor(newPlatformBottom) {
    this.bottom = newPlatformBottom;
    this.left = Math.random() * gridWminusPlatW;
    this.visual = document.createElement("div");
    const visual = this.visual;
    visual.classList.add("platform");
    visual.style.left = this.left + "px";
    visual.style.bottom = this.bottom + "px";
    grid.appendChild(visual);
  }
}

//function to create platforms
function createPlatforms() {
  for (let i = 0; i < noOfPlatforms; i++) {
    let platformGap = gridHeight / noOfPlatforms;
    let newPlatformBottom = 100 + i * platformGap;
    let newPlatform = new Platform(newPlatformBottom);
    platforms.push(newPlatform);
  }
}

//function to move the platforms (if the doodler jumps a certain height, remove the old platforms and add new ones)
function movePlatforms() {
  if (doodlerBottomSpace > 200) {
    platforms.forEach((platform) => {
      platform.bottom -= 4;
      let visual = platform.visual;
      visual.style.bottom = platform.bottom + "px";
      if (platform.bottom < 10) {
        let firstPlatform = platforms[0].visual;
        firstPlatform.classList.remove("platform");
        platforms.shift();
        score++;
        let newPlatform = new Platform(gridHeight);
        platforms.push(newPlatform);
      }
    });
  }
}

function jump() {
  clearInterval(downTimerId);
  isJumping = true;
  upTimerId = setInterval(() => {
    doodlerBottomSpace += 20;
    doodler.style.bottom = doodlerBottomSpace + "px";
    if (
      doodlerBottomSpace > startPoint + 200 ||
      doodlerBottomSpace > gridHeight - doodlerHeight
    ) {
      fall();
    }
  }, difficultyLevel);
}

function fall() {
  clearInterval(upTimerId);
  isJumping = false;
  downTimerId = setInterval(() => {
    doodlerBottomSpace -= 5;
    doodler.style.bottom = doodlerBottomSpace + "px";
    if (doodlerBottomSpace <= 0) gameOver();
    platforms.forEach((platform) => {
      if (
        doodlerBottomSpace >= platform.bottom &&
        doodlerBottomSpace <= platform.bottom + 15 &&
        doodlerLeftSpace + doodlerWidth >= platform.left &&
        doodlerLeftSpace <= platform.left + 85 &&
        !isJumping
      ) {
        startPoint = doodlerBottomSpace;
        jump();
        jumpSound.play();
      }
    });
  }, difficultyLevel);
}

function moveLeft() {
  if (goRight) {
    clearInterval(rightTimerId);
    goRight = false;
  }
  goLeft = true;
  leftTimerId = setInterval(() => {
    if (doodlerLeftSpace >= 0) {
      doodlerLeftSpace -= 1;
      doodler.style.left = doodlerLeftSpace + "px";
    } //else moveRight();
  });
}

function moveRight() {
  if (goLeft) {
    clearInterval(leftTimerId);
    goLeft = false;
  }
  goRight = true;
  rightTimerId = setInterval(() => {
    if (doodlerLeftSpace <= gridWidth - doodlerWidth) {
      doodlerLeftSpace += 1;
      doodler.style.left = doodlerLeftSpace + "px";
    } //else moveLeft();
  });
}

function moveUp() {
  goLeft = false;
  goRight = false;
  clearInterval(leftTimerId);
  clearInterval(rightTimerId);
}

function control(e) {
  if (e.key == "ArrowLeft") {
    moveLeft();
  } else if (e.key == "ArrowRight") {
    moveRight();
  } else if (e.key == "ArrowUp") {
    moveUp();
  }
}

function gameOver() {
  gameOverSound.play();
  isGameOver = true;
  difficultyDiv.style.display = "grid";
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  const finalScore = document.createElement("div");
  finalScore.innerHTML = `Final score: ${score}`;
  grid.append(finalScore);
  grid.append(doodleCry);
  grid.append(startBtn);
  clearInterval(upTimerId);
  clearInterval(downTimerId);
  clearInterval(leftTimerId);
  clearInterval(rightTimerId);
}
