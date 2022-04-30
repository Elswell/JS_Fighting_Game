const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/background.png",
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 128,
  },
  imageSrc: "./assets/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: { x: 150, y: 0 },
  velocity: { x: 0, y: 0 },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assets/Martial Hero/Sprites/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./assets/Martial Hero/Sprites/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./assets/Martial Hero/Sprites/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./assets/Martial Hero/Sprites/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./assets/Martial Hero/Sprites/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./assets/Martial Hero/Sprites/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./assets/Martial Hero/Sprites/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./assets/Martial Hero/Sprites/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 120,
      y: 50,
    },
    width: 130,
    height: 50,
  },
});

const enemy = new Fighter({
  position: { x: 800, y: 0 },
  velocity: { x: 0, y: 0 },
  color: "blue",
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./assets/Martial Hero 2/Sprites/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: "./assets/Martial Hero 2/Sprites/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./assets/Martial Hero 2/Sprites/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./assets/Martial Hero 2/Sprites/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./assets/Martial Hero 2/Sprites/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./assets/Martial Hero 2/Sprites/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./assets/Martial Hero 2/Sprites/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./assets/Martial Hero 2/Sprites/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -165,
      y: 50,
    },
    width: 165,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  window.requestAnimationFrame(animate);
  background.update();
  shop.update();
  ctx.fillStyle = "rgba(255,255,255, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement
  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.switchSprite("run");
    player.velocity.x = 5;
  } else {
    player.switchSprite("idle");
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.switchSprite("run");
    enemy.velocity.x = 5;
  } else {
    enemy.switchSprite("idle");
  }

  // enemy jump

  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect collision & enemy gets hit
  if (
    rectangularColiision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.health -= 35;
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  //this is where the player gets hit
  if (
    rectangularColiision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.health -= 20;
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health

  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerID });
  }
}

animate();

window.addEventListener("keydown", (e) => {
  if (!player.dead) {
    switch (e.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        player.velocity.y = -20;
        break;
      case " ":
        player.attack();
        break;
    }
  }

  if (!enemy.dead) {
    switch (e.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  switch (e.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
