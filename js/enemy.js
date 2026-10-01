// =====================================================================  
// enemy.js -- rogue spikes: sleep, wake when you're close, hunt you.  
// Takes SPIKE_HP laser hits to destroy.  
// =====================================================================  
  
var Enemy = { list: [] };  
  
// find every E tile and register it as an enemy  
Enemy.reset = function () {  
  Enemy.list = [];  
  Enemy.playerCaught = false;  
  for (var row = 0; row < CONFIG.ROWS; row++) {  
    for (var col = 0; col < Level.cols; col++) {  
      if (Level.charAt(col, row) === "E") {  
        Enemy.list.push({  
          col: col,  
          row: row,  
          x: col * CONFIG.TILE,  
          y: row * CONFIG.TILE,  
          state: "dormant", // "dormant" or "hunting"  
          hp: CONFIG.SPIKE_HP,  
          flash: 0  
        });  
        Enemy.setTile(col, row, "^"); // dormant spikes look and kill like normal spikes  
      }  
    }  
  }  
};  
  
// Level.grid holds strings, which cannot be changed in place,  
// so we rebuild the whole row with one character swapped  
Enemy.setTile = function (col, row, character) {  
  var line = Level.grid[row];  
  Level.grid[row] = line.substring(0, col) + character + line.substring(col + 1);  
};  
  
Enemy.update = function () {  
  var size = CONFIG.PLAYER_SIZE;  
  var playerCX = Player.x + size / 2;  
  var playerCY = Player.y + size / 2;  
  
  for (var i = 0; i < Enemy.list.length; i++) {  
    var e = Enemy.list[i];  
    var eCX = e.x + CONFIG.TILE / 2;  
    var eCY = e.y + CONFIG.TILE / 2;  
    var dx = playerCX - eCX;  
    var dy = playerCY - eCY;  
    var dist = Math.sqrt(dx * dx + dy * dy);  
  
    if (e.state === "dormant") {  
      // wake up when the player gets close  
      if (dist < CONFIG.SPIKE_WAKE_DISTANCE) {  
        Enemy.setTile(e.col, e.row, "."); // the tile stops being a spike; the enemy takes over  
        e.state = "hunting";  
      }  
    } else if (e.state === "hunting") {  
      // chase the player  
      if (dist > 0) {  
        e.x = e.x + (dx / dist) * CONFIG.SPIKE_SPEED;  
        e.y = e.y + (dy / dist) * CONFIG.SPIKE_SPEED;  
      }  
      // touching the player kills them  
      if (e.x < Player.x + size && e.x + CONFIG.TILE > Player.x &&  
          e.y < Player.y + size && e.y + CONFIG.TILE > Player.y) {  
        Enemy.playerCaught = true;  
      }  
    }  
  
    if (e.flash > 0) { e.flash = e.flash - 1; }  
  }  
};  
  
// which hunting enemy, if any, is under this box? (used by bullets)  
Enemy.hitTest = function (x, y, width, height) {  
  for (var i = 0; i < Enemy.list.length; i++) {  
    var e = Enemy.list[i];  
    if (e.state !== "hunting") { continue; }  
    if (e.x < x + width && e.x + CONFIG.TILE > x &&  
        e.y < y + height && e.y + CONFIG.TILE > y) {  
      return e;  
    }  
  }  
  return null;  
};  
  
// take one laser hit; die when out of health  
Enemy.damage = function (e) {  
  e.hp = e.hp - 1;  
  e.flash = CONFIG.SPIKE_HIT_FLASH;  
  if (e.hp <= 0) {  
    var alive = [];  
    for (var i = 0; i < Enemy.list.length; i++) {  
      if (Enemy.list[i] !== e) { alive.push(Enemy.list[i]); }  
    }  
    Enemy.list = alive;  
  }  
};  
  
// draw only the hunting ones -- dormant spikes are drawn by the grid itself  
Enemy.draw = function () {  
  var ctx = Draw.ctx;  
  for (var i = 0; i < Enemy.list.length; i++) {  
    var e = Enemy.list[i];  
    if (e.state !== "hunting") { continue; }  
    if (e.flash > 0 && e.flash % 4 < 2) { continue; } // blink when hit  
    ctx.fillStyle = "#000000";  
    ctx.beginPath();  
    ctx.moveTo(e.x, e.y + CONFIG.TILE);  
    ctx.lineTo(e.x + CONFIG.TILE / 2, e.y);  
    ctx.lineTo(e.x + CONFIG.TILE, e.y + CONFIG.TILE);  
    ctx.closePath();  
    ctx.fill();  
  }  
};  
