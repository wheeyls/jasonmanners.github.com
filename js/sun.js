/************************************
  RequestAnimationFrame declaration
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  || 
                              function(callback){
                                window.setTimeout(callback, MS_IN_SEC / 60);
                              };
                            
var startTime = window.mozAnimationStartTime || Date.now();

/************************************
  FractalPoint declaration
*************************************/
function Sun(x,y) {
  this.x = x;
  this.y = y;
  this.color = "rgba(255,238,0,0.8)";
}

Sun.prototype.update = function(mouse_x,width,height) {
  this.x = mouse_x;
  var ratio = mouse_x / width;
  var tmp_y = ratio * (height / 2);
  var final_y = (height / 2) - tmp_y;
  this.y = final_y;//Math.sqrt(1000*1000 - tmpX*tmpX) - 300;
};

Sun.prototype.draw = function(context) {
  context.save();
    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = 15;
    context.beginPath();
    context.arc(this.x, this.y, 40, 0, 2 * Math.PI, true);
    context.closePath();
    context.fill();
    context.restore();
};

/************************************
  World object declaration
*************************************/
function World() {
  this.WORLD_WIDTH = window.innerWidth-10;
  this.WORLD_HEIGHT = window.innerHeight-10;
  this.camera = {x : 0, y : 0};
  this.context = null;
  this.timePassed = 0;
  this.sun = new Sun(0,this.WORLD_HEIGHT/2);
  this.mouse_x = 0;
}

World.prototype.init_world = function() {
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  this.context = $('#world')[0].getContext("2d");
  $('#world').bind("mousemove", this.mouse_move.bind(this));
};

World.prototype.draw = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  var tmpColor = Math.floor(255 * (this.WORLD_WIDTH - this.mouse_x));
  console.log(tmpColor);
  context.fillStyle = "rgba("+tmpColor+","+tmpColor+","+tmpColor+",0.5)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  this.sun.draw(context);
};

World.prototype.update = function(delta_time) {
  this.timePassed += delta_time;
};

World.prototype.run = function(timestamp) {
  var drawStart   = (timestamp || Date.now());
  var delta_time  = drawStart - startTime;
  
  this.update(delta_time);
  this.draw(this.context);
  requestAnimationFrame(this.run.bind(this));
  
  startTime = drawStart;
};

World.prototype.mouse_move = function (event) {
  this.sun.update(event.layerX,this.WORLD_WIDTH,this.WORLD_HEIGHT);
  this.mouse_x = event.layerX;
};

var myWorld = new World();
myWorld.init_world();
myWorld.run();