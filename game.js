// Import components and plugins

import kaboom from "https://unpkg.com/kaboom@2000.0.0-beta.5/dist/kaboom.mjs";

import { blink } from "./plugins/components/blink.js";
import { newgroundsPlugin } from "./plugins/newgrounds.js";

// Kaboom!!! //////////////////////////////////////////////////////////////////////////////////////////////

const k = kaboom({
    width: 330,
    height: 250,
    scale: 2,
    debug: false,
    font: "sink",
    plugins: [newgroundsPlugin],
    clearColor: [0, 0, 0, 5],
});

// Load Assets ////////////////////////////////////////////////////////////////////////////////////////////

k.loadFont("unscii", "./fonts/unscii.png", 8, 8);

k.loadSound("piu", "./sounds/shoot.wav");
k.loadSound("boom", "./sounds/explosion.wav");
k.loadSound("hit", "./sounds/hit.wav");
k.loadSound("sot", "./sounds/saber_of_truth.mp3");
k.loadSound("start", "./sounds/start.wav");

k.loadSprite("newgrounds", "./sprites/newgrounds.png");
k.loadSprite("background", "./sprites/background.png");
k.loadSprite("glass", "./sprites/glass.png");
k.loadSprite("bullet", "./sprites/bullet.png");
k.loadSprite("apple", "./sprites/apple.png");
k.loadSprite("owo", "./sprites/owo.png");
k.loadSprite("roblox", "./sprites/roblox.png");
k.loadSprite("juizy", "./sprites/juizy.png");
k.loadSprite("portal", "./sprites/portal.png");
k.loadSprite("xd", "./sprites/xd.png");
k.loadSprite("zelda", "./sprites/zelda.png");
k.loadSprite("sus", "./sprites/sus.png");
k.loadSprite("eww_0", "./sprites/eww_0.png");
k.loadSprite("eww_1", "./sprites/eww_1.png");
k.loadSprite("eww_2", "./sprites/eww_2.png");

k.loadSprite("explosion", "./sprites/explosion.png", {
    sliceX: 2,
    sliceY: 2,
    anims: { main: { from: 0, to: 3 } },
});

k.loadSprite("trash_explosion", "./sprites/trash_explosion.png", {
    sliceX: 2,
    sliceY: 2,
    anims: { main: { from: 0, to: 3 } },
});

k.loadSprite("stiven", "./sprites/stiven.png", {
    sliceX: 3,
    sliceY: 1,
    anims: { main: { from: 0, to: 2 } },
});

// Global Variable ////////////////////////////////////////////////////////////////////////////////////////

let musicVolume = 1;

// Scenes /////////////////////////////////////////////////////////////////////////////////////////////////

// Splash

k.scene("splash", () => {
    let show = false;
    let splashTime = 0;

    const ng = k.add([
        k.sprite("newgrounds"),
        k.origin("center"),
        k.color(k.rgba(255, 255, 255, 0)),
        k.area({ cursor: "pointer" }),
        k.scale(0.7),
        k.pos(k.width() / 2, k.height() / 2),
    ]);

    ng.action(() => {
        if (k.time() > splashTime + 0.01 && !show) {
            splashTime = k.time();
            if (ng.color.a < 1) ng.color.a += 0.01;
            else k.wait(2, () => (show = true));
        } else {
            if (ng.color.a > 0) ng.color.a -= 0.01;
            else k.wait(1, () => k.go("game"));
        }

        if (k.keyIsPressed("space") || k.mouseIsClicked()) k.go("menu");
        if (k.keyIsPressed("f")) k.fullscreen(!k.fullscreen());
    });
});

// Menu

k.scene("menu", () => {
    let keyAlreadyPressed = false;

    k.add([
        k.text("Aspace", { size: 30, font: "unscii" }),
        k.pos(k.width() / 2, 40),
        k.origin("center"),
    ]);

    k.add([
        k.text("Destroy the garbage!", { size: 15, font: "unscii" }),
        k.pos(k.width() / 2, 65),
        k.origin("center"),
    ]);

    k.add([
        k.text("Arrows or Wasd: Move", { size: 12, font: "unscii" }),
        k.pos(k.width() / 2, 110),
        k.origin("center"),
    ]);

    k.add([
        k.text("Backspace: Shoot", { size: 12, font: "unscii" }),
        k.pos(k.width() / 2, 130),
        k.origin("center"),
    ]);

    k.add([
        k.text("M: Mute music", { size: 12, font: "unscii" }),
        k.pos(k.width() / 2, 150),
        k.origin("center"),
    ]);

    k.add([
        k.text("F: Fullscreen", { size: 12, font: "unscii" }),
        k.pos(k.width() / 2, 170),
        k.origin("center"),
    ]);

    const startText = k.add([
        k.text("press space for start", { size: 13, font: "unscii" }),
        k.pos(k.width() / 2, k.height() - 30),
        k.origin("center"),
        blink(0.3),
    ]);

    k.action(() => {
        if (k.keyIsPressed("space") && !keyAlreadyPressed) {
            keyAlreadyPressed = true;
            k.play("start");
            startText.use(blink(0.1));

            k.wait(2, () => k.go("game"));
        }

        if (k.keyIsPressed("f")) k.fullscreen(!k.fullscreen());
    });
});

// Game

k.scene("game", () => {
    const DEFAULT_RECOIL = 10;
    const SHOOT_DELAY = 0.3;

    let isDead = false;

    let bulletSpeed = 300;
    let backgroundSpeed = 60;
    let trashSpeed = 200;

    let music = k.play("sot");
    music.loop();
    music.volume(musicVolume);

    k.layers(["bg", "game", "ui"], "game");

    // Backgrounds

    k.add([k.sprite("background"), k.layer("bg"), k.pos(0, 0), "background"]);

    k.add([
        k.sprite("background"),
        k.pos(k.width() * 2, 0),
        k.layer("bg"),
        "background",
    ]);

    // UI

    const score = k.add([
        k.text("0", { size: 20, font: "unscii" }),
        k.origin("center"),
        k.pos(k.width() / 2, 15),
        k.layer("ui"),
        {
            value: 0,
        },
    ]);

    // Player

    const player = k.add([
        k.sprite("stiven"),
        k.scale(1.2),
        k.origin("center"),
        k.area({ scale: 0.7 }),
        k.pos(25, k.height() / 2),
        {
            speed: 200,
            lastShoot: 0,
            recoil: DEFAULT_RECOIL,
        },
    ]);

    player.play("main");

    // Shoot

    player.shoot = () => {
        if (!(k.time() > player.lastShoot + SHOOT_DELAY)) return;

        k.add([
            k.sprite("bullet"),
            k.scale(0.5),
            k.origin("right"),
            k.pos(player.pos.x, player.pos.y + 2),
            k.area(),
            "bullet",
        ]);

        k.play("piu", { volume: 0.4 });
        k.readd(player);
        player.lastShoot = k.time();
    };

    // Spawns

    k.loop(0.4, () => {
        let trash = k.choose([
            "glass",
            "apple",
            "owo",
            "roblox",
            "juizy",
            "sus",
            "portal",
            "zelda",
            "xd",
        ]);

        k.add([
            k.sprite(trash),
            k.rotate(k.rand(0, k.deg2rad(360))),
            origin("center"),
            k.pos(k.width() + 30, k.rand(0, k.height())),
            k.area(),
            "trash",
        ]);
    });

    k.loop(2, () => {
        let eww = k.choose(["eww_0", "eww_1", "eww_2"]);

        k.add([
            k.sprite(eww),
            k.pos(k.width() + 100, k.rand(0, k.height())),
            k.layer("background"),
            k.rotate(k.rand(0, 360)),
            k.scale(k.rand(1, 3)),
            k.origin("right"),
            "eww",
        ]);
    });

    // Collisions

    k.collides("bullet", "trash", (b, t) => {
        const scoreForAdd = Number(k.rand(2, 8).toFixed(0));

        k.destroy(b);
        t.trigger("death");

        score.value += scoreForAdd;
        score.text = score.value;
        score.use(k.scale(1.1));
        score.use(k.scale(1.2));

        k.wait(0.1, () => score.use(k.scale(1)));
    });

    // Actions

    k.action("background", b => {
        b.move(-backgroundSpeed, 0);

        if (b.pos.x <= -k.width() * 2) {
            b.pos.x += k.width() * 4;
        }
    });

    k.action("bullet", b => {
        b.move(bulletSpeed, 0);

        if (b.pos.x > k.width()) {
            k.destroy(b);
        }
    });

    k.action("eww", t => {
        t.move(-backgroundSpeed, 0);

        if (t.pos.x < -150) {
            k.destroy(t);
        }
    });

    k.action("trash", t => {
        t.move(-trashSpeed + k.rand(1, 10), 0);

        if (t.pos.x < -5) k.destroy(t);
    });

    player.action(() => {
        var dead = false;

        player.move(-player.recoil, 0);

        if (player.pos.x < 0 && !dead) {
            dead = true;
            player.trigger("death");
        }
    });

    // Events

    k.on("death", "trash", t => {
        k.shake(2);

        var anim = k.add([
            k.sprite("trash_explosion"),
            k.pos(t.pos),
            k.rotate(t.angle),
            origin("center"),
        ]);

        k.destroy(t);
        anim.play("main");
        k.wait(0.3, () => k.destroy(anim));

        if (trashSpeed < 500) trashSpeed += 0.5;
        if (player.recoil < 30) player.recoil += 0.1;
        if (backgroundSpeed < 200) backgroundSpeed + 0.7;
        if (player.speed < 300) player.speed += 0.2;
    });

    player.on("death", () => {
        // (Post Scores and Archievements) //

        isDead = true;
        k.shake(15);
        music.stop();

        var anim = k.add([
            k.sprite("explosion"),
            origin("center"),
            k.pos(player.pos),
        ]);

        k.destroy(player);
        anim.play("main");

        k.play("boom", { volume: 0.5 });
        k.wait(0.3, () => {
            k.destroy(anim);
        });

        k.wait(1.7, () => {
            if (score.value > 100) k.go("loose", { score: score.value });
            else k.go("game");
        });
    });

    // Collides

    player.collides("trash", p => {
        k.destroy(p);
        player.trigger("death");
    });

    // Input

    k.action(() => {
        if (k.keyIsDown("up") || (k.keyIsDown("w") && player.exists())) {
            player.move(0, -player.speed);

            if (player.pos.y < 0) {
                player.pos.y = k.height();
            }
        }

        if ((k.keyIsDown("down") || k.keyIsDown("s")) && player.exists()) {
            player.move(0, player.speed);

            if (player.pos.y > k.height()) {
                player.pos.y = 0;
            }
        }

        if ((k.keyIsDown("right") || k.keyIsDown("d")) && player.exists()) {
            if (player.pos.x < k.width() - 100) {
                player.move(player.speed, 0);
            }
        }

        if ((k.keyIsDown("left") || k.keyIsDown("a")) && player.exists()) {
            if (player.pos.x > 15) {
                player.move(-player.speed, 0);
            }
        }

        if (k.keyIsPressed("space") && !isDead) {
            player.shoot();
        }

        if (k.keyIsPressed("m")) {
            if (music.volume() == 0) {
                music.volume(1);
                musicVolume = 1;
            } else {
                music.volume(0);
                musicVolume = 0;
            }
        }

        if (k.keyIsPressed("escape")) {
            music.stop();
            k.go("menu");
        }
    });
});

k.scene("loose", ({ score }) => {
    // Info

    k.add([
        k.text("Score:" + score, {
            size: 26,
            font: "unscii",
            width: k.width(),
        }),
        k.origin("center"),
        k.pos(k.width() / 2, 100),
    ]);

    k.add([
        k.text("Space for restart", { size: 16, font: "unscii" }),
        k.origin("center"),
        blink(0.3),
        k.pos(k.width() / 2, 200),
    ]);

    // Input

    k.action(() => {
        if (k.keyIsPressed("space")) k.go("game");
        if (k.keyIsPressed("f")) k.fullscreen(!k.fullscreen());
    });
});

k.go("splash");
