// Kaboom Context

kaboom({
	global: true,
	width: 330,
	height: 250,
	scale: 2,
	clearColor: [0, 0, 0, 5],
	fullscreen: false,
	debug: true,
});

// Load sprites

const loadAssets = async () => {
	await loadSprite("stiven", './sprites/stiven.png');
	await loadSprite("background", "./sprites/background.png");
	await loadSprite("glass", "./sprites/glass.png");
	await loadSprite("bullet", "./sprites/bullet.png");
	await loadSprite("apple", "./sprites/apple.png");
	await loadSprite("owo", "./sprites/owo.png");
	await loadSprite("roblox", "./sprites/roblox.png");
	await loadSprite("juizy", "./sprites/juizy.png");
	await loadSprite("portal", "./sprites/portal.png");
	await loadSprite("xd", "./sprites/xd.png")
	await loadSprite("zelda", "./sprites/zelda.png");;
	await loadSprite("sus", "./sprites/sus.png");
	await loadSprite("eww_0", "./sprites/eww_0.png");
	await loadSprite("eww_1", "./sprites/eww_1.png");
	await loadSprite("eww_2", "./sprites/eww_2.png");

	await loadSprite("explosion", "./sprites/explosion.png", {
		sliceX: 2,
		sliceY: 2,
		anims: {
			main: {
				from: 0,
				to: 3
			}
		}
	});

	await loadSprite("trash_explosion", "./sprites/trash_explosion.png", {
		sliceX: 2,
		sliceY: 2,
		anims: {
			main: {
				from: 0,
				to: 3
			}
		}
	});

	await Newgrounds.Init("secret", "u");
}

loadAssets()


// Load souds

var musicVolume = 1;

//

loadSound("piu", "./sounds/shoot.wav");
loadSound("boom", "./sounds/explosion.wav");
loadSound("hit", "./sounds/hit.wav");
loadSound("sot", "./sounds/saber_of_truth.mp3");

// Tutorial scene

scene("tutorial", () => {
	add([
		text("NrmAE2", 35),
		pos(width() / 2, 40),
		origin("center")
	])

	add([
		text("Arrows or Wasd - Move", 15),
		pos(width() / 2, 90),
		origin("center")
	])

	add([
		text("Backspace - Shoot", 15),
		pos(width() / 2, 110),
		origin("center")
	])

	add([
		text("Destroy the trash", 8),
		pos(width() / 2, 150),
		origin("center")
	])

	add([
		text('500 points for the "final"', 8),
		pos(width() / 2, 160),
		origin("center")
	])

	add([
		text("Backspace for start!", 13),
		pos(width() / 2, height() - 30),
		origin("center")
	])

	add([
		text("[M to mute music]", 13),
		pos(width() / 2, height() - 5),
		origin("center")
	])

	keyDown("space", () => {
		go("main");
	})
})

start("tutorial")
// Main scene

scene("main", () => {
	layers(["bg", "ewws", "game", "ui"], "game");
	volume(1);
	camIgnore(["ui"]);

	const bulletSpeed = 300;
	var backgroundSpeed = 60;
	var recoil = 10;
	var trashSpeed = 200;
	var win = 0;

	add([
		sprite("background"),
		layer("bg"),
		pos(0, 0),
		"bacg"
	])

	add([
		sprite("background"),
		pos(width() * 2, 0),
		layer("bg"),
		"bacg",
	]);


	action("bacg", (b) => {
		b.move(-backgroundSpeed, 0);

		if (b.pos.x <= -width() * 2) {
			b.pos.x += width() * 4;
		}
	})


	loop(2, () => {
		var theEww = choose(["eww_0", "eww_1", "eww_2"])
		add([
			sprite(theEww),
			pos(width() + 100, rand(0, height())),
			layer("ewws"),
			rotate(rand(0, 360)),
			scale(rand(1, 3)),
			origin("right"),
			'eww'
		])
	})

	action('eww', (t) => {
		t.move(-backgroundSpeed, 0);

		if (t.pos.x < -150) {
			destroy(t);
		}
	})

	const music = play("sot");
	music.loop();
	music.volume(musicVolume);

	const player = add([
		sprite("stiven"),
		pos(25, height() / 2),
		origin("center"),
		scale(1.2),
		area(vec2(2), vec2(2)),
		{
			speed: 200
		}
	])

	player.action(() => {
		player.move(-recoil, 0);

		if (player.pos.x < 0) {
			Newgrounds.PostScore(0, score.value);

			camShake(15);
			player.changeSprite("explosion");
			player.play("main");
			music.stop()
			play("boom", {
				volume: 0.5
			});

			wait(0.3, () => {
				destroy(player)
			})

			wait(1.7, () => {
				if (score.value > 100) go("lose", { score: score.value });
				else go("main");
			})
		}
	})

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

	score.action(() => {
		if (score.value == 500 && win == 0) win = true;

		if (win == true) {
			win = false;

			const winText = add([
				text("Juicy", 10),
				pos(height() / 2, 10),
				origin("center"),
				layer("ui")
			])

			Newgrounds.UnlockMedal(0);

			wait(5, () => {
				destroy(winText)
			})
		}
	})

	// Spawn Trash

	loop(rand(0.2, 0.6), () => {
		var theTrash = choose(["glass", "apple", "owo", "roblox", "juizy", "sus", "portal", "zelda", "xd"])
		add([
			sprite(theTrash),
			pos(width() + 30, rand(0, height())),
			rotate(rand(0, 180)),
			origin("center"),
			'trash',
			{ dead: false }
		])
	})

	action('trash', (t) => {
		if (t.dead) return;

		t.move(-trashSpeed * rand(1, 1.5), 0);

		if (t.pos.x < 0) {
			destroy(t);
		}
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

	action("bullet", (b) => {
		b.move(bulletSpeed, 0);

		if (b.pos.x > width()) {
			destroy(b);
		}
	})

	// Collisions

	player.collides("trash", (p) => {
		if (p.dead) return;

		Newgrounds.PostScore(0, score.value);
		destroy(p);

		camShake(15);
		player.changeSprite("explosion");
		player.play("main");
		music.stop()
		play("boom", {
			volume: 0.4
		});

		wait(0.3, () => {
			destroy(player)
		})

		wait(1.7, () => {
			if (score.value > 100) go("lose", { score: score.value });
			else go("main");
		})
	})

	collides("bullet", "trash", (b, t) => {
		camShake(2);
		play("hit", {
			volume: 0.4
		});
		destroy(b);
		t.dead = true;
		t.changeSprite("trash_explosion");
		t.play("main");

		wait(0.3, () => destroy(t));

		if (trashSpeed < 500) trashSpeed++
		if (recoil < 50) recoil += 0.3;
		if (backgroundSpeed < 200) backgroundSpeed++;
		if (player.speed < 300) player.speed += 0.5;

		score.value += 1;
		score.text = score.value;
	})

	// Input

	keyDown(["up", "w"], () => {
		player.move(0, -player.speed);

		if (player.pos.y < 0) {
			player.pos.y = height();
		}
	})

	keyDown(["down", "s"], () => {
		player.move(0, player.speed)

		if (player.pos.y > height()) {
			player.pos.y = 0;
		}
	})

	keyDown(["right", "d"], () => {
		if (player.pos.x < width() - 100) {
			player.move(player.speed, 0);
		}
	})

	keyDown(["left", "a"], () => {
		if (player.pos.x > 15) {
			player.move(-player.speed, 0);
		}
	})

	keyPress("space", () => {
		if (player.exists()) {
			play("piu", {
				volume: 0.3
			});
			shoot(player.pos);
		}
	})

	keyPress("m", () => {
		if (music.volume() == 0) {
			music.volume(1);
			musicVolume = 1;
		} else {
			music.volume(0)
			musicVolume = 0;
			Newgrounds.UnlockMedal(1);
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
})