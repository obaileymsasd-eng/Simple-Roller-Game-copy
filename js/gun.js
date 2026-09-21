// =====================================================================  
// gun.js -- laser blaster: 4 shots, Q to reload over 2 seconds  
// =====================================================================  
  
var Gun = {  
  state: "ready", // "ready" or "reloading"  
  ammo: 0,  
  timer: 0,  
  fireWasDown: false,  
  reloadWasDown: false  
};  
  
var Bullets = { list: [] };  
  
Gun.reset = function () {  
  Gun.state = "ready";  
  Gun.ammo = CONFIG.MAG_SIZE;  
  Gun.timer = 0;  
};  
  
// fire one laser ball toward where the mouse is pointing  
Gun.shoot = function () {  
  var startX = Player.x + CONFIG.PLAYER_SIZE / 2;  
  var startY = Player.y + CONFIG.PLAYER_SIZE / 2;  
  var targetX = Input.mouseX + Draw.cameraX; // mouse is screen coords, world is scrolled  
  var targetY = Input.mouseY;  
  var dx = targetX - startX;  
  var dy = targetY - startY;  
  var dist = Math.sqrt(dx * dx + dy * dy);  
  Bullets.list.push({  
    x: startX,  
    y: startY,  
    vx: (dx / dist) * CONFIG.BULLET_SPEED,  
    vy: (dy / dist) * CONFIG.BULLET_SPEED  
  });  
};  
  
Gun.update = function () {  
  // act only on the frame the key is first pressed, not every frame it is held  
  var fireJustPressed = Input.fire && !Gun.fireWasDown;  
  var reloadJustPressed = Input.reload && !Gun.reloadWasDown;  
  
  if (Gun.state === "ready") {  
    if (fireJustPressed && Gun.ammo > 0) {  
      Gun.shoot();  
      Gun.ammo = Gun.ammo - 1;  
      if (Gun.ammo <= 0) {  
        Gun.state = "reloading"; // last shot forces the reload  
        Gun.timer = CONFIG.RELOAD_FRAMES;  
      }  
    } else if (reloadJustPressed) {  
      Gun.state = "reloading";  
      Gun.timer = CONFIG.RELOAD_FRAMES;  
    }  
  } else if (Gun.state === "reloading") {  
    Gun.timer = Gun.timer - 1;  
    if (Gun.timer <= 0) {  
      Gun.state = "ready";  
      Gun.ammo = CONFIG.MAG_SIZE;  
    }  
  }  
  
  Gun.fireWasDown = Input.fire;  
  Gun.reloadWasDown = Input.reload;  
  
  Bullets.update();  
};  
  
Bullets.update = function () {  
  var alive = [];  
  for (var i = 0; i < Bullets.list.length; i++) {  
    var b = Bullets.list[i];  
    b.x = b.x + b.vx;  
    b.y = b.y + b.vy;  
    var keep = true;  
    // laser dies when it hits a block or a spike  
    if (Collide.hitsSolid(b.x, b.y, 8, 8) || Collide.hitsSpike(b.x, b.y, 8, 8)) {  
      keep = false;  
    }  
    // laser dies when it leaves the visible screen  
    if (b.x < Draw.cameraX - 40 || b.x > Draw.cameraX + CONFIG.CANVAS_W + 40 ||  
        b.y < -40 || b.y > CONFIG.CANVAS_H + 40) {  
      keep = false;  
    }  
    if (keep) { alive.push(b); }  
  }  
  Bullets.list = alive;  
};  
  
Bullets.draw = function () {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#000000";  
  for (var i = 0; i < Bullets.list.length; i++) {  
    var b = Bullets.list[i];  
    ctx.beginPath();  
    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);  
    ctx.fill();  
  }  
};  
  
// ammo readout stays fixed on screen  
Bullets.drawHud = function () {  
  var ctx = Draw.ctx;  
  ctx.fillStyle = "#000000";  
  ctx.font = "20px Arial";  
  ctx.fillText("AMMO " + Gun.ammo, 10, 25);  
  if (Gun.state === "reloading") {  
    ctx.fillText("RELOADING...", 10, 50);  
  }  
};  
