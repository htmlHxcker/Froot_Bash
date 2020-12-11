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

  mode: "intro",
  slingshotX: 140,
  slingshotY: 280,

  slingshotBandX: 140 + 25,
  slingshotBandY: 280 + 23,

  ended: false,

  score: 0,

  offsetLeft: 0,

  start() {
    game.hideScreens();

    // Display the Game Canvas and score.

    game.showScreen("game-canvas");
    game.showScreen("score-screen");

    game.mode = "intro";
    game.currentHero = undefined;

    game.offsetLeft = 0;
    game.ended = false;

    game.animationFrame = window.requestAnimationFrame(
      game.animate,
      game.canvas
    );
  },

  handleGameLogic() {
    game.offsetLeft++;
  },

  animate() {
    game.handleGameLogic();

    // Background Image
    game.context.drawImage(
      game.currentLevel.backgroundImage,
      game.offsetLeft / 4,
      0,
      game.canvas.width,
      game.canvas.height,
      0,
      0,
      game.canvas.width,
      game.canvas.height
    );

    // Foreground Image
    game.context.drawImage(
      game.currentLevel.foregroundImage,
      game.offsetLeft,
      0,
      game.canvas.width,
      game.canvas.height,
      0,
      0,
      game.canvas.width,
      game.canvas.height
    );

    // Base of the Slingshot
    game.context.drawImage(
      game.slingShotImage,
      game.slingshotX - game.offsetLeft,
      game.slingShotY
    );

    // Frontof the slingshot Image
    game.context.drawImage(
      game.slingShotFrontImage,
      game.slingshotX - game.offsetLeft,
      game.slingshotY
    );

    if (!game.ended) {
      game.animationFrame = window.requestAnimationFrame(
        game.animate,
        game.canvas
      );
    }
  },

};

//Level Select Screen
const levels = {
  data: [
    {
      foreground: "desert-foreground",
      background: "clouds-background",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "clouds-background",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "clouds-background",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "clouds-background",
      entities: [],
    },
    {
      foreground: "desert-foreground",
      background: "clouds-background",
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
    let level = levels.data[number];

    game.currentLevel.backgroundImage = loader.loadImage(
      `./Images/Background/${level.background}.png`
    );
    game.currentLevel.foregroundImage = loader.loadImage(
      `./Images/Background/${level.foreground}.png`
    );
    game.slingShotImage = loader.loadImage("./Images/slingshot.png");
    game.slingShotFrontImage = loader.loadImage("./Images/slingshot.png");

    loader.onload = game.start;
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

    loader.soundFileExtn = oggSupport ? ".ogg" : mp3support ? ".mp3" : undefined;
  },

  loadImage(url) {
    this.loaded = false;
    this.totalAssetsCount++;


    game.showScreen("loading-screen");

    const image = new Image();

    image.addEventListener("load", loader.itemLoaded, false);
    image.src = url;

    return image;
  },

  soundFileExtn: ".ogg",

  loadSound(url) {
    this.loaded = false;
    this.totalAssetsCount++;

    game.showScreen("loading-screen");

    const audio = new Audio();
    audio.addEventListener("canplaythrough", loader.itemLoaded, false);
    audio.src = url + loader.soundFileExtn;

    return audio;
  },

  itemLoaded(event) {
    event.target.removeEventListener(event.type, this.itemLoaded, false);
    loader.loadedAssetsCount++;

    document.getElementById(
      "loading-message"
    ).innerText = `Loaded ${loader.loadedAssetsCount}  of ${loader.totalAssetsCount}`;

    if (loader.loadedAssetsCount === loader.totalAssetsCount) {
      loader.loaded = true;
      loader.loadedAssetsCount = 0;
      loader.totalAssetsCount = 0;

      game.hideScreen("loading-screen");

      if (loader.onload) {
        loader.onload();
        loader.onload = undefined;
      }
    }
  },
};

const mouse = {
  x: 0,
  y: 0,
  down: false,
  dragging:false,

  init(){
    const canvas = document
  }
};

window.addEventListener("load", function () {
  game.init();
});
