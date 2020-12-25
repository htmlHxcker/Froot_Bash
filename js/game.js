let b2Vec2 = Box2D.Common.Math.b2Vec2;
let b2BodyDef = Box2D.Dynamics.b2BodyDef;
let b2Body = Box2D.Dynamics.b2Body;
let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
let b2World = Box2D.Dynamics.b2World;
let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
let b2ContactListener = Box2D.Dynamics.b2ContactListener;

let game = {
	init() {
		game.canvas = document.getElementById('gamecanvas');
		game.context = game.canvas.getContext('2d');

		levels.init();
		loader.init();
		mouse.init();

		game.loadSounds(function () {
			game.hideScreens();
			game.showScreen('gamestartscreen');
		});
	},

	resize() {
		let maxWidth = window.innerWidth;
		let maxHeight = window.innerHeight;
		let scale = Math.min(maxWidth / 640, maxHeight / 480);
		let gameContainer = document.getElementById('gamecontainer');
		gameContainer.style.transform =
			'translate(-50%, -50%) ' + 'scale(' + scale + ')';
		var width = Math.max(640, Math.min(1024, maxWidth / scale));
		gameContainer.style.width = width + 'px';
		var gameCanvas = document.getElementById('gamecanvas');
		gameCanvas.width = width;
		game.scale = scale;
	},

	playGame() {
		if (window.wAudio) {
			window.wAudio.playMutedSound();
		}
		game.showLevelScreen();
    },
    
	loadSounds(onload) {
		game.backgroundMusic = loader.loadSound('audio/dynamite');

		game.slingshotReleasedSound = loader.loadSound('audio/released');
		game.bounceSound = loader.loadSound('audio/bounce');
		game.breakSound = {
			glass: loader.loadSound('audio/glassbreak'),
			wood: loader.loadSound('audio/woodbreak'),
		};

		loader.onload = onload;
	},

	startBackgroundMusic() {
		game.backgroundMusic.play();
		game.setBackgroundMusicButton();
	},

	stopBackgroundMusic() {
		game.backgroundMusic.pause();

		game.backgroundMusic.currentTime = 0;

		game.setBackgroundMusicButton();
	},

	toggleBackgroundMusic() {
		if (game.backgroundMusic.paused) {
			game.backgroundMusic.play();
		} else {
			game.backgroundMusic.pause();
		}

		game.setBackgroundMusicButton();
	},

	setBackgroundMusicButton() {
		let toggleImage = document.getElementById('togglemusic');

		if (game.backgroundMusic.paused) {
			toggleImage.src = 'images/icons/nosound.png';
		} else {
			toggleImage.src = 'images/icons/sound.png';
		}
	},

	hideScreens() {
		let screens = document.getElementsByClassName('gamelayer');

		for (let i = screens.length - 1; i >= 0; i--) {
			let screen = screens[i];

			screen.style.display = 'none';
		}
	},

	hideScreen(id) {
		let screen = document.getElementById(id);

		screen.style.display = 'none';
	},

	showScreen(id) {
		let screen = document.getElementById(id);

		screen.style.display = 'block';
	},

	showLevelScreen() {
		game.hideScreens();
		game.showScreen('levelselectscreen');
	},

	restartLevel() {
		window.cancelAnimationFrame(game.animationFrame);
		game.lastUpdateTime = undefined;
		levels.load(game.currentLevel.number);
	},

	startNextLevel() {
		window.cancelAnimationFrame(game.animationFrame);
		game.lastUpdateTime = undefined;
		levels.load(game.currentLevel.number + 1);
	},

	mode: 'intro',

	slingshotX: 140,
	slingshotY: 280,

	slingshotBandX: 140 + 55,
	slingshotBandY: 280 + 23,

	ended: false,

	score: 0,

	offsetLeft: 0,

	start() {
		game.hideScreens();

		game.showScreen('gamecanvas');
		game.showScreen('scorescreen');

		game.mode = 'intro';
		game.currentHero = undefined;

		game.offsetLeft = 0;
		game.ended = false;

		game.animationFrame = window.requestAnimationFrame(
			game.animate,
			game.canvas
		);

		game.startBackgroundMusic();
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
		}
		return true;
	},

	heroes: undefined,
	villains: undefined,
	countHeroesAndVillains() {
		game.heroes = [];
		game.villains = [];
		for (let body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
			let entity = body.GetUserData();

			if (entity) {
				if (entity.type === 'hero') {
					game.heroes.push(body);
				} else if (entity.type === 'villain') {
					game.villains.push(body);
				}
			}
		}
	},

	handleGameLogic() {
		if (game.mode === 'intro') {
			if (game.panTo(700)) {
				game.mode = 'load-next-hero';
			}
		}

		if (game.mode === 'wait-for-firing') {
			if (mouse.dragging) {
				if (game.mouseOnCurrentHero()) {
					game.mode = 'firing';
				} else {
					game.panTo(mouse.x + game.offsetLeft);
				}
			} else {
				game.panTo(game.slingshotX);
			}
		}

		if (game.mode === 'firing') {
			if (mouse.down) {
				game.panTo(game.slingshotX);

				let distance = Math.pow(
					Math.pow(mouse.x - game.slingshotBandX + game.offsetLeft, 2) +
						Math.pow(mouse.y - game.slingshotBandY, 2),
					0.5
				);
				let angle = Math.atan2(
					mouse.y - game.slingshotBandY,
					mouse.x - game.slingshotBandX
				);

				let minDragDistance = 10;
				let maxDragDistance = 120;
				let maxAngle = (Math.PI * 145) / 180;

				if (angle > 0 && angle < maxAngle) {
					angle = maxAngle;
				}
				if (angle < 0 && angle > -maxAngle) {
					angle = -maxAngle;
				}
				if (distance > maxDragDistance) {
					distance = maxDragDistance;
				}

				if (mouse.x + game.offsetLeft > game.slingshotBandX) {
					distance = minDragDistance;
					angle = Math.PI;
				}

				game.currentHero.SetPosition({
					x:
						(game.slingshotBandX +
							distance * Math.cos(angle) +
							game.offsetLeft) /
						box2d.scale,
					y: (game.slingshotBandY + distance * Math.sin(angle)) / box2d.scale,
				});
			} else {
				game.mode = 'fired';
				let impulseScaleFactor = 0.8;
				let heroPosition = game.currentHero.GetPosition();
				let heroPositionX = heroPosition.x * box2d.scale;
				let heroPositionY = heroPosition.y * box2d.scale;

				let impulse = new b2Vec2(
					(game.slingshotBandX - heroPositionX) * impulseScaleFactor,
					(game.slingshotBandY - heroPositionY) * impulseScaleFactor
				);

				game.currentHero.ApplyImpulse(
					impulse,
					game.currentHero.GetWorldCenter()
				);

				game.currentHero.SetAngularDamping(2);

				game.slingshotReleasedSound.play();
			}
		}

		if (game.mode === 'fired') {
			let heroX = game.currentHero.GetPosition().x * box2d.scale;

			game.panTo(heroX);

			if (
				!game.currentHero.IsAwake() ||
				heroX < 0 ||
				heroX > game.currentLevel.foregroundImage.width
			) {
				box2d.world.DestroyBody(game.currentHero);
				game.currentHero = undefined;
				game.mode = 'load-next-hero';
			}
		}

		if (game.mode === 'load-next-hero') {
			game.countHeroesAndVillains();

			if (game.villains.length === 0) {
				game.mode = 'level-success';

				return;
			}

			if (game.heroes.length === 0) {
				game.mode = 'level-failure';

				return;
			}

			if (!game.currentHero) {
				game.currentHero = game.heroes[game.heroes.length - 1];

				let heroStartX = 180;
				let heroStartY = 180;

				game.currentHero.SetPosition({
					x: heroStartX / box2d.scale,
					y: heroStartY / box2d.scale,
				});
				game.currentHero.SetLinearVelocity({ x: 0, y: 0 });
				game.currentHero.SetAngularVelocity(0);

				game.currentHero.SetAwake(true);
			}
			game.panTo(game.slingshotX);
			if (!game.currentHero.IsAwake()) {
				game.mode = 'wait-for-firing';
			}
		}

		if (game.mode === 'level-success' || game.mode === 'level-failure') {
			if (game.panTo(0)) {
				game.ended = true;
				game.showEndingScreen();
			}
		}
	},

	mouseOnCurrentHero() {
		if (!game.currentHero) {
			return false;
		}

		let position = game.currentHero.GetPosition();

		let distanceSquared =
			Math.pow(position.x * box2d.scale - mouse.x - game.offsetLeft, 2) +
			Math.pow(position.y * box2d.scale - mouse.y, 2);

		let radiusSquared = Math.pow(game.currentHero.GetUserData().radius, 2);

		return distanceSquared <= radiusSquared;
	},

	animate() {
		let currentTime = new Date().getTime();

		if (game.lastUpdateTime) {
			let timeStep = (currentTime - game.lastUpdateTime) / 1000;

			box2d.step(timeStep);

			game.maxSpeed = Math.round(timeStep * 3 * 60);
		}

		game.lastUpdateTime = currentTime;

		game.handleGameLogic();

		game.removeDeadBodies();

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

		game.context.drawImage(
			game.slingshotImage,
			game.slingshotX - game.offsetLeft,
			game.slingshotY
		);

		game.drawAllBodies();

		if (game.mode === 'firing') {
			game.drawSlingshotBand();
		}

		game.context.drawImage(
			game.slingshotFrontImage,
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

	drawAllBodies() {
		if (box2d.debugCanvas) {
			box2d.world.DrawDebugData();
		}

		for (let body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
			let entity = body.GetUserData();

			if (entity) {
				entities.draw(entity, body.GetPosition(), body.GetAngle());
			}
		}
	},

	drawSlingshotBand() {
		game.context.strokeStyle = 'rgb(68,31,11)';
		game.context.lineWidth = 7;

		let radius = game.currentHero.GetUserData().radius + 1;
		let heroX = game.currentHero.GetPosition().x * box2d.scale;
		let heroY = game.currentHero.GetPosition().y * box2d.scale;
		let angle = Math.atan2(
			game.slingshotBandY - heroY,
			game.slingshotBandX - heroX
		);

		let heroFarEdgeX = heroX - radius * Math.cos(angle);
		let heroFarEdgeY = heroY - radius * Math.sin(angle);

		game.context.beginPath();
		game.context.moveTo(
			game.slingshotBandX - game.offsetLeft,
			game.slingshotBandY
		);

		game.context.lineTo(heroX - game.offsetLeft, heroY);
		game.context.stroke();

		entities.draw(
			game.currentHero.GetUserData(),
			game.currentHero.GetPosition(),
			game.currentHero.GetAngle()
		);

		game.context.beginPath();
		game.context.moveTo(heroFarEdgeX - game.offsetLeft, heroFarEdgeY);

		game.context.lineTo(
			game.slingshotBandX - game.offsetLeft - 40,
			game.slingshotBandY + 15
		);
		game.context.stroke();
	},

	removeDeadBodies() {
		for (let body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
			let entity = body.GetUserData();

			if (entity) {
				let entityX = body.GetPosition().x * box2d.scale;

				if (
					entityX < 0 ||
					entityX > game.currentLevel.foregroundImage.width ||
					(entity.health !== undefined && entity.health <= 0)
				) {
					box2d.world.DestroyBody(body);

					if (entity.type === 'villain') {
						game.score += entity.calories;
						document.getElementById('score').innerHTML = 'Score: ' + game.score;
					}

					if (entity.breakSound) {
						entity.breakSound.play();
					}
				}
			}
		}
	},

	showEndingScreen() {
		let playNextLevel = document.getElementById('playnextlevel');
		let endingMessage = document.getElementById('endingmessage');

		if (game.mode === 'level-success') {
			if (game.currentLevel.number < levels.data.length - 1) {
				endingMessage.innerHTML = 'Level Complete. Well Done!!!';
				playNextLevel.style.display = 'block';
			} else {
				endingMessage.innerHTML = 'All Levels Complete. Well Done!!!';
				playNextLevel.style.display = 'none';
			}
		} else if (game.mode === 'level-failure') {
			endingMessage.innerHTML = 'Failed. Play Again?';
			playNextLevel.style.display = 'none';
		}

		game.showScreen('endingscreen');

		game.stopBackgroundMusic();
	},

	step(timeStep) {
		if (timeStep > 1 / 30) {
			timeStep = 1 / 30;
		}

		box2d.world.Step(timeStep, 8, 3);
	},
};

let levels = {
	data: [
		{
			foreground: 'desert-foreground',
			background: 'clouds-background',
			entities: [
				{
					type: 'ground',
					name: 'dirt',
					x: 500,
					y: 440,
					width: 1000,
					height: 20,
					isStatic: true,
				},
				{
					type: 'ground',
					name: 'wood',
					x: 190,
					y: 390,
					width: 30,
					height: 80,
					isStatic: true,
				},

				{
					type: 'block',
					name: 'wood',
					x: 500,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 500,
					y: 280,
					angle: 90,
					width: 100,
					height: 25,
				},
				{ type: 'villain', name: 'burger', x: 500, y: 205, calories: 590 },

				{
					type: 'block',
					name: 'wood',
					x: 800,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 800,
					y: 280,
					angle: 90,
					width: 100,
					height: 25,
				},
				{ type: 'villain', name: 'fries', x: 800, y: 205, calories: 420 },

				{ type: 'hero', name: 'orange', x: 80, y: 405 },
				{ type: 'hero', name: 'apple', x: 140, y: 405 },
			],
		},		
		{
			// Second level
			foreground: 'desert-foreground',
			background: 'clouds-background',
			entities: [
				// The ground
				{
					type: 'ground',
					name: 'dirt',
					x: 500,
					y: 440,
					width: 1000,
					height: 20,
					isStatic: true,
				},
				// The slingshot wooden frame
				{
					type: 'ground',
					name: 'wood',
					x: 190,
					y: 390,
					width: 30,
					height: 80,
					isStatic: true,
				},

				{
					type: 'block',
					name: 'wood',
					x: 850,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'wood',
					x: 700,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'wood',
					x: 550,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 625,
					y: 316,
					width: 150,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 775,
					y: 316,
					width: 150,
					height: 25,
				},

				{
					type: 'block',
					name: 'glass',
					x: 625,
					y: 252,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 775,
					y: 252,
					angle: 90,
					width: 100,
					height: 25,
				},
				{ type: 'block', name: 'wood', x: 700, y: 190, width: 150, height: 25 },

				{ type: 'villain', name: 'burger', x: 700, y: 152, calories: 590 },
				{ type: 'villain', name: 'fries', x: 625, y: 405, calories: 420 },
				{ type: 'villain', name: 'sodacan', x: 775, y: 400, calories: 150 },

				{ type: 'hero', name: 'strawberry', x: 30, y: 415 },
				{ type: 'hero', name: 'orange', x: 80, y: 405 },
				{ type: 'hero', name: 'apple', x: 140, y: 405 },
			],
		},
		{
			// Third level
			foreground: 'desert-foreground',
			background: 'clouds-background',
			entities: [
				// The ground
				{
					type: 'ground',
					name: 'dirt',
					x: 500,
					y: 440,
					width: 1000,
					height: 20,
					isStatic: true,
				},
				// The slingshot wooden frame
				{
					type: 'ground',
					name: 'wood',
					x: 190,
					y: 390,
					width: 30,
					height: 80,
					isStatic: true,
				},

				{
					type: 'block',
					name: 'wood',
					x: 850,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},

				{
					type: 'block',
					name: 'wood',
					x: 700,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'wood',
					x: 550,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'wood',
					x: 400,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 625,
					y: 316,
					width: 150,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 480,
					y: 316,
					width: 150,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 775,
					y: 316,
					width: 150,
					height: 25,
				},

				{
					type: 'block',
					name: 'glass',
					x: 625,
					y: 252,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 775,
					y: 252,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 480,
					y: 252,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'wood',
					x: 700,
					y: 190,
					width: 150,
					height: 25,
				},
				{
					type: 'block',
					name: 'wood',
					x: 550,
					y: 190,
					width: 150,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 552,
					y: 152,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 700,
					y: 152,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'wood',
					x: 625,
					y: 100,
					width: 155,
					height: 25,
				},

				{ type: 'villain', name: 'fries', x: 630, y: 154, calories: 590 },
				{ type: 'villain', name: 'fries', x: 625, y: 405, calories: 420 },
				{ type: 'villain', name: 'sodacan', x: 775, y: 400, calories: 150 },
				{ type: 'villain', name: 'burger', x: 480, y: 400, calories: 150 },
				{ type: 'villain', name: 'sodaglass', x: 500, y: 220, calories: 150 },
				{ type: 'villain', name: 'sodacan', x: 700, y: 250, calories: 150 },

				{ type: 'hero', name: 'strawberry', x: 30, y: 415 },
				{ type: 'hero', name: 'orange', x: 80, y: 405 },
				{ type: 'hero', name: 'apple', x: 140, y: 405 },
				{ type: 'hero', name: 'pineapple', x: 180, y: 405 },
			],
		},{
			foreground: 'desert-foreground',
			background: 'clouds-background',
			entities: [
				{
					type: 'ground',
					name: 'dirt',
					x: 500,
					y: 440,
					width: 1000,
					height: 20,
					isStatic: true,
				},
				{
					type: 'ground',
					name: 'wood',
					x: 190,
					y: 390,
					width: 30,
					height: 80,
					isStatic: true,
				},

				{
					type: 'block',
					name: 'wood',
					x: 500,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 500,
					y: 280,
					angle: 90,
					width: 100,
					height: 25,
				},
				{ type: 'villain', name: 'burger', x: 500, y: 205, calories: 590 },

				{
					type: 'block',
					name: 'wood',
					x: 800,
					y: 380,
					angle: 90,
					width: 100,
					height: 25,
				},
        {
					type: 'block',
					name: 'wood',
					x: 800,
					y: 380,
					width: 400,
					height: 25,
				},
				{
					type: 'block',
					name: 'glass',
					x: 800,
					y: 280,
					angle: 90,
					width: 100,
					height: 25,
				},
				{ type: 'villain', name: 'fries', x: 800, y: 205, calories: 420 },

				{ type: 'hero', name: 'orange', x: 80, y: 405 },
				{ type: 'hero', name: 'apple', x: 140, y: 405 },
			],
		},
	],

	init() {
		let levelSelectScreen = document.getElementById('levelselectscreen');

		let buttonClickHandler = function () {
			game.hideScreen('levelselectscreen');

			levels.load(this.value - 1);
		};

		for (let i = 0; i < levels.data.length; i++) {
			let button = document.createElement('input');

			button.type = 'button';
			button.value = i + 1;
			button.addEventListener('click', buttonClickHandler);

			levelSelectScreen.appendChild(button);
		}
	},

	load(number) {
		box2d.init();

		game.currentLevel = { number: number, hero: [] };
		game.score = 0;

		document.getElementById('score').innerHTML = 'Score: ' + game.score;
		let level = levels.data[number];

		game.currentLevel.backgroundImage = loader.loadImage(
			'images/backgrounds/' + level.background + '.png'
		);
		game.currentLevel.foregroundImage = loader.loadImage(
			'images/backgrounds/' + level.foreground + '.png'
		);
		game.slingshotImage = loader.loadImage('images/slingshot.png');
		game.slingshotFrontImage = loader.loadImage('images/slingshot-front.png');

		for (let i = level.entities.length - 1; i >= 0; i--) {
			let entity = level.entities[i];

			entities.create(entity);
		}

		loader.onload = game.start;
	},
};

let loader = {
	loaded: true,
	loadedCount: 0,
	totalCount: 0,

	init() {
		let mp3Support, oggSupport;
		let audio = document.createElement('audio');

		if (audio.canPlayType) {
			mp3Support = '' !== audio.canPlayType('audio/mpeg');
			oggSupport = '' !== audio.canPlayType('audio/ogg; codecs="vorbis"');
		} else {
			mp3Support = false;
			oggSupport = false;
		}
		loader.soundFileExtn = oggSupport
			? '.ogg'
			: mp3Support
			? '.mp3'
			: undefined;
	},

	loadImage(url) {
		this.loaded = false;
		this.totalCount++;

		game.showScreen('loadingscreen');

		let image = new Image();

		image.addEventListener('load', loader.itemLoaded, false);
		image.src = url;

		return image;
	},

	soundFileExtn: '.ogg',

	loadSound(url) {
		this.loaded = false;
		this.totalCount++;

		game.showScreen('loadingscreen');

		let audio = new (window.wAudio || Audio)();

		audio.addEventListener('canplaythrough', loader.itemLoaded, false);
		audio.src = url + loader.soundFileExtn;

		return audio;
	},

	itemLoaded(ev) {
		ev.target.removeEventListener(ev.type, loader.itemLoaded, false);

		loader.loadedCount++;

		document.getElementById('loadingmessage').innerHTML =
			'Loaded ' + loader.loadedCount + ' of ' + loader.totalCount;

		if (loader.loadedCount === loader.totalCount) {
			loader.loaded = true;
			loader.loadedCount = 0;
			loader.totalCount = 0;

			game.hideScreen('loadingscreen');

			if (loader.onload) {
				loader.onload();
				loader.onload = undefined;
			}
		}
	},
};

let mouse = {
	x: 0,
	y: 0,
	down: false,
	dragging: false,

	init() {
		let canvas = document.getElementById('gamecanvas');

		canvas.addEventListener('mousemove', mouse.mousemovehandler, false);
		canvas.addEventListener('mousedown', mouse.mousedownhandler, false);
		canvas.addEventListener('mouseup', mouse.mouseuphandler, false);
		canvas.addEventListener('mouseout', mouse.mouseuphandler, false);

		canvas.addEventListener('touchmove', mouse.touchmovehandler, false);

		canvas.addEventListener('touchstart', mouse.mousedownhandler, false);
		canvas.addEventListener('touchend', mouse.mouseuphandler, false);
		canvas.addEventListener('touchcancel', mouse.mouseuphandler, false);
	},

	mousemovehandler(ev) {
		let offset = game.canvas.getBoundingClientRect();

		mouse.x = (ev.clientX - offset.left) / game.scale;
		mouse.y = (ev.clientY - offset.top) / game.scale;

		if (mouse.down) {
			mouse.dragging = true;
		}

		ev.preventDefault();
	},

	touchmovehandler(ev) {
		var touch = ev.targetTouches[0];
		var offset = game.canvas.getBoundingClientRect();
		mouse.x = (touch.clientX - offset.left) / game.scale;
		mouse.y = (touch.clientY - offset.top) / game.scale;
		if (mouse.down) {
			mouse.dragging = true;
		}
		ev.preventDefault();
	},

	mousedownhandler(ev) {
		mouse.down = true;

		ev.preventDefault();
	},

	mouseuphandler(ev) {
		mouse.down = false;
		mouse.dragging = false;

		ev.preventDefault();
	},
};

let entities = {
	definitions: {
		glass: {
			fullHealth: 100,
			density: 2.4,
			friction: 0.4,
			restitution: 0.15,
		},
		wood: {
			fullHealth: 500,
			density: 0.7,
			friction: 0.4,
			restitution: 0.4,
		},
		dirt: {
			density: 3.0,
			friction: 1.5,
			restitution: 0.2,
		},
		burger: {
			shape: 'circle',
			fullHealth: 40,
			radius: 25,
			density: 1,
			friction: 0.5,
			restitution: 0.4,
		},
		sodacan: {
			shape: 'rectangle',
			fullHealth: 80,
			width: 40,
			height: 60,
			density: 1,
			friction: 0.5,
			restitution: 0.7,
		},
		fries: {
			shape: 'rectangle',
			fullHealth: 50,
			width: 40,
			height: 50,
			density: 1,
			friction: 0.5,
			restitution: 0.6,
		},
		apple: {
			shape: 'circle',
			radius: 25,
			density: 1.5,
			friction: 0.5,
			restitution: 0.4,
		},
		orange: {
			shape: 'circle',
			radius: 25,
			density: 1.5,
			friction: 0.5,
			restitution: 0.4,
		},
		strawberry: {
			shape: 'circle',
			radius: 15,
			density: 2.0,
			friction: 0.5,
			restitution: 0.4,
		},
		pizza: {
			shape: 'rectangle',
			fullHealth: 45,
			width: 20,
			height: 16,
			density: 1,
			friction: 0.5,
			restitution: 0.3,
		},
		pineapple: {
			shape: 'circle',
			radius: 35,
			density: 0.9,
			friction: 0.5,
			restitution: 0.3,
		},
		sodaglass: {
			shape: 'rectangle',
			fullHealth: 40,
			width: 19,
			height: 60,
			density: 1,
			friction: 0.5,
			restitution: 0.6,
		},
		watermelon: {
			shape: 'circle',
			radius: 25,
			density: 3.0,
			friction: 0.5,
			restitution: 0.7,
		},
	},

	create(entity) {
		let definition = entities.definitions[entity.name];

		if (!definition) {
			console.log('Undefined entity name', entity.name);

			return;
		}

		switch (entity.type) {
			case 'block':
				entity.health = definition.fullHealth;
				entity.fullHealth = definition.fullHealth;
				entity.shape = 'rectangle';
				entity.sprite = loader.loadImage(
					'images/entities/' + entity.name + '.png'
				);

				entity.breakSound = game.breakSound[entity.name];

				box2d.createRectangle(entity, definition);
				break;
			case 'ground':
				entity.shape = 'rectangle';
				box2d.createRectangle(entity, definition);
				break;
			case 'hero':
			case 'villain':
				entity.health = definition.fullHealth;
				entity.fullHealth = definition.fullHealth;
				entity.sprite = loader.loadImage(
					'images/entities/' + entity.name + '.png'
				);
				entity.shape = definition.shape;

				entity.bounceSound = game.bounceSound;

				if (definition.shape === 'circle') {
					entity.radius = definition.radius;
					box2d.createCircle(entity, definition);
				} else if (definition.shape === 'rectangle') {
					entity.width = definition.width;
					entity.height = definition.height;
					box2d.createRectangle(entity, definition);
				}
				break;
			default:
				console.log('Undefined entity type', entity.type);
				break;
		}
	},

	draw(entity, position, angle) {
		game.context.translate(
			position.x * box2d.scale - game.offsetLeft,
			position.y * box2d.scale
		);
		game.context.rotate(angle);
		let padding = 1;

		switch (entity.type) {
			case 'block':
				game.context.drawImage(
					entity.sprite,
					0,
					0,
					entity.sprite.width,
					entity.sprite.height,
					-entity.width / 2 - padding,
					-entity.height / 2 - padding,
					entity.width + 2 * padding,
					entity.height + 2 * padding
				);
				break;
			case 'villain':
			case 'hero':
				if (entity.shape === 'circle') {
					game.context.drawImage(
						entity.sprite,
						0,
						0,
						entity.sprite.width,
						entity.sprite.height,
						-entity.radius - padding,
						-entity.radius - padding,
						entity.radius * 2 + 2 * padding,
						entity.radius * 2 + 2 * padding
					);
				} else if (entity.shape === 'rectangle') {
					game.context.drawImage(
						entity.sprite,
						0,
						0,
						entity.sprite.width,
						entity.sprite.height,
						-entity.width / 2 - padding,
						-entity.height / 2 - padding,
						entity.width + 2 * padding,
						entity.height + 2 * padding
					);
				}
				break;
			case 'ground':
				break;
		}

		game.context.rotate(-angle);
		game.context.translate(
			-position.x * box2d.scale + game.offsetLeft,
			-position.y * box2d.scale
		);
	},
};

let box2d = {
	scale: 30,

	init() {
		let gravity = new b2Vec2(0, 9.8);
		let allowSleep = true;

		box2d.world = new b2World(gravity, allowSleep);

		this.handleCollisions();
	},

	handleCollisions() {
		let listener = new b2ContactListener();

		listener.PostSolve = function (contact, impulse) {
			let body1 = contact.GetFixtureA().GetBody();
			let body2 = contact.GetFixtureB().GetBody();
			let entity1 = body1.GetUserData();
			let entity2 = body2.GetUserData();

			let impulseAlongNormal = Math.abs(impulse.normalImpulses[0]);

			if (impulseAlongNormal > 5) {
				if (entity1.health) {
					entity1.health -= impulseAlongNormal;
				}

				if (entity2.health) {
					entity2.health -= impulseAlongNormal;
				}

				if (entity1.bounceSound) {
					entity1.bounceSound.play();
				}

				if (entity2.bounceSound) {
					entity2.bounceSound.play();
				}
			}
		};

		box2d.world.SetContactListener(listener);
	},

	debugCanvas: undefined,
	setupDebugDraw() {
		if (!box2d.debugCanvas) {
			let canvas = document.createElement('canvas');

			canvas.width = 1024;
			canvas.height = 480;
			document.body.appendChild(canvas);
			canvas.style.top = '480px';
			canvas.style.position = 'absolute';
			canvas.style.background = 'white';
			box2d.debugCanvas = canvas;
		}

		let debugContext = box2d.debugCanvas.getContext('2d');
		let debugDraw = new b2DebugDraw();

		debugDraw.SetSprite(debugContext);
		debugDraw.SetDrawScale(box2d.scale);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		box2d.world.SetDebugDraw(debugDraw);
	},

	createRectangle(entity, definition) {
		let bodyDef = new b2BodyDef();

		if (entity.isStatic) {
			bodyDef.type = b2Body.b2_staticBody;
		} else {
			bodyDef.type = b2Body.b2_dynamicBody;
		}

		bodyDef.position.x = entity.x / box2d.scale;
		bodyDef.position.y = entity.y / box2d.scale;
		if (entity.angle) {
			bodyDef.angle = (Math.PI * entity.angle) / 180;
		}

		let fixtureDef = new b2FixtureDef();

		fixtureDef.density = definition.density;
		fixtureDef.friction = definition.friction;
		fixtureDef.restitution = definition.restitution;

		fixtureDef.shape = new b2PolygonShape();
		fixtureDef.shape.SetAsBox(
			entity.width / 2 / box2d.scale,
			entity.height / 2 / box2d.scale
		);

		let body = box2d.world.CreateBody(bodyDef);

		body.SetUserData(entity);
		body.CreateFixture(fixtureDef);

		return body;
	},

	createCircle(entity, definition) {
		let bodyDef = new b2BodyDef();

		if (entity.isStatic) {
			bodyDef.type = b2Body.b2_staticBody;
		} else {
			bodyDef.type = b2Body.b2_dynamicBody;
		}

		bodyDef.position.x = entity.x / box2d.scale;
		bodyDef.position.y = entity.y / box2d.scale;

		if (entity.angle) {
			bodyDef.angle = (Math.PI * entity.angle) / 180;
		}
		let fixtureDef = new b2FixtureDef();

		fixtureDef.density = definition.density;
		fixtureDef.friction = definition.friction;
		fixtureDef.restitution = definition.restitution;

		fixtureDef.shape = new b2CircleShape(entity.radius / box2d.scale);

		let body = box2d.world.CreateBody(bodyDef);

		body.SetUserData(entity);
		body.CreateFixture(fixtureDef);

		return body;
	},

	step(timeStep) {
		if (timeStep > 2 / 60) {
			timeStep = 2 / 60;
		}

		box2d.world.Step(timeStep, 8, 3);
	},
};

window.addEventListener('load', function () {
	game.resize();
	game.init();
});

window.addEventListener('resize', function () {
	game.resize();
});

document.addEventListener('touchmove', function (ev) {
	ev.preventDefault();
});