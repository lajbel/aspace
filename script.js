Newgrounds.Init("secret", "u");

// Kaboom Context

kaboom({
	global: true,
	width: 330,
	height: 250,
	scale: 2,
    canvas: document.getElementById("canvasGame"),
	clearColor: [0, 0, 0, 5],
	fullscreen: false,
	debug: true,
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
loadSprite("explosion", "./sprites/explosion.png", {
	sliceX: 2,
	sliceY: 2,
	anims: {
		main: {
			from: 0,
			to: 3
		}
	}
});
loadSprite("trash_explosion", "./sprites/trash_explosion.png", {
	sliceX: 2,
	sliceY: 2,
	anims: {
		main: {
			from: 0,
			to: 3
		}
	}
});
loadSprite("stiven", './sprites/stiven.png', {
	sliceX: 3,
	sliceY: 1,
	anims: {
		main: {
			from: 0,
			to: 2
		}
	}
});

// Global Variables

var musicVolume = 1;

// Splash ng

scene("newgrounds", () => {
	var show = false; 

	const ng = add([
		sprite("newgrounds"),
		origin("center"),
		color(1, 1, 1, 0),
		pos(width() / 2, height() / 2)
	]);

	loop(0.01, () => {
		if(show) return;

		if(ng.color.a >= 1) wait(1, () => show = true)
		else ng.color.a += 0.01;
	});

	loop(0.01, () => {
		if(!show) return;

		ng.color.a -= 0.01;

		if(ng.color.a <= 0) wait(0.1, () => go("tutorial"));
	});

	action(() => {
		if (keyIsPressed("space")) {
			go("tutorial");
		};
	});
})

// Menu and Tutorial

scene("tutorial", () => {
	var isStart = false;

	add([
		text("Nrm:AE2", 30),
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

	var startText = add([
		text("Backspace for start!", 13),
		pos(width() / 2, height() - 30),
		origin("center")
	]);

	loop(0.2, () => {
		if(isStart) return;

		startText.hidden = !startText.hidden;
	});

	// Input for Menu

	action(() => {
		if (keyIsPressed("space") && !isStart) {
			isStart = true;
			
			play("start");
			loop(0.1, () => startText.hidden = !startText.hidden);
			wait(2, () => go("main"));
		};
	});
})

// Game scene

scene("main", () => {
	var bulletSpeed = 300;
	var backgroundSpeed = 60;
	var RECOIL = 10;
	var trashSpeed = 200;
	var win = 0;

	layers(["bg", "ewws", "game", "ui"], "game");
	camIgnore(["ui"]);
	volume(1);
	
	add([
		sprite("background", {noArea: true}),
		layer("bg"),
		pos(0, 0),
		"background"
	]);

	add([
		sprite("background", {noAarea: true}),
		pos(width() * 2, 0),
		layer("bg"),
		"background",
	]);


	loop(2, () => {
		var theEww = choose(["eww_0", "eww_1", "eww_2"])

		add([
			sprite(theEww, {noArea: true}),
			pos(width() + 100, rand(0, height())),
			layer("ewws"),
			rotate(rand(0, 360)),
			scale(rand(1, 3)),
			origin("right"),
			'eww'
		]);
	});

	var music = play("sot");
	music.loop();
	music.volume(musicVolume);

	var player = add([
		sprite("stiven"),
		pos(25, height() / 2),
		origin("center"),
		scale(1.2),
		area(vec2(10, 6), vec2(-9, -5)),
		{
			speed: 200,
			lastShoot: 0,
			recoil: RECOIL,
			shoot: () => {
				add([
					sprite("bullet"),
					scale(0.5),
					pos(player.pos.x, player.pos.y + 2),
					origin("center"),
					"bullet",
				]);

				play("piu", { volume: 0.3 });
				readd(player);
			}
		}
	]);

	player.play("main");

	add([
		sprite("apple"),
		pos(6, 2.4),
		scale(0.7),
		layer("ui")
	]);

	const score = add([
		text("0", 15),
		pos(30, 7),
		layer("ui"),
		{
			value: 0,
		},
	]);

	// Spawn Trash

	loop(rand(0.2, 0.6), () => {
		var theTrash = choose(["glass", "apple", "owo", "roblox", "juizy", "sus", "portal", "zelda", "xd"]);

		add([
			sprite(theTrash),
			pos(width() + 30, rand(0, height())),
			rotate(rand(0, 180)),
			origin("center"),
			'trash',
		]);
	})

	// Shoot

	function shoot(p) {
		add([
			sprite("bullet"),
			scale(0.5),
			pos(p),
			origin("center"),
			"bullet",
		]);
	}

	// Collisions

	collides("bullet", "trash", (b, t) => {
		destroy(b);
		t.trigger("death");
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

	score.action(() => {
		if (score.value == 500 && win == 0) win = true;

		if (win == true) {
			win = false;
			Newgrounds.UnlockMedal(0);
		};
	});

	// Events

	on("death", "trash", (t) => {
		camShake(2);

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

		score.value += 1;
		score.text = score.value;
	});

	player.on("death", () => {
		Newgrounds.PostScore(0, score.value);
		music.stop()
		camShake(15);

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
			if (score.value > 100) go("lose", { score: score.value });
			else go("main");
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

		if (keyIsPressed("space") && player.exists() && time() > player.lastShoot + 0.1) {
			if (player.exists()) {
				player.lastShoot = time();
				player.shoot();
			};
		};

		if (keyIsPressed("m")) {
			if (music.volume() == 0) {
				music.volume(1);
				musicVolume = 1;
			} else {
				music.volume(0)
				musicVolume = 0;
				Newgrounds.UnlockMedal(1);
			};
		}
		
		if (keyIsPressed("escape")) {
			music.stop()
			go("tutorial");
		};
	});
});

scene("lose", ({ score }) => {
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

	if (score >= 100 && score < 200) {
		add([
			text("Thats all?", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 200 && score < 300) {
		add([
			text("My cousin without arms plays better", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 300 && score < 400) {
		add([
			text("Youre almost there, maybe spamming doesnt work that well.", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 400 && score < 500) {
		add([
			text("Ugh", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 500 && score < 1000) {
		add([
			text("It's fine. I guess, 'juicy', please die already.", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 1000 && score < 2000) {
		add([
			text("Stop playing the game, put your 5 star shit down and go.", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 2000 && score < 3000) {
		add([
			text("You're being quite annoying, could you stop looking for my texts, ok? I won't say anything else, just give up.", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 3000 && score < 4000) {
		add([
			text("Final warning. Go and send kisses to your mother on behalf of the Narrator.", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}
	else if (score >= 4000 && score < 5000) {
		add([
			text("Look behind you.", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])

		wait(0.5, () => {
			add([
				text("Stupid.", 10, { width: 250 }),
				origin("center"),
				pos(width() / 2, 70)
			])
		})
	}
	else if (score >= 5000) {
		add([
			text("Please apologize for any inconvenience caused to you. Please continue to play - LaJBel Studio.", 10, { width: 250 }),
			origin("center"),
			pos(width() / 2, 50)
		])
	}

	keyPress("space", () => {
		go("main");
	})
});

start("newgrounds");