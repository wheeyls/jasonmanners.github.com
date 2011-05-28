/************************************
  RequestAnimationFrame declaration
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  ||
                              function(/* function */ callback, /* DOMElement */ element){
                                 window.setTimeout(callback, 1000 / 60, +new Date());
                              };
var startTime = window.mozAnimationStartTime || Date.now();

/************************************
  Gradient declaration
*************************************/
function GradientBack(x,y) {
  this.x = x;
  this.y = y;
  this.canvas = $("<canvas/>").attr("width", x).attr("height", y).get(0);
  this.context = this.canvas.getContext("2d");
  
  var placement = 0.85;
  
  var grad = this.context.createRadialGradient(this.x*placement,10,0,this.x*placement,10,600); 
  grad.addColorStop(0, "rgba(0,0,150,0.25)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  this.context.fillStyle = grad;
  this.context.fillRect (0, 0, this.x, this.y);
  
  /* cool corner gradient
  this.context.createRadialGradient(this.x/2,0,this.x/2,300,300,325);
  */
  
}


/************************************
  Sun declaration
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
  this.y = 1100 - Math.sqrt(1000*1000 - tmpX*tmpX);
  this.color = "rgba(255,"+(238+(Math.floor(ratio*12)))+"238,"+(Math.floor(ratio*255))+",0.8)";
};

Sun.prototype.draw = function(context) {
  context.save();
    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = 30;
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
  this.WORLD_WIDTH = window.innerWidth-5;
  this.WORLD_HEIGHT = window.innerHeight-5;
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
  this.gbackground = new GradientBack(this.WORLD_WIDTH,this.WORLD_HEIGHT);
}

World.prototype.init_world = function() {
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  this.context = $('#world')[0].getContext("2d");
  $('#world').bind("mousemove", this.mouse_move.bind(this));
  $(window).resize(this.resize_window.bind(this));
};

World.prototype.draw = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  var ratio = this.mouse_x / this.WORLD_WIDTH;
  var tmpRatio = 40*ratio;
  var finalRatio = (this.mouse_x + tmpRatio) / this.WORLD_WIDTH;
  var tmpColor = Math.floor(255 * (1 - finalRatio));
  context.fillStyle = "rgba("+tmpColor+","+tmpColor+","+tmpColor+",0.95)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  
  context.drawImage(this.gbackground.canvas,0,0);
  
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

World.prototype.run_other = function(timestamp) {
  
};

World.prototype.mouse_move = function (event) {
  this.sun.update(event.layerX,this.WORLD_WIDTH,this.WORLD_HEIGHT);
  this.mouse_x = event.layerX;
};

World.prototype.resize_window = function () {
  this.WORLD_WIDTH = window.innerWidth-5;
  this.WORLD_HEIGHT = window.innerHeight-5;
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  for(var i = 0; i < 300; i++) {
    this.stars[i] = { x : Math.floor(Math.random() * this.WORLD_WIDTH),
                      y : Math.floor(Math.random() * this.WORLD_HEIGHT),
                      radius: Math.floor(Math.random() * 3) };
  }
  this.gbackground = new GradientBack(this.WORLD_WIDTH,this.WORLD_HEIGHT);
};

World.prototype.start = function() {
  setTimeout("test()",1000/60);
};
var myWorld = new World();
myWorld.init_world();
//myWorld.run();
myWorld.start();

function test() {
  myWorld.update(15);
  myWorld.draw(myWorld.context);
  setTimeout("test()",1000/60);
}