const game = {
  init() {
    game.canvas = document.getElementById("game-canvas");
    game.context = game.canvas.getContext("2d");
    //Object Initialization
    levels.init();
    loader.init();

    game.hideScreens();
    game.showScreen("game-start-screen");
  },

  hideScreens() {
    let screens = document.getElementsByClassName("game-layer");
    for (let i = screens.length - 1; i > 0; i--) {
      const screen = screens[i];
      screen.style.display = "none";
    }
  },

  hideScreen(id) {
    let screen = document.getElementById(id);
    screen.style.display = "none";
  },

  showScreen(id) {
    let screen = document.getElementById(id);
    screen.style.display = "block";
  },

  showLevelScreen() {
    game.hideScreens();
    game.showScreen("level-select-screen");
  },
};

//Level Select Screen
const levels = {
  data: [
    {
      foreground: "desert-foreground",
      background: "level1",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "level2",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "level3",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "level4",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "level5",
      entities: [],
    },
  ],

  init() {
    let levelSelectScreen = document.getElementById("level-select-screen");

    let buttonClickHandler = function () {
      game.hideScreen("level-select-screen");

      levels.load(this.value - 1);
    };

    for (let index = 0; index < this.data.length; index++) {
      const button = document.createElement("input");

      button.type = "button";
      button.value = index + 1;
      button.addEventListener("click", buttonClickHandler);

      levelSelectScreen.appendChild(button);
    }
  },

  load(number) {
    game.currentLevel = { number: number };
    game.score = 0;

    document.getElementById("score").innerText = `Score: ${game.score}`;
    const level = levels.data[number];

    game.currentLevel.backgroundImage = loader.loadImage(
      `./Images/Background/${level.background}.png`
    );
    game.currentLevel.foregroundImage = loader.loadImage(
      `./Images/Background/${level.background}.png`
    );
  },
};

// Loading Select Screen
const loader = {
  loaded: true,
  loadedAssetsCount: 0,
  totalAssetsCount: 0,

  init() {
    let mp3support, oggSupport;
    let audio = document.createElement("audio");

    if (audio.canPlayType) {
      mp3Support = "" !== audio.canPlayType("audio/mpeg");
      oggSupport = "" !== audio.canPlayType('audio/ogg; codecs="vorbis"');
    } else {
      mp3support = false;
      oggSupport = false;
    }

    this.soundFileExtn = oggSupport ? ".ogg" : mp3support ? ".mp3" : undefined;
  },

  loadImage(url) {
    this.loaded = false;
    this.totalAssetsCount++;

    game.showScreen("loading-screen");

    const image = new Image();

    image.addEventListener("load", this.itemLoaded, false);
    image.src = url;

    return image;
  },

  soundFileExtn: ".ogg",

  loadSound(url) {
    this.loaded = false;
    this.totalAssetsCount++;

    game.showScreen("loading-screen");

    const audio = new Audio();
    audio.addEventListener("canplaythrough", this.itemLoaded, false);
    audio.src = url + this.soundFileExtn;

    return audio;
  },

  itemLoaded(event) {
    event.target.removeEventListener(event.type, this.itemLoaded, false);
    this.loadedAssetsCount++;

    document.getElementById(
      "loading-message"
    ).innerText = `Loaded {this.loadedAssetsCount}  of ${this.totalAssetsCount}`;

    if (this.loadedAssetsCount === this.totalAssetsCount) {
      this.loaded = true;
      this.loadedAssetsCount = 0;
      this.totalAssetsCount = 0;

      game.hideScreen("loading-screen");

      if (this.onload) {
        this.onload();
        this.onload = undefined;
      }
    }
  },
};

window.addEventListener("load", function () {
  game.init();
});
