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
  var tmpX = mouse_x - width/2;
  this.y = height - (Math.sqrt(1000*1000 - tmpX*tmpX)*0.85) + height/2;
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
  this.stars = [];
  for(var i = 0; i < 300; i++) {
    this.stars[i] = { x : Math.floor(Math.random() * this.WORLD_WIDTH),
                      y : Math.floor(Math.random() * this.WORLD_HEIGHT),
                      radius: Math.floor(Math.random() * 3) };
  }
}

World.prototype.init_world = function() {
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  this.context = $('#world')[0].getContext("2d");
  $('#world').bind("mousemove", this.mouse_move.bind(this));
};

World.prototype.draw = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  var tmpColor = Math.floor(255 * (1 - (this.mouse_x / this.WORLD_WIDTH)));
  console.log(tmpColor);
  context.fillStyle = "rgba("+tmpColor+","+tmpColor+","+tmpColor+",0.95)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  
  for(var i = 0; i < this.stars.length; i++) {
    context.save();
    
    context.fillStyle = "rgba(255,255,255,0.8)";
    context.shadowColor = "rgba(255,255,255,0.8)";
    context.shadowBlur = 8;
    context.beginPath();
    context.arc(this.stars[i].x, this.stars[i].y, this.stars[i].radius, 0, 2 * Math.PI, true);
    context.closePath();
    context.fill();
    context.restore();
    context.restore();
  }
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