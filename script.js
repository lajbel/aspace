// Import components and plugins

import { realRgbPlugin } from "./plugins/realRGB.js";
import { blink } from "./plugins/components/blink.js";

// Init game

kaboom({
	global: true,
	width: 330,
	height: 250,
    scale: 2,
    canvas: document.getElementById("canvasGame"),
	debug: true,
    stretch: true,
    letterbox: true,
    plugins: [realRgbPlugin],
	clearColor: [0, 0, 0, 5],
});

// Load assets

loadSound("piu", "./sounds/shoot.wav");
loadSound("boom", "./sounds/explosion.wav");
loadSound("hit", "./sounds/hit.wav");
loadSound("sot", "./sounds/saber_of_truth.mp3");
loadSound("start", "./sounds/start.wav");
loadSprite("newgrounds", "./sprites/newgrounds.png");
loadSprite("background", "./sprites/background.png");
loadSprite("glass", "./sprites/glass.png");
loadSprite("bullet", "./sprites/bullet.png");
loadSprite("apple", "./sprites/apple.png");
loadSprite("owo", "./sprites/owo.png");
loadSprite("roblox", "./sprites/roblox.png");
loadSprite("juizy", "./sprites/juizy.png");
loadSprite("portal", "./sprites/portal.png");
loadSprite("xd", "./sprites/xd.png")
loadSprite("zelda", "./sprites/zelda.png");;
loadSprite("sus", "./sprites/sus.png");
loadSprite("eww_0", "./sprites/eww_0.png");
loadSprite("eww_1", "./sprites/eww_1.png");
loadSprite("eww_2", "./sprites/eww_2.png");
loadSprite("explosion", "./sprites/explosion.png", { sliceX: 2, sliceY: 2, anims: { main: { from: 0, to: 3} }});
loadSprite("trash_explosion", "./sprites/trash_explosion.png", { sliceX: 2, sliceY: 2, anims: { main: { from: 0, to: 3} }});
loadSprite("stiven", './sprites/stiven.png', { sliceX: 3, sliceY: 1, anims: { main: { from: 0, to: 2 } }});

// Global Variable

let musicVolume = 1;

// Splash 

scene("newgrounds", () => {
	let show = false; 

	const ng = add([
		sprite("newgrounds"),
		origin("center"),
        scale(0.5),
		color(rgba(1, 1, 1, 0)),
		pos(width() / 2, height() / 2)
	]);

	loop(0.01, () => {
		if(show) return;

		if(ng.color.a >= 1) wait(1, () => show = true)
		else ng.color.a += 0.01;
	});

	action(() => {
		if (keyIsPressed()) {
			go("menu");
		};
	});
});

// Menu

scene("menu", () => {
	let keyAlreadyPressed = false;

	add([
		text("Aspace", 30),
		pos(width() / 2, 40),
		origin("center")
	]);

	add([
		text("Arrows or Wasd - Move", 10),
		pos(width() / 2, 90),
		origin("center")
	]);

	add([
		text("Backspace - Shoot", 10),
		pos(width() / 2, 110),
		origin("center")
	]);

	add([
		text("M - Mute music", 10),
		pos(width() / 2, 130),
		origin("center")
	]);

	add([
		text("Destroy the trash", 8),
		pos(width() / 2, 170),
		origin("center")
	]);

	add([
		text('500 points for the "final"', 8),
		pos(width() / 2, 180),
		origin("center")
	]);

	const startText = add([
		text("Press any key for start", 11),
		pos(width() / 2, height() - 30),
		origin("center"),
        blink(0.2)
	]);

	action(() => {
		if (keyIsPressed("space") && !keyAlreadyPressed) {
            keyAlreadyPressed = true;
            play("start");
			startText.use(blink(0.1));

            // Earn start archievement
            
			wait(2, () => go("game"));
		};
	});
});

// Game

scene("game", () => {
    // Scene Variables 

    const DEFAULT_RECOIL = 10;
    const SHOOT_DELAY = 0.3;

    let isDead = false;

	let bulletSpeed = 300;
	let backgroundSpeed = 60;
	let trashSpeed = 200;

    let music = play("sot");
	music.loop();
	music.volume(musicVolume);

	layers(["bg", "ewws", "game", "ui", "score"], "game");
    camIgnore(["ui"]);
	volume(1);

    // Backgrounds
	
	add([
		sprite("background"),
		layer("bg"),
		pos(0, 0),
		"background"
	]);

	add([
		sprite("background"),
		pos(width() * 2, 0),
		layer("bg"),
		"background",
	]);

    const score = add([
		text("0", 17),
        origin("center"),
		pos(width() / 2, 15),
		layer("score"),
		{
			value: 0,
		},
	]);

    // Player

	const player = add([
		sprite("stiven"),
        scale(1.2),
        origin("center"),		
		area(vec2(10, 6), vec2(-9, -5)),
        pos(25, height() / 2),
		{
			speed: 200,
			lastShoot: 0,
			recoil: DEFAULT_RECOIL,
		}
	]);

	player.play("main");

    // Shoot 

    player.shoot = () => {
        if(!(time() > player.lastShoot + SHOOT_DELAY)) return;

        add([
			sprite("bullet"),
			scale(0.5),
            origin("right"),
			pos(player.pos.x, player.pos.y + 2),
            area(),
			"bullet",
		]);

		play("piu", { volume: 0.4 });
		readd(player);
        player.lastShoot = time();
    };

	

	// Spawns

	loop(0.4, () => {
		let trash = choose(["glass", "apple", "owo", "roblox", "juizy", "sus", "portal", "zelda", "xd"]);

		add([
			sprite(trash),
            rotate(rand(0, deg2rad(360))),
			origin("center"),
			pos(width() + 30, rand(0, height())),
			area(),
			'trash',
		]);
	})

    loop(2, () => {
		let eww = choose(["eww_0", "eww_1", "eww_2"])

		add([
			sprite(eww),
			pos(width() + 100, rand(0, height())),
			layer("ewws"),
			rotate(rand(0, 360)),
			scale(rand(1, 3)),
			origin("right"),
			'eww'
		]);
	});

	// Collisions

	collides("bullet", "trash", (b, t) => {
        const scoreForAdd = Number(rand(2, 8).toFixed(0));

		destroy(b);
		t.trigger("death");
 
        score.value += scoreForAdd;
		score.text = score.value;
        score.use(scale(1.1));
        score.use(scale(1.2));

        wait(0.1, () => score.use(scale(1)));
	});

	// Actions 

	action("background", (b) => {
		b.move(-backgroundSpeed, 0);

		if (b.pos.x <= -width() * 2) {
			b.pos.x += width() * 4;
		}
	});

	action("bullet", (b) => {
		b.move(bulletSpeed, 0);

		if (b.pos.x > width()) {
			destroy(b);
		};
	});

	action('eww', (t) => {
		t.move(-backgroundSpeed, 0);

		if (t.pos.x < -150) {
			destroy(t);
		}
	});

	action('trash', (t) => {
		t.move(-trashSpeed + rand(1, 10), 0);

		if (t.pos.x < -5) destroy(t);
	});

	player.action(() => {
		var dead = false;

		player.move(-player.recoil, 0);

		if (player.pos.x < 0 && !dead) {
			dead = true;
			player.trigger("death");	
		};
	});

	// Events

	on("death", "trash", (t) => {
		shake(2);

		var anim = add([
			sprite("trash_explosion"),
			pos(t.pos),
			rotate(t.angle),
			origin("center"),
		]);

		destroy(t);
		anim.play("main");
		wait(0.3, () => destroy(anim));

		if (trashSpeed < 500) trashSpeed += 0.5;
		if (player.recoil < 30) player.recoil += 0.1;
		if (backgroundSpeed < 200) backgroundSpeed + 0.7;
		if (player.speed < 300) player.speed += 0.2;
	});

	player.on("death", () => {
		// (Post Scores and Archievements) //

        isDead = true;
        shake(15);
		music.stop();

		var anim = add([
			sprite("explosion"),
			origin("center"),
			pos(player.pos)
		]);

		destroy(player);
		anim.play("main");

		play("boom", {volume: 0.5});
		wait(0.3, () => { destroy(anim); });

		wait(1.7, () => {
			if (score.value > 100) go("loose", { score: score.value });
			else go("game");
		});
	});

	// Collides

	player.collides("trash", (p) => {
		destroy(p);
		player.trigger("death");
	})

	// Input

	action(() => {
		if ((keyIsDown("up") || keyIsDown("w") && player.exists())) {
			player.move(0, -player.speed);

			if (player.pos.y < 0) {
				player.pos.y = height();
			};
		};

		if ((keyIsDown("down") || keyIsDown("s")) && player.exists()) {
			player.move(0, player.speed)

			if (player.pos.y > height()) {
				player.pos.y = 0;
			};
		};

		if ((keyIsDown("right") || keyIsDown("d")) && player.exists()) {
			if (player.pos.x < width() - 100) {
				player.move(player.speed, 0);
			};
		};

		if ((keyIsDown("left") || keyIsDown("a")) && player.exists()) {
			if (player.pos.x > 15) {
				player.move(-player.speed, 0);
			};
		};

		if (keyIsPressed("space") && !isDead) {		
			player.shoot();
		};

		if (keyIsPressed("m")) {
			if (music.volume() == 0) {
				music.volume(1);
                musicVolume = 1;
			} else {
				music.volume(0)
				musicVolume = 0;
			};
		}
		
		if (keyIsPressed("escape")) {
			music.stop()
			go("menu");
		};
	});
});

scene("loose", ({ score }) => {
	add([
		text("Your Score: " + score, 12),
		origin("center"),
		pos(width() / 2, 100),
	]);

	add([
		text("Spacebar to restart", 16),
		origin("center"),
		pos(width() / 2, 200)
	])

	keyPress("space", () => {
		go("game");
	})
});

go("menu");