/************************************
  Constants
*************************************/
const MS_IN_SEC = 1000;

const WIN     = 42;
const LOSE    = 43;
const PAUSED  = 44;
const STOPPED = 45;
const RUNNING = 46;

/************************************
  RequestAnimationFrame declaration
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  ||
                              function(/* function */ callback, /* DOMElement */ element){
                                 window.setTimeout(callback, 1000 / 60, new Date());
                              };
var startTime = window.mozAnimationStartTime || Date.now();

/************************************
  World
*************************************/
function World(canvas_id) {
  this.canvas_id = "#"+canvas_id; //might change
}

World.prototype = {
  WORLD_WIDTH : 1000,   //defaults - will be set later in _init_world
  WORLD_HEIGHT : 1000,  //defaults - will be set later in _init_world
  
  context : undefined,
  gameState : undefined,
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
    newLevel.add_tower(new Tower(300,120));
  }
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
}

Level.prototype = {
  enemies : [],
  towers : [],
  base : undefined
}

Level.prototype.update = function(delta_time) {
  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].update(delta_time);
  }
  
  for(var i = 0; i < this.towers.length; i++) {
    this.towers[i].update(delta_time,this.enemies);
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
}

Tower.prototype.draw = function(context) {
  
  context.save();
    context.fillStyle = "rgba(0,100,255,0.8)";
    context.fillRect (this.x, this.y, 30, 30);
  context.restore();
  context.save();
    context.translate(this.x+15,this.y+15);
    context.rotate(this.direction);
    context.save();
      context.lineWidth = 3;
      context.strokeStyle = "#000000";
      context.beginPath();
      context.moveTo(0.5,0.5);
      context.lineTo(30.5,0.5);
      context.stroke();
    context.restore();
  context.restore();
}

Tower.prototype.update = function(delta_time,enemies) {
  this.direction = Math.atan2(enemies[0].y-this.y+15,enemies[0].x-this.x+15);
}

/************************************
  Projectile
*************************************/
function Projectile() {
}

Projectile.prototype.update = function(delta_time) {
}

Projectile.prototype.draw = function() {
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
    context.fillRect (this.x, this.y, 10, 10);
  context.restore();
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

function TMP() {
  alert("HI");
}
$(document).ready(function() {
  var myWorld = new World("world");
  myWorld.initialize();
  myWorld.run(Date.now());
  
  $("#watch_tower").click(TMP);
});


