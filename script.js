// NG API 

var ngio = new Newgrounds.io.core("secretid", "secrettoken");

var scoreboards;

function onScoreboardsLoaded(result) {
    if (result.success) scoreboards = result.scoreboards;
}

ngio.queueComponent("ScoreBoard.getBoards", {}, onScoreboardsLoaded);
ngio.executeQueue();

function postScore(board_name, score_value) {
    if (!ngio.user) return;

    var score;

    for (var i = 0; i < scoreboards.length; i++) {

        scoreboard = scoreboards[i];

        ngio.callComponent('ScoreBoard.postScore', {id:scoreboard.id, value:score_value});
    }
}

// Initiate Kaboom canvas

kaboom({
	global: true,
	width: 330,
	height: 250,
	scale: 2,
	clearColor: [0, 0, 0, 5],
	fullscreen: false,
	crisp: true,
	debug: false
});

// Load sprites

loadSprite("stiven", './sprites/stiven.png');
loadSprite("background", "./sprites/background.png");
loadSprite("glass", "./sprites/glass.png");
loadSprite("bullet", "./sprites/bullet.png");
loadSprite("apple", "./sprites/apple.png");
loadSprite("owo", "./sprites/owo.png");
loadSprite("roblox", "./sprites/roblox.png");
loadSprite("juizy", "./sprites/juizy.png");
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
})

// Load souds

loadSound("piu", "./sounds/shoot.wav");
loadSound("boom", "./sounds/explosion.wav");
loadSound("hit", "./sounds/hit.wav");
loadSound("sot", "./sounds/saber_of_truth.mp3");

// Tutorial scene

scene("tutorial", () => {
	add([
		text("Keys", 30),
		pos(width() / 2, 40),
		origin("center")
	])

	add([
		text("Arrows - Move", 15),
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
			camShake(15);
			postScore("Scores", score.value);
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
				go("main");
			})
		}
	})

	const score = add([
		text("0", 15),
		pos(4, 4),
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

			wait(2, () => {
				destroy(winText)
			})
		}
	})

	// Spawn Trash

	loop(rand(0.2, 0.6), () => {
		var theTrash = choose(["glass", "apple", "owo", "roblox", "juizy"])
		add([
			sprite(theTrash),
			pos(width() + 30, rand(0, height())),
			rotate(rand(0, 180)),
			origin("center"),
			'trash'
		])
	})

	action('trash', (t) => {
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
		destroy(p);
		camShake(15);
		postScore("Scores", score.value);
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
			go("main");
		})
	})

	collides("bullet", "trash", (b, t) => {
		camShake(2);
		play("hit", {
			volume: 0.4
		});
		destroy(b);
		destroy(t);

		if (trashSpeed < 500) trashSpeed += 2
 		if (recoil < 50) recoil += 0.3;
		if (backgroundSpeed < 200) backgroundSpeed++;

		score.value += 1;
		score.text = score.value;
	})

	// Move player

	keyDown("up", () => {
		player.move(0, -player.speed);

		if (player.pos.y < 0) {
			player.pos.y = height();
		}
	})

	keyDown("down", () => {
		player.move(0, player.speed)

		if (player.pos.y > height()) {
			player.pos.y = 0;
		}
	})

	keyDown("right", () => {
		if (player.pos.x < width() - 100) {
			player.move(player.speed, 0);
		}
	})

	keyDown("left", () => {
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
});

start("main");