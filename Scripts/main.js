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
    let maxOffset = game.currentLevel.backgroundImage.width - game.canvas.width;

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
      entities: [
        {
          type: "ground",
          name: "dirt",
          x: 500,
          y: 440,
          width: 1000,
          height: 20,
          isStatic: true,
        },

        {
          type: "ground",
          name: "wood",
          x: 190,
          y: 390,
          width: 30,
          height: 80,
          isStatic: true,
        },
        {
          type: "block",
          name: "wood",
          x: 500,
          y: 380,
          angle: 90,
          width: 100,
          height: 25,
        },
        {
          type: "block",
          name: "glass",
          x: 500,
          y: 280,
          angle: 90,
          width: 100,
          height: 25,
        },
        { type: "villain", name: "burger", x: 500, y: 205, calories: 590 },
        {
          type: "block",
          name: "wood",
          x: 800,
          y: 380,
          angle: 90,
          width: 100,
          height: 25,
        },
        {
          type: "block",
          name: "glass",
          x: 800,
          y: 280,
          angle: 90,
          width: 100,
          height: 25,
        },
        { type: "villain", name: "fries", x: 800, y: 205, calories: 420 },
        { type: "hero", name: "orange", x: 80, y: 405 },
        { type: "hero", name: "apple", x: 140, y: 405 },
      ],
    },
    {
      foreground: "desert-foreground",
      background: "clouds-background",
      entities: [
        {
          type: "ground",
          name: "dirt",
          x: 500,
          y: 440,
          width: 1000,
          height: 20,
          isStatic: true,
        },
        {
          type: "ground",
          name: "wood",
          x: 190,
          y: 390,
          width: 30,
          height: 80,
          isStatic: true,
        },
        {
          type: "block",
          name: "wood",
          x: 850,
          y: 380,
          angle: 90,
          width: 100,
          height: 25,
        },
        {
          type: "block",
          name: "wood",
          x: 700,
          y: 380,
          angle: 90,
          width: 1000,
          height: 25,
        },
        {
          type: "block",
          name: "wood",
          x: 550,
          y: 380,
          angle: 90,
          width: 1000,
          height: 25,
        },
        {
          type: "block",
          name: "glass",
          x: 625,
          y: 316,
          width: 150,
          height: 25,
        },
        {
          type: "block",
          name: "glass",
          x: 775,
          y: 316,
          width: 150,
          height: 25,
        },
        {
          type: "block",
          name: "glass",
          x: 625,
          y: 252,
          angle: 90,
          width: 100,
          height: 25,
        },
        {
          type: "block",
          name: "glass",
          x: 775,
          y: 252,
          angle: 90,
          width: 100,
          height: 25,
        },
      ],
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

const box2d = {
  scale: 30,

  init() {
    const gravity = new b2Vec2(0, 9.8);
    let allowSleep = true;
    box2d.world = new b2World(gravity, allowSleep);
  },

  createRectangle(entity, definition) {
    const bodyDef = new b2BodyDef();

    if (entity.isStatic) {
      bodyDef.type = b2Body.b2_staticBody;
    }
    bodyDef.type = b2Body.b2_dynamicBody;

    bodyDef.position.x = entity.x / box2d.scale;
    bodyDef.position.y = entity.y / box2d.scale;

    if (entity.angle) {
      bodyDef.angle = (Math.PI * entity.angle) / 180;
    }

    const fixtureDef = new b2FixtureDef();
    fixtureDef.density = definition.density;
    fixtureDef.friction = definition.friction;
    fixtureDef.restitution = definition.restitution;

    fixtureDef.shape = new b2PolygonShape();
    fixtureDef.shape.setAsBox(
      entity.width / 2 / box2d.scale,
      entity.height / 2 / box2d.scale
    );

    const body = box2d.world.CreateBody(bodyDef);

    body.SetUserDaya(entity);
    body.createFixture(fixtureDef);

    return body;
  },

  createCircle(entity, definition) {
    const bodyDef = new b2BodyDef();

    if (entity.isStatic) {
      bodyDef.type = b2Body.b2_staticBody;
    }
    bodyDef.type = b2Body.b2_dynamicBody;

    bodyDef.position.x = entity.x / box2d.scale;
    bodyDef.position.y = entity.y / box2d.scale;

    if (entity.angle) {
      bodyDef.angle = (Math.PI * entity.angle) / 180;
    }

    const fixtureDef = new b2FixtureDef();

    fixtureDef.density = definition.density;
    fixtureDef.friction = definition.friction;
    fixtureDef.restitution = definition.restitution;
    fixtureDef.shape = new b2CircleShape(entity.radius / box2d.scale);

    const body = box2d.world.CreateBody(bodyDef);
    body.SetUserData(entity);
    body.CreateFixture(fixtureDef);
    return body;
  },
};

window.addEventListener("load", function () {
  game.init();
});
