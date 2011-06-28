/*************************************************************************
  Constants
**************************************************************************/
const MS_IN_SEC = 1000;

const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;

const WIN     = 42;
const LOSE    = 43;
const PAUSED  = 44;
const STOPPED = 45;
const RUNNING = 46;

const BASE_TOWER = 142;
const FAST_WEAK_TOWER = 143;
const LONG_RANGE_TOWER = 144;
const SLOW_STRING_TOWER = 145;

const MOUSE_UP = 242;
const MOUSE_DOWN = 243;
const MOVE_BOARD = 244;
const UPDATE_TOWER = 245;
const PLACING_TOWER = 246;
const NOTHING = 247;
const KEY_DOWN = 248;
const KEY_UP = 249;
const PLACING_SURVIVOR = 250;
/*************************************************************************
  bind declaration
  - Has caused issues when it is not declared will not run
  in Safari without declaration
**************************************************************************/
Function.prototype.bind = Function.prototype.bind ||
                          function(scope) {
                            var _function = this;
                            
                            return function() {
                              return _function.apply(scope, arguments);
                            }
                          };

/*************************************************************************
  RequestAnimationFrame declaration
**************************************************************************/
window.requestAnimFrame = window.requestAnimationFrame        || 
                          window.webkitRequestAnimationFrame  || 
                          window.mozRequestAnimationFrame     || 
                          window.oRequestAnimationFrame       || 
                          window.msRequestAnimationFrame      || 
                          function(/* function */ callback) {
                            window.setTimeout(callback, MS_IN_SEC / 60);
                          };
                          
var startTime = window.mozAnimationStartTime || Date.now();

/*************************************************************************
  Helper functions
**************************************************************************/
function distance_between(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
}

function coord_to_index(x,gridSpace) {
  return Math.floor(x/gridSpace);
}

function clean_coord(x,gridSpace) {
  return Math.floor(x/gridSpace) * gridSpace;
}
/*************************************************************************
  World
**************************************************************************/
function World(canvas_id) {
  this.canvas_id = "#"+canvas_id; //might change
}

World.prototype = {
  WORLD_WIDTH : 1000,   //defaults - will be set later in _init_world
  WORLD_HEIGHT : 1000,  //defaults - will be set later in _init_world
  
  context : undefined,
  
  scale : 1,
  scaleOptions : [1,8,16,24],
  camera : {x:200,y:100}, //used to translate world so user can move gameboard
  
  gameBoard : undefined,
  gameState : undefined,

  inputManager : undefined,
  
  initialized : false,
  score: 0,
  currentSelected : undefined
}

World.prototype.initialize = function() {
  this._init_world();
  this._init_game();
  this.initialized = true;
}

World.prototype._init_world = function() {
  this.WORLD_WIDTH = window.innerWidth;
  this.WORLD_HEIGHT = window.innerHeight;
  $(this.canvas_id).attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  
  this.context = $("#world")[0].getContext("2d");

  //Init InputManager
  this.inputManager = new InputManager();
  
  var self = this;
  $('#world').bind("mousedown", function(event) {self.inputManager.mouse_down(event);});
  $('#world').bind("mousemove", function(event) {self.inputManager.mouse_move(event);});
  $('#world').bind("mouseup", function(event) {self.inputManager.mouse_up(event);});

  $(document).keydown(function(event) {self.inputManager.key_down(event);});
  $(document).keyup(function(event) {self.inputManager.key_up(event);});
  
  $("#tower").click(function() {self.inputManager.mouseAction = PLACING_TOWER;});
  $("#survivor").click(function() {self.inputManager.mouseAction = PLACING_SURVIVOR;});
  
  $("#start_button").click(function() {self.gameState.run(); self.run(); $(this).css("display","none")});
  $("#pause").click(function() {
      if(self.gameState.is_paused()) {
        startTime = Date.now();
        self.gameState.run();
        self.run(); 
        $(this).html("Pause");
      }
      else if(self.gameState.is_running()) {
        self.gameState.pause(); 
        $(this).html("Play");
      }
    });
}

World.prototype._init_game = function() {
  //init gameBoard
  this.gameBoard = new GameBoard(640,400,20,"rgba(0,0,0,0.05)","rgba(100,100,0,0.3)");
  //init gameState
  this.gameState = new GameStateManager();
  
  var firstLevel = new Level();
  $("#waves").append("<article class='wave_indicator'>Wave "+(0)+"</article>");
  for(var i = 0; i < 50; i++) {
    var currentWave = new Wave();
    for(var j = 0; j < 10*(Math.ceil(i/10)); j++) {
      var tmpX = -10;
      var tmpY = Math.random()*this.gameBoard.height;
      var tmpDir = Math.atan2(this.gameBoard.base.midY-tmpY,this.gameBoard.base.midX-tmpX);
      var tmpDelay = Math.random() * 10000;
      currentWave.add_enemy(new Enemy(tmpX,tmpY,Math.random()*10+15,tmpDir,10*i,10,7,tmpDelay));
    }
    $("#waves").append("<article class='wave_indicator'>Wave "+(i+1)+"</article>");
        
    firstLevel.add_wave(currentWave);
  }
  
  this.gameState.add_level(firstLevel);
  this.gameState.initialize();
  
  this.gameBoard.set_enemies(this.gameState.currentWave.enemies);
}

World.prototype.clear = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.fillStyle = "rgb(235,255,255)";
  context.fillRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
}

World.prototype.draw = function(context) {
  this.clear(context);
  context.save();
    context.scale(this.scale,this.scale);
    context.translate(this.camera.x,this.camera.y);
    this.gameBoard.draw(context); 
  context.restore();
  
  if(this.inputManager.mouseAction === PLACING_TOWER) {
    context.save();
      context.fillStyle = "rgba(0,100,255,0.5)";
      var tmpGrid = this.gameBoard.gridSpace;
      context.fillRect(clean_coord(this.inputManager.mouseX,tmpGrid), clean_coord(this.inputManager.mouseY,tmpGrid), tmpGrid, tmpGrid);
    context.restore();
  }
}

World.prototype.update = function(delta_time) {
  //process input
  this.process_input(delta_time);
  //update gameBoard
  if(this.gameBoard.currentEnemies.length === 0 ) {
    this.gameBoard.set_enemies(this.gameState.get_next_wave());

    $("#wave_number").html(this.gameState.currentWaveIndex);
    $("#wave_window").animate({scrollLeft: this.gameState.currentWaveIndex * 99}, 1000);
  }
  this.gameBoard.update(delta_time);
  $("#score_number").html(this.gameBoard.score);
  $("#health_number").html(this.gameBoard.base.health);
  $("#resources_number").html(this.gameBoard.base.resources);
  
  if(this.gameBoard.base.is_dead()) {
    $("#lose").css("display","block");
    this.gameState.currentState = LOSE;
  }
  //update gameState
}

World.prototype.run = function(timestep) {
  var drawStart   = (timestep || Date.now());
  var delta_time  = drawStart - startTime;

  if(this.gameState.is_running()) {
    this.update(delta_time);
    this.draw(this.context);
    requestAnimFrame(this.run.bind(this));
  }
  startTime = drawStart;
}

World.prototype.process_input = function(delta_time) {
  var tmpX = clean_coord(this.inputManager.mouseX - this.camera.x,this.gameBoard.gridSpace);
  var tmpY = clean_coord(this.inputManager.mouseY - this.camera.y,this.gameBoard.gridSpace);
  var xInd = coord_to_index(this.inputManager.mouseX - this.camera.x,this.gameBoard.gridSpace);
  var yInd = coord_to_index(this.inputManager.mouseY - this.camera.y,this.gameBoard.gridSpace);
  
  if(this.inputManager.is_placing_tower() && this.gameBoard.is_on_board(tmpX,tmpY) && 
      (this.gameBoard.base.resources - 10 >= 0)  && !this.gameBoard.is_occupied(xInd,yInd)) {
    this.gameBoard.add_tower(tmpX,tmpY);
    this.gameBoard.base.resources -= 10;
    if(this.inputManager.keys[LEFT_ARROW] == KEY_UP) {
      this.inputManager.mouseAction = NOTHING; // convert to function
    }
  }

  if(this.inputManager.mouseAction === NOTHING && this.inputManager.mouseState === MOUSE_DOWN && this.gameBoard.is_on_board(tmpX,tmpY)) {
    var tmpSelected = this.gameBoard.occupiedCells[xInd][yInd];
    if(tmpSelected !== false) {
      if(this.currentSelected !== undefined) {
        this.currentSelected.lose_focus();
      }
      this.currentSelected = tmpSelected;
      this.currentSelected.set_focus();
    }
  }
  
  if(this.inputManager.mouseAction === PLACING_SURVIVOR && this.inputManager.mouseState === MOUSE_DOWN && this.gameBoard.is_on_board(tmpX,tmpY)) {
    var tmpSelected = this.gameBoard.occupiedCells[xInd][yInd];
    if(tmpSelected !== false) {
      this.gameBoard.base.survivors[0].tower = tmpSelected;
      tmpSelected.set_survivor(this.gameBoard.base.survivors[0]);
    }
  }
  
  if(this.inputManager.is_placing_tower() && !this.gameBoard.is_on_board(tmpX,tmpY)) {
    this.inputManager.mouseAction = NOTHING; 
    if(this.currentSelected !== undefined) {
      this.currentSelected.lose_focus();
    }
  }
}

/*************************************************************************
  GameBoard
**************************************************************************/
function GameBoard(width,height,gridSpace,gridColor,bgColor) {
  this.width = width;
  this.height = height;
  this.gridSpace = gridSpace;
  this.gridColor = gridColor;
  this.bgColor= bgColor;
  
  this.score = 0;
  this.base = new Base(600,160,40,80,200);
  var tmpSurvivor = new Survivor();
  this.base.add_survivor(tmpSurvivor);
  this.currentEnemies = [];
  
  this.towers = [];
  
  this.projectiles = [];
  
  
  this.maxX = Math.floor(this.width / this.gridSpace)
  this.maxY = Math.floor(this.height / this.gridSpace);
  this.occupiedCells = new Array();
  
  for(var i = 0; i < this.maxX; i++) {
    this.occupiedCells[i] = new Array();
    for(var j = 0; j < this.maxY; j++) {
      this.occupiedCells[i][j] = false;  
    }
  }

  for(var i = 0; i < this.base.width/this.gridSpace; i++) {
    for(var j = 0; j < this.base.height/this.gridSpace; j++) {
      this.occupiedCells[coord_to_index(this.base.x,this.gridSpace)+i][coord_to_index(this.base.y,this.gridSpace)+j] = true;
    }
  }
}

GameBoard.prototype.update = function(delta_time) {
  this.update_enemies(delta_time);
  this.update_towers(delta_time,this.currentEnemies);
  this.update_projectiles(delta_time);
  this.score += this.check_hits();
  this.check_threat();
}

GameBoard.prototype.draw = function(context) {
  context.save();
    context.fillStyle = this.bgColor;
    context.fillRect (0, 0, this.width, this.height);
    this.draw_grid(context);
  context.restore();
  
  this.base.draw(context);
  this.draw_towers(context);
  this.draw_enemies(context);
  this.draw_projectiles(context);
}

GameBoard.prototype.draw_grid = function(context) {
  context.save();
    context.beginPath();
    //Draw Vertical Lines
    for (var x = 0.5; x <= this.width+0.5; x += this.gridSpace) {
      context.moveTo(x, 0);
      context.lineTo(x, this.height);
    }

    //Draw Horizontal Lines
    for (var y = 0.5; y <= this.height+0.5; y += this.gridSpace) {
      context.moveTo(0, y);
      context.lineTo(this.width, y);
    }
    context.strokeStyle = this.gridColor;
    context.stroke();
  context.restore();
}

GameBoard.prototype.draw_towers = function(context) {
  for(var i = 0; i < this.towers.length; i++) {
    this.towers[i].draw(context);
  }
}

GameBoard.prototype.draw_projectiles = function(context) {
  for(var i = 0; i < this.projectiles.length; i++) {
    this.projectiles[i].draw(context);
  }
}

GameBoard.prototype.draw_enemies = function(context) {
  for(var i = 0; i < this.currentEnemies.length; i++) {
    if(this.currentEnemies[i].x > 0 && this.currentEnemies[i].x < this.width &&
        this.currentEnemies[i].y > 0 && this.currentEnemies[i].y < this.height) {
      this.currentEnemies[i].draw(context);
    }
  }
}

GameBoard.prototype.update_enemies = function(delta_time) {
  for(var i = 0; i < this.currentEnemies.length; i++) {
    this.currentEnemies[i].update(delta_time);
  }
}

GameBoard.prototype.update_towers = function(delta_time,enemies) {
  for(var i = 0; i < this.towers.length; i++) {
    var tmpProjectile = this.towers[i].update(delta_time,enemies);
    if(tmpProjectile !== false) {
      this.add_projectile(tmpProjectile);
    }
  }
}

GameBoard.prototype.update_projectiles = function(delta_time) {
  for(var i = 0; i < this.projectiles.length; i++) {
    this.projectiles[i].update(delta_time);
    
    if(this.projectiles[i].x <= 0 || this.projectiles[i].x >= this.width ||
        this.projectiles[i].y <= 0 || this.projectiles[i].y >= this.height) {
      this.projectiles.splice(i--,1);
    }
  }
}

GameBoard.prototype.add_projectile = function(projectile) {
  this.projectiles.push(projectile);
}

GameBoard.prototype.check_hits = function(enemies,projectiles) {

  var tmpScore = 0;
  for(var i = 0; i < this.currentEnemies.length; i++) {
    for(var j = 0; j < this.projectiles.length; j++) {
      if(this.projectiles[j].x >= this.currentEnemies[i].x-this.currentEnemies[i].size && this.projectiles[j].x <= this.currentEnemies[i].x+this.currentEnemies[i].size && 
          this.projectiles[j].y >= this.currentEnemies[i].y-this.currentEnemies[i].size && this.projectiles[j].y <= this.currentEnemies[i].y+this.currentEnemies[i].size) {
        
        tmpScore += this.projectiles[j].damage;
        this.currentEnemies[i].take_damage(this.projectiles[j].damage);
        this.projectiles.splice(j--,1);

        if(this.currentEnemies[i].is_dead()) {
          this.currentEnemies.splice(i--,1);
          break;
        }
      }
    }
  }

  return tmpScore;
}

GameBoard.prototype.check_threat = function() {
  for(var i = 0; i < this.currentEnemies.length; i++) {
    if(this.currentEnemies[i].x >= this.base.x && this.currentEnemies[i].x <= this.base.x+this.base.width &&
        this.currentEnemies[i].y >= this.base.y && this.currentEnemies[i].y <= this.base.y+this.base.height) {
      this.base.health -= this.currentEnemies[i].damage; //change to function
      this.currentEnemies.splice(i--,1);
    }
  }
}

GameBoard.prototype.set_enemies = function(enemies) {
  this.currentEnemies = enemies;
}

GameBoard.prototype.add_tower = function(x,y) {
  var xInd = coord_to_index(x,this.gridSpace);
  var yInd = coord_to_index(y,this.gridSpace);
  
  if(!this.is_occupied(xInd,yInd)) {
    var tmpTower = new Tower(x,y,this.gridSpace);
    this.occupiedCells[xInd][yInd] = tmpTower;
    this.towers.push(tmpTower);
  }
}

GameBoard.prototype.is_occupied = function(x,y) {
  if(this.occupiedCells[x][y] !== false) {
    return true;
  }
  return false;
}

GameBoard.prototype.is_on_board = function(x,y) {
  if(x >= 0 && x < this.width && y >= 0 && y < this.height) {
    return true;
  }
  return false;
}

/*************************************************************************
  Base
**************************************************************************/
function Base(x,y,width,height,health) {
  /* ---TO DO -  create survivor class */
  this.survivors = [];
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.health = health;
  
  this.resources = 200;
  this.midX = this.x + (this.width / 2);
  this.midY = this.y + (this.height / 2);
}

Base.prototype.update = function(delta_time) {

}

Base.prototype.draw = function(context) {
  context.save();
    context.fillStyle = "rgba(75,175,175,0.9)";
    context.fillRect (this.x, this.y, this.width, this.height);
    context.strokeStyle = "rgba(50,125,125,0.9)";
    context.beginPath();
      context.rect (this.x, this.y, this.width, this.height);
    context.stroke();
  context.restore();
}

Base.prototype.is_dead = function() {
  if(this.health <= 0) {
    return true;
  }
  return false;
}

Base.prototype.add_survivor = function(survivor) {
  this.survivors.push(survivor);
}


/*************************************************************************
  Tower
**************************************************************************/
function Tower(x,y,gridSpace) {
  this.x = x;
  this.y = y;
  this.direction = 0;
  this.cooldown = 0;
  this.width = gridSpace;
  this.height = gridSpace;
  
  this.cost = 10;
  //Defaults for the basic tower
  this.range = 125;
  this.projectile_size = 2;
  this.damage = 3;
  this.velocity = 300;
  this.fireRate = 120;
  
  this.midX = this.x + (this.width / 2);
  this.midY = this.y + (this.height / 2);
  
  this.survivor = undefined;
  this.selected = false;
}

Tower.prototype.draw = function(context) {
  
  //Tower and range
  context.save();
    context.fillStyle = "rgba(0,100,255,0.8)";
    context.fillRect (this.x+0.5, this.y+0.5, this.width - 0.5, this.height - 0.5);
    if(this.selected) {
      context.fillStyle = "rgba(0,100,255,0.1)";
      context.beginPath();
        context.arc(this.midX, this.midY, this.range, 0, Math.PI*2, true); //*2
      context.fill();
    }
  context.restore();
  
  //Cannon
  if(this.survivor !== undefined) {
    context.save();
      context.lineWidth = 3;
      context.strokeStyle = "#000000";
      context.translate(this.midX,this.midY);
      context.rotate(this.direction);
      
      context.save();
        context.beginPath();
          context.moveTo(0,0);
          context.lineTo((this.width+this.height) / 2 ,0); //Size of turret is avg of width and length
        context.stroke();
      context.restore();
    context.restore();
  }
  //Line to show engaged enemy
  if(this.target !== undefined) {
    context.save();
      context.strokeStyle = "rgba(255,0,0,0.1)";
      context.beginPath();
        context.moveTo(this.midX,this.midY);
        context.lineTo(this.target.x,this.target.y);
      context.stroke();
    context.restore();
  }
}


Tower.prototype.update = function(delta_time,enemies) {
  if(this.survivor == undefined) {
    return false;
  }
  //Want to add in priority - if closer to goal and in range shoot at it - otherwise shoot at closest
  var distMin = 10000000;

  for(var i = 0; i < enemies.length; i++) {
    var tmpDist = distance_between(enemies[i].x,enemies[i].y,this.midX,this.midY);
    if(tmpDist < distMin ) {
      distMin = tmpDist;
      this.target = enemies[i];
    }
  }

  if(this.target !== undefined) {
    this.direction = Math.atan2(this.target.y-this.midY,this.target.x-this.midX);
    this.cooldown += delta_time;
    if(this.cooldown > this.fireRate) {
      this.cooldown = 0;
      if(distMin < this.range) {
        
        var beta = this.target.direction - this.direction;
        var newDirection = this.direction + Math.asin(Math.sin(beta) * (this.target.velocity / this.velocity));
        
        return new Projectile(this.midX,this.midY,this.velocity,newDirection,this.damage,this.projectile_size);
      }
    }
  }
  return false;
}

Tower.prototype.set_survivor = function(survivor) {
  this.survivor = survivor;
}

Tower.prototype.lose_survivor = function() {
  this.survivor = undefined;
}

Tower.prototype.set_focus = function() {
  this.selected = true;
}

Tower.prototype.lose_focus = function() {
  this.selected = false;
}
/*************************************************************************
  Enemy
*************************************************************************/
function Enemy(x,y,velocity,direction,health,damage,size,delay) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  this.direction = direction;
  this.health = health;
  this.fullHealth = health;
  this.damage = damage;
  this.size = size;
  
  this.time_till_release = delay;
}

Enemy.prototype.update = function(delta_time) {
  if(this.time_till_release > 0) {
    this.time_till_release -= delta_time;
    return;
  }
  var step = (delta_time / MS_IN_SEC);
  var tmpX = step * this.velocity * Math.cos(this.direction);
  var tmpY = step * this.velocity * Math.sin(this.direction);
  
  this.x += tmpX;
  this.y += tmpY;
}

Enemy.prototype.draw = function(context) {
  context.save();
    context.fillStyle = "rgba(255,100,0,0.8)";
    context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI*2, true); //*2
    context.fill();
  context.restore();
}

Enemy.prototype.take_damage = function(damage) {
  this.health -= damage
}

Enemy.prototype.is_dead = function() {
  if(this.health <= 0) {
    return true;
  }
  return false;
}

/*************************************************************************
  Projectile
*************************************************************************/
function Projectile(x,y,velocity,direction,damage,size) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  this.direction = direction;
  this.damage = damage;
  this.size = size;
}

Projectile.prototype.update = function(delta_time) {
  var step = (delta_time / MS_IN_SEC);
  var tmpX = step * this.velocity * Math.cos(this.direction);
  var tmpY = step * this.velocity * Math.sin(this.direction);
  
  this.x += tmpX;
  this.y += tmpY;
}

Projectile.prototype.draw = function(context) {
  context.save();
    context.fillStyle = "rgba(0,0,0,0.8)";
    context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI*2, true); //*2
    context.fill();
  context.restore();
}

/*************************************************************************
  InputManager
*************************************************************************/
function InputManager() {
  this.mouseState = MOUSE_UP;
  this.mouseAction = NOTHING;
  
  this.mouseX = 0;
  this.mouseY = 0;

  this.keys = [];
  this._init_keys();
}

InputManager.prototype._init_keys = function() {
  this.keys[LEFT_ARROW] = KEY_UP;
  this.keys[UP_ARROW] = KEY_UP;
  this.keys[RIGHT_ARROW] = KEY_UP;
  this.keys[DOWN_ARROW] = KEY_UP;
}

InputManager.prototype.set_mouse_state = function(newState) {
  this.mouseState = newState;
}

InputManager.prototype.get_mouse_state = function() {
  return this.mouseState;
}


InputManager.prototype.is_placing_tower = function() {
  if(this.mouseState === MOUSE_DOWN && this.mouseAction === PLACING_TOWER) {
    return true;
  }
  return false;
}

InputManager.prototype.mouse_down = function(event) {
  this.mouseState = MOUSE_DOWN;
  this.mouseX = event.layerX;
  this.mouseY = event.layerY;
}

InputManager.prototype.mouse_move = function(event) {
  this.mouseX = event.layerX;
  this.mouseY = event.layerY;
}

InputManager.prototype.mouse_up = function(event) {
  this.mouseState = MOUSE_UP;
  this.mouseX = event.layerX;
  this.mouseY = event.layerY;
}

InputManager.prototype.key_down = function(event) {
  this.keys[event.keyCode] = KEY_DOWN;
}

InputManager.prototype.key_up = function(event) {
  this.keys[event.keyCode] = KEY_UP;
}

/*************************************************************************
  GameStateManager
*************************************************************************/
function GameStateManager() {
  this.currentState = STOPPED;
  this.levels = [];
  
  this.currentLevel = undefined;
  
  this.currentWaves = [];
  this.currentWave = undefined;
  
  this.currentLevelIndex = 0;
  this.currentWaveIndex = 0;
}

GameStateManager.prototype.run = function() {
  this.currentState = RUNNING;
}

GameStateManager.prototype.pause = function() {
  this.currentState = PAUSED;
}

GameStateManager.prototype.is_running = function() {
  if(this.currentState === RUNNING) {
    return true;
  }
  return false;
}

GameStateManager.prototype.is_paused = function() {
  if(this.currentState === PAUSED) {
    return true;
  }
  return false;
}

GameStateManager.prototype.update = function(delta_time) {

}

GameStateManager.prototype.initialize = function() {
  this.currentLevel = this.levels[0];
  this.currentWaves = this.currentLevel.waves;
  this.currentWave = this.currentWaves[0];
  this.currentWaveIndex = 0;
}

GameStateManager.prototype.get_next_wave = function() {
  this.currentWaveIndex++;
  if(this.currentWaveIndex < this.currentWaves.length) {
    return this.currentWaves[this.currentWaveIndex].get_enemies();
  }
  return false;
}

GameStateManager.prototype.add_level = function(level) {
  this.levels.push(level);
}

/*************************************************************************
  Level
*************************************************************************/
function Level() {
  this.waves = [];
  this.totalWaves = 0;
}

Level.prototype.add_wave = function(wave) {
  this.waves.push(wave);
  this.totalWaves++;
}

Level.prototype.get_waves = function() {
  return this.waves;
}

/*************************************************************************
  Wave
*************************************************************************/
function Wave() {
  this.enemies = [];
  this.totalEnemies = 0;
}

Wave.prototype.add_enemy = function(enemy) {
  this.enemies.push(enemy);
  this.totalEnemies++;
}

Wave.prototype.get_enemies = function() {
  return this.enemies;
}

/*************************************************************************
  Survivor
*************************************************************************/
function Survivor() {
  this.range = 125;
  this.projectile_size = 2;
  this.damage = 3;
  this.velocity = 300;
  this.fireRate = 120;
  this.tower = undefined;
}

/**************
RUN CODE
**************/
$(document).ready(function() {
  var myWorld = new World("world");
  myWorld.initialize();
});


