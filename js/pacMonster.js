/************************************
  RequestAnimationFrame declaration
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  || 
                              function(callback){
                                window.setTimeout(callback, MS_IN_SEC / 60);
                              };
                            
var startTime = window.mozAnimationStartTime || Date.now();

function PacMonster(x,y) {
  this.x = x;
  this.y = y;
  this.canvas = $("<canvas/>").attr("width", 100).attr("height", 100).get(0);
  this.context = this.canvas.getContext("2d");
}

PacMonster.prototype.init_canvas = function() {
  this.context.save();
    this.context.fillStyle = "#FFEE00";
    this.context.beginPath();
    this.context.arc(0, 0, 50, 0, Math.PI*2, true);
    this.context.fill();
  this.context.restore();
};


function World() {
  this.WORLD_WIDTH = 500;
  this.WORLD_HEIGHT = 500;
  this.context = null;
  this.pacMonster = new PacMonster(50,300);
}

World.prototype.init_world = function() {
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  $("#world").css("border","1px solid black");
  this.context = $('#world')[0].getContext("2d");
  this.pacMonster.init_canvas();
};

World.prototype.draw = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.fillStyle = "rgb(255,255,255)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.drawImage(this.pacMonster.canvas,this.pacMonster.x,this.pacMonster.y);
};

World.prototype.run = function(timestamp) {
  var drawStart   = (timestamp || Date.now());
  var delta_time  = drawStart - startTime;
  
  //this.update(delta_time);
  this.draw(this.context);
  requestAnimationFrame(this.run.bind(this));
  
  startTime = drawStart;
};

var myWorld = new World();
myWorld.init_world();
myWorld.run();