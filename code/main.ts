import kaboom from "kaboom"
import "kaboom/global"

// initialize context
kaboom({
	background: [97, 163, 229],
	width: 320,
	height: 240,
	scale: 2,
})
setGravity(100)
let canSquash = false

loadSprite("boden", "sprites/boden.png")
loadSprite("frageblock", "sprites/questionBox.png")
loadSprite("block", "sprites/brick.png")
loadSprite("wolke", "sprites/cloud.png")
loadSprite("leereBox", "sprites/emptyBox.png")
loadSprite("röhre", "sprites/pipe.png")
loadSprite("röhreUnten", "sprites/pipeBottom.png")
loadSprite("coin", "sprites/coin.png")
loadSprite("mushy", "sprites/bigMushy.png")

loadAseprite("gumba", "sprites/enemies.png", "sprites/enemies.json")
loadAseprite("koopa", "sprites/enemies.png", "sprites/enemies.json")
loadAseprite("mario", "sprites/Mario.png", "sprites/Mario.json")
loadAseprite("stachel", "sprites/enemies.png", "sprites/enemies.json")
const level1 = [
	"                              ",
	"  &                           ",
	"  /                           ",
	"      *                       ",
	"                              ",
	"                *             ",
	"                              ",
	"  *        *  ?               ",
	"          >                   ",
	"                              ",
	"             <<<              ",
	"        >?>?                  ",
	"      e        k          s   ",
	"                              ",
	"=========================================",
	"=========================================",
]
scene('game', () => {
	const level = addLevel(level1, {
		tileWidth: 16,
		tileHeight: 16,
		tiles: {
			"=": () => [
				sprite("boden"),
				area(),
				body({ isStatic: true }),
				anchor("bot"),
			],
			"?": () => [
				sprite("frageblock"),
				area(),
				body({ isStatic: true }),
				anchor("bot"),
				"frageblock"
			],
			">": () => [
				sprite("block"),
				area(),
				body({ isStatic: true }),
				anchor("bot"),
			],
			"*": () => [
				sprite("wolke"),
				scale(2),
				anchor("bot"),
			],
			"<": () => [
				sprite("leereBox"),
				area(),
				body({ isStatic: true }),
				anchor("bot"),
			],
			"/": () => [
				sprite("röhre", { flipY: true }),
				area(),
				body({ isStatic: true }),
				anchor("bot"),
			],
			"p": () => [
				sprite("mario", { frame: 0, flipX: false }),
				area({ scale: 0.5 }),
				mario(),
				body({ isStatic: false }),
				anchor("bot"),
				"player"
			],
			"e": () => [
				sprite("gumba", { anim: "Walking" }),
				area({ scale: 0.5 }),
				gumba(),
				patrol(),
				body({ isStatic: false }),
				anchor("bot"),
				"gumba"
			],
			"k": () => [
				sprite("koopa", { anim: "Walk" }),
				area({ scale: 0.5 }),
				koopa(),
				patrol(),
				body({ isStatic: false }),
				anchor("bot"),
				"koopa"
			],
			"s": () => [
				sprite("stachel", { anim: "Spiny" }),
				area({ scale: 0.5 }),
				stachel(),
				patrol(),
				body({ isStatic: false }),
				anchor("bot"),
				"stachel"
			],
			"&": () => [
				sprite("röhreUnten", { flipY: true }),
				area(),
				body({ isStatic: true }),
				anchor("bot"),
			],
			"c": ()=> [
				sprite("coin"),
				area(),
				lifespan(0.4,{fade: 0.01}),
				body({isStatic: true}),
				anchor("bot"),
				"coin"
			],
			"m": ()=> [
				sprite("mushy"),
				area(),
				body({isStatic: false}),
				patrol(1000),
				offscreen({destroy: true}),
				anchor("bot"),
				"mushy"
			],
		}
	})

	const player = level.spawn("p", 2, 5)

	onKeyDown("right", () => {
		player.flipX = false
		player.move(100, 0)
	})
	onKeyDown("left", () => {
		player.flipX = true
		player.move(-100, 0)
	})
	
	onKeyPress("space", () => {
		if (player.isGrounded()) {
			player.jump(100);
			canSquash = true
		}
	});


	player.onUpdate(() => {
		const aktuelleKameraposition = camPos()
		if (player.pos.x > aktuelleKameraposition.x) {
			camPos(player.pos.x, aktuelleKameraposition.y)
		}
		if (player.isGrounded()) {
			canSquash = false
		}

	});



	player.onCollide("gumba", (g) => {
		if (canSquash) {
			g.squash();
			player.jump(100);
		}
		else {
			killed(player)
		}
	})
	player.onCollide("koopa", (k) => {
		if (canSquash) {
			k.squash();
			player.jump(100);
		}
		else {
			killed(player)
		}
	})
	player.onCollide("stachel", (s) => {
		if (canSquash) {
			killed(player)
		}
	})

	player.onHeadbutt((obj) => {
		
		if (obj.is("frageblock")) {
			
			if(obj.is("coinBox")){
				level.spawn("c", obj.tilepos.sub(0,1));
			} else if (obj.is("mushyBox")) {
				level.spawn("m", obj.tilepos.sub(0,1));
			}

			const pos = obj.tilepos;
			destroy(obj);
			level.spawn(">", pos);
		}
	})

})




scene("start", () => {
	add([
		text("Press ENTER to start"),
		scale(0.4),
		pos(vec2(160, 120)),
		anchor("center"),
		color(0, 0, 0),
	]);

	onKeyRelease("enter", () => {
		go("game");
	});

});

scene("gameOver", () => {
	add([
		text("Game Over :(", { size: 24 }),
		pos(toWorld(vec2(160, 120))),
		color(255, 255, 255),
		anchor("center"),
	]);
	wait(2, () => {
		go("start");
	});

})
go("start");

function patrol(distance = 200, speed = 30) {
	return {
		id: "mario",
		require: [],

		schritte : 0,
		richtung : 1,

		update() {
			this.move(this.richtung * speed, 0)
			this.schritte++
			if (this.schritte >= 40){
				this.schritte = 0
			this.richtung = -this.richtung
			}
		}
	};
}
function gumba() {
	return {
		id: "gumba-komponente",
		require: ['sprite'],
		isAlive: true,
		update() {
			// Code der beim jeden Einzelbild ausgeführt wird
			//funktioniert für den Sprite der diese Komponente hat
		},
		squash() {
			this.isAlive = false;
			this.stop();
			this.frame = 2;
			this.use(lifespan(0.5, { fade: 0.1 }));
		}
	};
}
function mario() {
	return {
		id: "mario",
		require: ['area', 'body'],
		isAlive: true,

		update() { },

		die() {
			this.unuse("body")
			this.isAlive= false;
			this.use(lifespan(1, { fade: 1 }));
		},
	};
}

function koopa() {
	return {
		id: "koopa-komponente",
		require: ['sprite'],
		isAlive: true,
		update() {
			// Code der beim jeden Einzelbild ausgeführt wird
			//funktioniert für den Sprite der diese Komponente hat
		},
		squash() {
			this.isAlive = false;
			this.stop();
			this.frame = 5;
			this.use(lifespan(0.4, { fade: 0.1 }));
		}
	};
}

function stachel() {
	return {
		id: "stachel-komponente",
		require: ['sprite'],
		isAlive: true,
		update() {
			// Code der beim jeden Einzelbild ausgeführt wird
			//funktioniert für den Sprite der diese Komponente hat
		},
		squash() {
			this.isAlive = false;
			this.stop();
			this.frame = 20;
			this.use(lifespan(0.5, { fade: 0.1 }));
		}
	};
}
function killed(player) {
	player.die()
	go('gameOver')
}