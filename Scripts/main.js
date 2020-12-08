let game = {
  init() {
    game.canvas = document.getElementById("game-canvas");
    game.context = game.canvas.getContext("2d");
    levels.init();

    game.hideScreens();
    game.showScreen("game-start-screen");
  },

  hideScreens() {
    let screens = document.getElementsByClassName("game-layer");
    for (let i = 0; i < screens.length; i++) {
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

let levels = {
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
  ],

  init() {
    let levelSelectScreen = document.getElementById("level-select-screen");

    let buttonClickHandler = function () {
      game.hideScreen("level-select-screen");
      levels.load(this.value - 1);
    };

    for (let index = 0; index < levels.data.length; index++) {
      const button = document.createElement("input");

      button.type = "button";
      button.value = (index + 1);
      button.addEventListener("click", buttonClickHandler);

      levelSelectScreen.appendChild(button);
    }
  },

  load() {},
};

window.addEventListener("load", function () {
  game.init();
});
