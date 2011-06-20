/************************************
  Constants
*************************************/
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
}

World.prototype._init_world = function() {
  this.WORLD_WIDTH = window.innerWidth;
  this.WORLD_HEIGHT = window.innerHeight;
  $(this.canvas_id).attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
}

World.prototype.clear = function() {
  
}

World.prototype.draw = function() {
  this.clear();
}

World.prototype.update = function(delta_time) {
  if(this.game_state.is_running()) {
    //Update code here
  }
}

World.prototype.run = function(timestep) {
  var drawStart   = (timestamp || Date.now());
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

GameState.prototype.setLevel = function(level)  {
  this.currentLevel = level;
}

GameState.prototype.setState = function(state) {
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
function Level() {
}

Level.prototype.darw = function() {
  
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
function Button(x,y,width,height) {
  /* Might change this and handle it with css */
  this.x = x;
  this.y = y;
  
  this.width  = width;
  this.height = height;
  
  this.display = false;
}
