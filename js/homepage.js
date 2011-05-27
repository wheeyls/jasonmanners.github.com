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
function FractalPoint(x,y) {
  this.x = x;
  this.y = y;
  this.lifespan = 0;
  this.color = "rgba("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+",0.8)";
}

FractalPoint.prototype.update = function(delat_time) {
};

FractalPoint.prototype.draw = function(context) {
  /*context.save();
    context.beginPath();
    context.fillStyle = this.color;
    context.moveTo(this.x, this.y);
    context.arc(this.x, this.y, 30, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
  context.restore();
  */
  context.save();
    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = 3;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.arc(this.x, this.y, 5, 0, 2 * Math.PI, true);
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
  this.treePoints = [{x : Math.floor(Math.random()*10), y : Math.floor(Math.random()*10), frag: 0.1}];
  this.timePassed = 0;
  this.fractalPoint = new FractalPoint(this.WORLD_WIDTH/2,this.WORLD_HEIGHT/2);
}

World.prototype.init_world = function() {
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  this.context = $('#world')[0].getContext("2d");
};

World.prototype.draw = function(context) {
  //Don't want to clear because it will cause the drawings to clear
  //context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  //context.fillStyle = "rgba(255,255,250,0.5)";
  //context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  this.fractalPoint.draw(context);
};

World.prototype.update = function(delta_time) {
  this.timePassed += delta_time;
  this.treePoints[this.treePoints.length-1].frag += 0.05;
  if(this.timePassed > 300) {
    this.treePoints.push({x : Math.floor(Math.random()*10), y : Math.floor(Math.random()*10), frag: 0.05});
    this.timePassed = 0;
  }
  this.fractalPoint.x += Math.random() * 5 - 2.5;
  this.fractalPoint.y -= Math.random() * 5;
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