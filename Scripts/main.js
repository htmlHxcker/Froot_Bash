const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2World = Box2D.Dynamics.b2World;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
const b2ContactListener = Box2D.Dynamics.b2ContactListener;

const game = {
  init() {
    game.canvas = document.getElementById("game-canvas");
    game.context = game.canvas.getContext("2d");
    //Object Initialization
    levels.init();
    loader.init();
    mouse.init();

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
  maxSpeed: 3,

  panTo(newCenter) {
    let minOffset = 0;
    let maxOffset =
      game.currentLevel.backgroundImage.width - game.canvas.width;

    let currentCenter = game.offsetLeft + game.canvas.width / 2;

    if (
      Math.abs(newCenter - currentCenter) > 0 &&
      game.offsetLeft <= maxOffset &&
      game.offsetLeft >= minOffset
    ) {
      let deltaX = (newCenter - currentCenter) / 2;

      if (Math.abs(deltaX) > game.maxSpeed) {
        deltaX = game.maxSpeed * Math.sign(deltaX);
      }
      if (Math.abs(deltaX) <= 1) {
        deltaX = newCenter - currentCenter;
      }

      game.offsetLeft += deltaX;

      if (game.offsetLeft <= minOffset) {
        game.offsetLeft = minOffset;
        return true;
      } else if (game.offsetLeft >= maxOffset) {
        game.offsetLeft = maxOffset;
        return true;
      }
    } else {
      return true;
    }
  },

  handleGameLogic() {
    if (game.mode === "intro") {
      if (game.panTo(700)) {
        game.mode = "load-next-hero";
      }
    }

    if (game.mode === "wait-for-firing") {
      if (mouse.dragging) {
        game.panTo(mouse.x + game.offsetLeft);
      } else {
        game.panTo(game.slingshotX);
      }
    }

    if (game.mode === "load-next-hero") {
      game.mode = "wait-for-firing";
    }

    if (game.mode === "firing") {
      
    }

    if (game.mode === "fired") {
      
    }

    if (game.mode === "fired") {
      
    }

    if (game.mode === "level-success" || game.mode === "level-failure") {
      
    }
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

    loader.soundFileExtn = oggSupport
      ? ".ogg"
      : mp3support
      ? ".mp3"
      : undefined;
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
  dragging: false,

  init() {
    const canvas = document.getElementById("game-canvas");

    canvas.addEventListener("mousemove", mouse.mousemoveHandler, false);
    canvas.addEventListener("mousedown", mouse.mousedownHandler, false);
    canvas.addEventListener("mouseup", mouse.mouseupHandler, false);
    canvas.addEventListener("mouseout", mouse.mouseupHandler, false);
  },

  mousemoveHandler(event) {
    const offset = game.canvas.getBoundingClientRect();
    mouse.x = event.clientX - offset.left;
    mouse.y = event.clientY - offset.top;

    if (mouse.down) {
      mouse.dragging = true;
    }

    event.preventDefault;
  },

  mousedownHandler(event) {
    mouse.down = true;

    event.preventDefault();
  },

  mouseupHandler(event) {
    mouse.down = false;
    mouse.dragging = false;

    event.preventDefault();
  },
};

window.addEventListener("load", function () {
  game.init();
});
