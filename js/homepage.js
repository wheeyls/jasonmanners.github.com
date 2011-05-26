/************************************
  RequestAnimationFrame declaration
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  || 
                              function(callback){
                                window.setTimeout(callback, MS_IN_SEC / 60);
                              };
                            
var startTime = window.mozAnimationStartTime || Date.now();


function World() {
  this.WORLD_WIDTH = window.innerWidth - 10;
  this.WORLD_HEIGHT = window.innerWidth - 10;
  this.camera = {x : 0, y : 0};
  this.context = null;
}

World.prototype.init_world = function() {
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  this.context = $('#world')[0].getContext("2d");
};

World.prototype.draw = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.fillStyle = "rgba(255,255,150,0.5)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
};

World.prototype.update = function(timestamp) {
};

World.prototype.run = function(timestamp) {
  var drawStart   = (timestamp || Date.now());
  var delta_time  = drawStart - startTime;
  
  this.update(delta_time);
  this.draw(this.context);
  requestAnimationFrame(this.run.bind(this));
  
  startTime = drawStart;
};

var myWorld = new World();
myWorld.init_world();
myWorld.run();