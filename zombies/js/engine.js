/************************************
  Constants
*************************************/
const MS_IN_SEC = 1000;

const WIN     = 42;
const LOSE    = 43;
const PAUSED  = 44;
const STOPPED = 45;
const RUNNING = 46;

var mouseType = 0;
/************************************
  RequestAnimationFrame declaration
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  ||
                              function(/* function */ callback, /* DOMElement */ element){
                                 window.setTimeout(callback, MS_IN_SEC / 60, new Date());
                              };
var startTime = window.mozAnimationStartTime || Date.now();

/************************************
  Helper functions
*************************************/
function distance_between(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
}

/************************************
  World
*************************************/
function World(canvas_id) {
  this.canvas_id = "#"+canvas_id; //might change
  this.gameState = undefined;
}

World.prototype = {
  WORLD_WIDTH : 1000,   //defaults - will be set later in _init_world
  WORLD_HEIGHT : 1000,  //defaults - will be set later in _init_world
  
  context : undefined,
  levels : [],
  
  scale : 1,
  scaleOptions : [1,8,16,24],
  
  initialized : false,
  
}

World.prototype.initialize = function() {
  this._init_world();
  this._init_objects();
}

World.prototype._init_world = function() {
  this.WORLD_WIDTH = window.innerWidth;
  this.WORLD_HEIGHT = window.innerHeight;
  $(this.canvas_id).attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  
  this.context = $("#world")[0].getContext("2d");
  var self = this;
  $('#world').bind("mousedown",function(event) { mouse_down(event,self);});
 // $('#world').bind("mousemove",mouse_move);
 // $('#world').bind("mouseup",mouse_up);
}

World.prototype._init_objects = function() {
  this.gameState = new GameState();
  this.gameState.set_state(RUNNING);
  
  /* Should be done seperate from engine but this is just for testing */
  var newLevel = new Level(510,360,30,"#222222");
  for(var i = 0; i < 10; i++) {
    var tmpX = -(i*15);
    var tmpY = Math.random()*300+20;
    var tmpDir = Math.atan2(150-tmpY,500-tmpX);
    newLevel.add_enemy(new Enemy(tmpX,tmpY,Math.random()*10+15,tmpDir,10,10));  
  }
  //newLevel.add_tower(new Tower(300,120));
  //newLevel.add_tower(new Tower(270,180));
  this.gameState.set_level(newLevel);
}

World.prototype.clear = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.fillStyle = "rgb(235,255,255)";
  context.fillRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
}

World.prototype.draw = function(context) {
  this.clear(context);
  context.save();
    context.translate(300,200);
    this.gameState.currentLevel.draw(context);
  context.restore();
}

World.prototype.update = function(delta_time) {
  if(this.gameState.is_running()) {
    //Update code here
    this.gameState.currentLevel.update(delta_time);
    if(this.gameState.currentLevel.enemies.length == 0) {
      this.gameState.set_state(STOPPED);
    }
  }
}

World.prototype.run = function(timestep) {
  var drawStart   = (timestep || Date.now());
  var delta_time  = drawStart - startTime;
  
  if(this.gameState.currentState === RUNNING) {
    this.update(delta_time);
    this.draw(this.context);
    requestAnimationFrame(this.run.bind(this));
  }
  startTime = drawStart;
}

/************************************
  GameState
*************************************/
function GameState() {
  this.currentState = STOPPED;
  this.currentLevel;
}

GameState.prototype.set_level = function(level)  {
  this.currentLevel = level;
}

GameState.prototype.set_state = function(state) {
  this.currentState = state;
}

GameState.prototype.is_running = function() {
  if(this.currentState === RUNNING) {
    return true;
  }
  return false;
}

/************************************
  Level
*************************************/
function Level(width,height,gridSpace,gridColor) {
  this.gameBoard = new GameBoard(width,height,gridSpace,gridColor,"rgba(100,100,0,0.3)");
  this.enemies = [];
  this.towers = [];
  this.base = undefined;
}

Level.prototype.update = function(delta_time) {
  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].update(delta_time);
  }
  
  for(var i = 0; i < this.towers.length; i++) {
    this.towers[i].update(delta_time,this.enemies);
  }
  
  for(var i = 0; i < this.towers.length; i++) {
    for(var k = 0; k < this.enemies.length; k++) {
      for(var j = 0; j < this.towers[i].projectiles.length; j++) {
      
        if(this.towers[i].projectiles[j].x-2 >= this.enemies[k].x-10 && this.towers[i].projectiles[j].x-2 <= this.enemies[k].x+10 &&
          this.towers[i].projectiles[j].y-2 >= this.enemies[k].y-10 && this.towers[i].projectiles[j].y-2 <= this.enemies[k].y+10) {
          
          this.enemies[k].hit(this.towers[i].projectiles[j].damage);
          
          this.towers[i].projectiles.splice(j,1);
          if(this.enemies[k].health <= 0) {
            this.enemies.splice(k,1); 
            break;
          }
        }
      }
    }
  }
  
}

Level.prototype.draw = function(context) {
  this.gameBoard.draw(context);
  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].draw(context);
  }
  for(var i = 0; i < this.towers.length; i++) {
    this.towers[i].draw(context);
  }
}

Level.prototype.add_enemy = function(enemy) {
  this.enemies.push(enemy);
}

Level.prototype.add_tower = function(tower) {
  this.towers.push(tower);
}
/************************************
  GameBoard
*************************************/
function GameBoard(width,height,gridSpace,gridColor,bgColor) {
  this.width = width;
  this.height = height;
  this.gridSpace = gridSpace;
  this.gridColor = gridColor;
  this.bgColor= bgColor;
}

GameBoard.prototype.draw = function(context) {
  context.save();
    context.fillStyle = this.bgColor;
    context.fillRect (0, 0, this.width, this.height);
    this.draw_grid(context);
  context.restore();
}

GameBoard.prototype.draw_grid = function(context) {
  context.save();
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

/************************************
  Tower
*************************************/
function Tower(x,y) {
  this.x = x;
  this.y = y;
  this.direction = 0;
  this.fireRate = 300;
  this.cooldown = 0;
  this.projectiles = [];
}

Tower.prototype.draw = function(context) {
  
  context.save();
    context.fillStyle = "rgba(0,100,255,0.8)";
    context.fillRect (this.x, this.y, 30, 30);
    context.fillStyle = "rgba(0,100,255,0.2)";
    context.beginPath();
      context.arc(this.x+15, this.y+15, 200, 0, Math.PI*2, true); //*2
    context.fill();
  context.restore();
  
  context.save();
    context.lineWidth = 3;
    context.strokeStyle = "#000000";
    context.translate(this.x+15,this.y+15);
    context.rotate(this.direction);
    
    context.save();
      context.beginPath();
        context.moveTo(0,0);
        context.lineTo(30,0);
      context.stroke();
    context.restore();
  context.restore();
  
  context.save();
  context.strokeStyle = "#FF0000";
   context.beginPath();
      context.moveTo(this.x+15,this.y+15);
      context.lineTo(this.xMin,this.yMin);
    context.stroke();
  context.restore();
  for(var i = 0; i < this.projectiles.length; i++) {
    this.projectiles[i].draw(context);
  }
}


Tower.prototype.update = function(delta_time,enemies) {
  this.xMin = 0;
  this.yMin = 0;
  var distMin = 10000000;
  
  for(var i = 0; i < this.projectiles.length; i++) {
    this.projectiles[i].update(delta_time);
  }
  
  for(var i = 0; i < enemies.length; i++) {
    var tmpDist = distance_between(enemies[i].x,enemies[i].y,this.x+15,this.y+15);
    if(tmpDist < distMin ) {
      distMin = tmpDist
      this.xMin = enemies[i].x;
      this.yMin = enemies[i].y;
    }
  }

  this.direction = Math.atan2(this.yMin-this.y-15,this.xMin-this.x-15);
  this.cooldown += delta_time;
  if(this.cooldown > this.fireRate) {
    this.cooldown = 0;
    if(distMin < 200) {
      this.projectiles.push(new Projectile(this.x+15,this.y+15,300,this.direction,5));
    }
  }
}

/************************************
  Projectile
*************************************/
function Projectile(x,y,velocity,direction,damage) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  this.direction = direction;
  this.damage = damage;
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
    context.fillRect (this.x, this.y, 4, 4);
  context.restore();
}

/************************************
  Enemy
*************************************/
function Enemy(x,y,velocity,direction,health,damage) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  this.direction = direction;
  this.health = health;
  this.damage = damage;
}

Enemy.prototype.update = function(delta_time) {
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
      context.arc(this.x, this.y, 10, 0, Math.PI*2, true); //*2
    context.fill();
  context.restore();
}

Enemy.prototype.hit = function(damage) {
  this.health -= damage
}

/************************************
  Base
*************************************/
function Base() {
}

Base.prototype.update = function(delta_time) {
}

Base.prototype.draw = function() {
}

/************************************
  HUD
*************************************/
function HUD() {
  
}

/************************************
  Button
*************************************/
function GameButton(x,y,width,height,id) {
  this.id = id;
  this.display = false;
}
/* DOESNT WORK? */
GameButton.prototype.set_click = function(clickfunction) {
  $("#"+this.id).click(clickfunction);
}

/******************************
  mouse down event
******************************/
function mouse_down(event,world) {
  var cleanX = Math.floor((event.layerX - 300) / 30) * 30;
  var cleanY = Math.floor((event.layerY - 200) / 30) * 30;
  if(mouseType === 1) {
    world.gameState.currentLevel.add_tower(new Tower(cleanX,cleanY));
    mouseType = 0;
  }
}

/******************************
  mouse move event
******************************/
/*
function mouse_move(event) {
  if(move_square) {
    grabbed_square.x = event.layerX-5-(GRID_SPACE/2);
    grabbed_square.y = event.layerY-5-(GRID_SPACE/2);
  }
}
*/
/******************************
  mouse up event
******************************/
/*
function mouse_up(event) {
  cleanX = cleanSelection(event.layerX-5);
  cleanY = cleanSelection(event.layerY-5);
  var mySquares = gameBoard.get_squares();
  for(i in mySquares) {
    if(mySquares[i] != grabbed_square) {
      if(move_square & mySquares[i].x == cleanX && mySquares[i].y == cleanY) {
        grabbed_square.x = (cleanX+GRID_SPACE)%WORLD_WIDTH;
        grabbed_square.y = cleanY;
      }
      else if(move_square) {
        grabbed_square.x = cleanX;
        grabbed_square.y = cleanY;
      }
    }
  }
  move_square = false;
}
*/

function TMP() {
  mouseType = 1;
}

function reset(myWorld) {
  myWorld = new World("world");
  myWorld.initialize();
  myWorld.run(Date.now());
}

$(document).ready(function() {
  
  var myWorld = new World("world");
  myWorld.initialize();
  myWorld.run(Date.now());

  $("#watch_tower").click(TMP);
  $("#guard_tower").click(function(){reset(myWorld);});
});


