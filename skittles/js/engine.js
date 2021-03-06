//Constants
const MS_IN_SEC = 1000;

const RUNNING = 42; // Answer to life
const LOSE    = 43;
const WIN     = 44;
const PAUSE   = 45;
const STOPPED = 46;

const PLAYER_RUNNING = 101;
const PLAYER_STOP = 102;
const PLAYER_JUMP = 103;
const PLAYER_TELEPORT = 104;

/************************************
  RequestAnimationFrame declaration
  -may use setInterval with a date.now() call
*************************************/
var requestAnimationFrame =   window.mozRequestAnimationFrame     || 
                              window.webkitRequestAnimationFrame  ||
                              function(/* function */ callback, /* DOMElement */ element){
                                 window.setTimeout(callback, 1000 / 60, new Date());
                              };
var startTime = window.mozAnimationStartTime || Date.now();

/************************************
  World declaration
*************************************/
function World() {
  this.WORLD_WIDTH = 800;
  this.WORLD_HEIGHT = 494;
  
  this.MARGIN_LEFT = 50;
  this.MARGIN_RIGHT = this.WORLD_WIDTH - 150;
  
  this.context = undefined;
  
  /* --- Gives us the ability to scroll and focus on certain portions of the map --- */
  this.camera = {x : 0, y : 0};
  this.effect = {x : 0, y : 0};
  
  this.world_state = STOPPED;
  this.initialized = false;
  
  /*--- All objects in the game world ---*/
  this.player = undefined;
  this.level_objects = [];
  
  /*--- Current Level ---*/
  this.current_level = undefined;
  this.levels = []; //have yet to decide the def of a level
  
  /*--- Input Queue ---*/
  this.input_queue = [];
  
  /*--- Physics Consts ---*/
  this.GRAVITY = 10;
}

World.prototype.init_world = function() {
  this._init_canvas();
  this._init_input();
  this._init_game_objects();
  this.initialized = true;
}

World.prototype._init_canvas = function() {
  var worldWidth = window.innerWidth/2 - (this.WORLD_WIDTH/2);
  $("#world").attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  $("#world").css("position","absolute");
  $("#world").css("left",worldWidth+"px");
  $("#world").css("top","50px");
  $("#world").css("border","1px solid #000000");
  
  this.context = $("#world")[0].getContext("2d");
}

World.prototype._init_input = function() {
  /* Something like this */
  $(document).keydown(this.queue_key_down.bind(this));
  $(document).keyup(this.queue_key_up.bind(this));
  //$(document).bind("mousedown",this.queue_mouse.bind(this));
  //$(document).bind("mouseup",this.dequeue_mouse.bind(this));
  //$(document).bind("mousemove",this.change_mouse.bind(this));
}

World.prototype._init_game_objects = function() {
  this.player = new Player(210,150);
  this.currentLevel = new Level();
  this.levels[0] = this.currentLevel;
  this.level_objects = this.currentLevel.building_blocks;
}

World.prototype.start = function() {
  this.world_state = RUNNING;
  requestAnimationFrame(this.run.bind(this));
}

World.prototype.run = function(timestamp) {
  var drawStart   = (timestamp || Date.now());
  var delta_time  = drawStart - startTime;
  
  if(this.world_state === RUNNING) {
    this.update(delta_time);
    this.draw(this.context);
    requestAnimationFrame(this.run.bind(this));
  }
  startTime = drawStart;
}

World.prototype.clear = function(context) {
  /* 
    Erase all dynamic objects
    erase everything until performance becomes an issue
  */
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.fillStyle = "rgb(255,255,255)";
  context.fillRect (0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
}

World.prototype.update = function(delta_time) {
  //TEMP to check camera translations
  //this.camera.x += 0.1; //+ : right || - : left
  //this.camera.y += 0.1; //+ : down || - : up
  this.process_input();
  this.player.draft_update(delta_time,this.GRAVITY);
  
  var isIntercept = false;
  for(var i = 0; i < this.level_objects.length; i++) {
    var _collision = this.player.check_collision(this.level_objects[i]);
    if(_collision.collide) {
      isIntercept = true;
      this.player.set_coords(this.level_objects[i],_collision);
      break;
    }
  }
  
  this.player.publish_update();
  
  
  if(this.player.x > (this.MARGIN_RIGHT + this.camera.x)) {
    var xDiff = this.player.x - (this.camera.x + this.MARGIN_RIGHT);
    this.update_camera(xDiff);
  }
  else if(this.player.x < (this.MARGIN_LEFT + this.camera.x)) {
    var xDiff = this.player.x - (this.camera.x + this.MARGIN_LEFT);
    this.update_camera(xDiff);
  }
  /*
  for(var i = 0, ii = this.game_objects.length; i < ii; i++) {
    var isCollide = false;
    this.game_objects[i].temporary_update();
    
    for(var j = 0, jj = this.static_objects.length; j < jj; j++) {
      this.game_objects[i].checkCollision(this.static_objects[j].x,this.static_objects[j].y);
    }
    
    if(!isCollide) {
      this.game_objects[i].publish_update();
    }
  }
  */
}

World.prototype.draw = function(context) {
  this.clear(context);

  context.save();
    context.translate(-this.camera.x+this.effect.x,-this.camera.y+this.effect.y); // might not need to -y
    /*for(var i = 0, ii = this.level_objects.length; i < ii; i++) {
      this.level_objects[i].draw(context);
    }*/
    this.currentLevel.draw(context);
    this.player.draw(context);
  context.restore();
  /*
  this.erase();
  save
  translate(camera.x+effect.x,camera.y,effect.y);
  for OBJECTS
    drawIfOnScreen
  restore
  */
}

World.prototype.queue_key_down = function(event) {
  this.change_input_queue(event,"KEY_DOWN");
}

World.prototype.queue_key_up = function(event) {
  this.change_input_queue(event,"KEY_UP");
}

World.prototype.process_input = function() {
  if(this.input_queue["RIGHT"]) {
    this.player.run(1);
  }
  else if(this.input_queue["LEFT"]) {
    this.player.run(-1);
  }
  else if(!this.input_queue["LEFT"]) {
    this.player.stop_run();
  }
  
  if(this.input_queue["UP"]) {
    this.player.jump();
    this.input_queue["UP"] = false;
  }
  
  if(this.input_queue["DOWN"]) {
    this.player.teleport();
    this.input_queue["DOWN"] = false;
  }
}

World.prototype.change_input_queue = function(event,type) {
  var inputType = false;
  if(type === "KEY_DOWN") {
      inputType = true;
  }
  
  switch(event.keyCode) {
    case 37: // Left Arrow
      this.input_queue["LEFT"] = inputType;
      break;
    case 38: // Up Arrow
      this.input_queue["UP"] = inputType;
      break;
    case 39: // Right Arrow
      this.input_queue["RIGHT"] = inputType;
      break;
    case 40: // Down Arrow
      this.input_queue["DOWN"] = inputType;
      break;
  }
};

World.prototype.update_camera = function(xDiff) {
  this.camera.x += xDiff;
};
/************************************
  Player declaration
*************************************/
function Player(x,y) {
  this.x = x;
  this.y = y;
  this.tmp_x = x;
  this.tmp_y = y;
  this.width = 20;
  this.height = 50;
  
  this.halfX = (this.width/2);
  this.halfY = (this.height/2);
  
  this.corner_x = this.x - (this.width/2);
  this.corner_y = this.y + (this.height/2);
  
  this.mass = 3;
  this.direction = 1;
  
  this.state;
  //var calcVelocity = this.getVelocityVector(velocity,direction);
  this.xVelocity = 0;//calcVelocity.x;
  this.yVelocity = 0;//calcVelocity.y;
}

Player.prototype.draw = function(context) {
  if(this.state !== PLAYER_TELEPORT) {
    context.save();
      //context.drawImage(this.image,this.x,this.y);
      context.fillStyle = "rgba(200,0,0,0.5)";
      context.fillRect (this.corner_x, this.corner_y, this.width, this.height); 
    context.restore();
  }
};

Player.prototype.draft_update = function(delta_time,gravity) {
  this.tmp_x = this.x + this.getDeltaX(delta_time);
  this.tmp_y = this.y + this.getDeltaY(delta_time,gravity);
};

Player.prototype.publish_update = function() {
  this.x = this.tmp_x;
  this.y = this.tmp_y;
  this.corner_x = this.x - this.halfX;
  this.corner_y = this.y - this.halfY;
  if(this.state === PLAYER_TELEPORT) {
    this.xVelocity /= 2;
    if(Math.abs(this.xVelocity) < 100) {
      this.state = 0;
      this.xVelocity = 0;
    }
  }
};

Player.prototype.getDeltaX = function(delta_time){
  return (delta_time/MS_IN_SEC) * this.xVelocity;
};

Player.prototype.getDeltaY = function(delta_time,gravity){
  this.yVelocity += gravity*this.mass;
  return (delta_time/MS_IN_SEC) * this.yVelocity;
};

Player.prototype.getVelocityVector = function(radius, angle) {
  return {
    x : radius*Math.cos(angle),
    y : radius*Math.sin(angle)
  };
};

Player.prototype.getWorldToScreenCoords = function(camera) {
  return {
    x : this.x - camera.x,
    y : this.y - camera.y
  };
};

Player.prototype.check_collision = function(block_object) {
  if(this.x >= block_object.x && this.x <= block_object.x+block_object.width && 
      this.y >= block_object.y && this.y <= block_object.y+block_object.height &&
      this.yVelocity > 0) {
    return {collide: true};
  }
  return {collide: false};
};

Player.prototype.check_collision_y = function(block_object) {
  if(this.x >= block_object.x && this.x <= block_object.x+block_object.width && 
      this.y >= block_object.y && this.y <= block_object.y+block_object.height &&
      this.yVelocity > 0) {
    return {collide: true};
  }
  return {collide: false};
};

Player.prototype.set_coords = function(block_object,collide_object) {
  //eventually check which side but for now only y
  this.tmp_y = block_object.y;
  this.yVelocity = 0;
};

Player.prototype.run = function(direction) {
  this.direction = direction;
  this.xVelocity = 300*direction;
}

Player.prototype.stop_run = function() {
  if(this.state !== PLAYER_TELEPORT) {
    this.xVelocity = 0;
  }
}

Player.prototype.jump = function() {
  this.yVelocity = -600;
}

Player.prototype.teleport = function() {
  //this.x += 100*this.direction;
  this.state = PLAYER_TELEPORT;
  this.xVelocity = 5000*this.direction;
}
/************************************
  LevelBlock declaration
*************************************/
function LevelBlock(x,y,width,height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

LevelBlock.prototype.draw = function(context) {
  context.save();
    context.fillStyle = "rgba(0,200,200,0.5)";
    context.fillRect (this.x, this.y, this.width, this.height);
  context.restore();
};

/************************************
  Level declaration
*************************************/
function Level() {

  this.building_blocks = [];
  
  this.building_blocks.push(new LevelBlock(0,250,75,25));
  this.building_blocks.push(new LevelBlock(400,250,75,25));
  this.building_blocks.push(new LevelBlock(200,175,75,25));
  this.building_blocks.push(new LevelBlock(600,125,75,25));
  this.building_blocks.push(new LevelBlock(1000,175,75,25));
  
  this.building_blocks.push(new LevelBlock(-1000,350,3000,50));
  /*
  for(var i = 0; i < 600; i+=50) {
    this.building_blocks.push(new LevelBlock(i,350,50,50));
  }
  */
}

Level.prototype.draw = function(context) {
  for(var i = 0; i < this.building_blocks.length; i++) {
    this.building_blocks[i].draw(context);
  }
};