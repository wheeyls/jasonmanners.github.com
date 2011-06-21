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
  this.gameState.set_level(newLevel);
}

World.prototype.clear = function(context) {
  context.fillStyle = "rgb(235,255,255)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
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

Level.prototype.draw = function(context) {
  this.gameBoard.draw(context);
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
  context.fillStyle = this.bgColor;
  context.fillRect (0, 0, this.width, this.height);
  this.draw_grid(context);
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
function Tower() {
  
}

Tower.prototype.draw = function() {
  
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
function Enemy() {
}

Enemy.prototype.update = function(delta_time) {
  
}

Enemy.prototype.draw = function() {
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
function Button(x,y,width,height,id) {
  this.id = id;
  /* Might change this and handle it with css */
  this.x = x;
  this.y = y;
  
  this.width  = width;
  this.height = height;
  
  this.display = false;
}

Button.prototype.set_click = function(clickfunction) {
  $("#"+this.id).click(clickfunction);
}

$(document).ready(function() {
  var myWorld = new World("world");
  myWorld.initialize();
  myWorld.run(Date.now());
});
