/************************************
  RequestAnimationFrame declaration
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  || 
                              function(callback){
                                window.setTimeout(callback, MS_IN_SEC / 60);
                              };
                            
var startTime = window.mozAnimationStartTime || Date.now();


function Block(x,y) {
  this.x = x;
  this.y = y;
  this.width = 10;
  this.height = 10;
  this.canvas = $("<canvas/>").attr("width", 100).attr("height", 100).get(0);
  this.context = this.canvas.getContext("2d");
}

Block.prototype.init_canvas = function() {
  this.context.save();
    this.context.fillStyle = "rgba(75,130,255,0.5)";
    this.context.fillRect (0, 20, this.width, this.height);
    this.context.fillRect (10, 0, this.width, this.height);
    this.context.fillRect (10, 10, this.width, this.height);
    this.context.fillRect (10, 20, this.width, this.height);
  this.context.restore();
};

function PacMonster(x,y) {
  this.x = x;
  this.y = y;
  this.radius = 50;
  this.canvas = $("<canvas/>").attr("width", 200).attr("height", 200).get(0);
  this.context = this.canvas.getContext("2d");
  this.canvas2 = $("<canvas/>").attr("width", 200).attr("height", 200).get(0);
  this.context2 = this.canvas2.getContext("2d");
  this.canvases = [this.canvas,this.canvas2];
}

PacMonster.prototype.init_canvas = function() {
  this.context.save();
    this.context.fillStyle = "rgba(255,238,0,1.0)";
    this.context.beginPath();
    this.context.arc(100, 100, this.radius, Math.PI*1.80, Math.PI*0.2, true);
    this.context.lineTo(100, 100);
    this.context.closePath();
    this.context.fill();
  this.context.restore();
  
  this.context2.save();
    this.context2.fillStyle = "rgba(255,238,0,1.0)";
    this.context2.beginPath();
    this.context2.arc(100, 100, this.radius, 0, Math.PI*2, true);
    this.context2.fill();
  this.context2.restore();

};


function World() {
  this.WORLD_WIDTH = 600;
  this.WORLD_HEIGHT = 300;
  this.camera = {x : 0, y : 0};
  this.context = null;
  this.pacMonster = new PacMonster(50,100);
  this.block = new Block(300,170);
  this.i = 0;
}

World.prototype.init_world = function() {
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  this.context = $('#world')[0].getContext("2d");
  this.pacMonster.init_canvas();
  this.block.init_canvas();
};

World.prototype.draw = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.fillStyle = "rgba(255,255,255,0)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  //Convert to own canvas for bg image
  /*  context.save();
  // Create radial gradient
  grad = context.createRadialGradient(300,300,0,300,300,325); 
  grad.addColorStop(0, "rgba(0,0,150,0.25)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
 
  // assign gradients to fill
  context.fillStyle = grad;

  // draw 600x600 fill
  context.fillRect(0,0,this.WORLD_WIDTH,this.WORLD_HEIGHT);
   */
  context.save();
    //context.scale(0.25,0.25);
    context.translate(-this.camera.x,this.camera.y);
    context.drawImage(this.block.canvas,this.block.x,this.block.y);
    context.drawImage(this.pacMonster.canvases[Math.floor(this.i/10)],this.pacMonster.x,this.pacMonster.y);
  context.restore();
};

World.prototype.update = function(timestamp) {
  this.i++;
  this.i %= 20;
  this.camera.x += 0.2;
  this.pacMonster.x += 0.2;
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