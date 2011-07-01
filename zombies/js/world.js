/*************************************************************************
  World
**************************************************************************/
function World(canvas_id) {
  this.canvas_id = "#"+canvas_id; //might change
  $("#wave_rate").attr({ width: 700, height:30 });
}

World.prototype = {
  WORLD_WIDTH : 1000,   //defaults - will be set later in _init_world
  WORLD_HEIGHT : 1000,  //defaults - will be set later in _init_world
  
  context : undefined,
  
  scale : 1,
  scaleOptions : [1,8,16,24],
  camera : {x:20,y:20}, //used to translate world so user can move gameboard
  lastMouse : {x:0,y:0},
  
  gameBoard : undefined,
  gameState : undefined,

  inputManager : undefined,
  
  initialized : false,
  score: 0,
  currentSelected : undefined,
  currentTower : undefined,
  currentSurvivor : undefined,
  speed : 1,
  waveTime : 0
}

World.prototype.initialize = function() {
  this._init_game_objects();
  this._init_world();
  
  this.initialized = true;
}

World.prototype.update = function(delta_time) {
 
  //update gameBoard
  if(this.gameState.is_running()) {
    this.gameBoard.update(delta_time);
    
    this.waveTime += delta_time;
    if(this.waveTime > 60) {
      //this.waves_arr.splice(0,1);
      this.waveTime = 0;
    }
  }
  
  $("#score_number").html(this.gameBoard.get_score());
  $("#health_number").html(this.gameBoard.get_health());
  $("#resources_number").html(this.gameBoard.get_supplies()+" | "+this.gameBoard.get_survivor_string());
  $("#upgrade_status").html(this.gameBoard.get_upgrade_string());
  if(!this.gameBoard.base.can_search()) {
    $("#search").addClass("red");
    $("#search").removeClass("green");
  }
  else {
    $("#search").addClass("green");
    $("#search").removeClass("red");
  }
  //Can this be done with promises
  if(this.gameBoard.base.is_dead()) {
    $("#lose").css("display","block");
    this.gameState.currentState = LOSE;
  }
}

World.prototype.draw = function(context) {
  this.clear(context);
  context.save();
    context.scale(this.scale,this.scale);
    context.translate(this.camera.x,this.camera.y);
    this.gameBoard.draw(context); 
  context.restore();
  
  this.draw_waves();
}

World.prototype.clear = function(context) {
  context.clearRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  context.fillStyle = "rgba(200,200,185,0.2)";
  context.fillRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
}

World.prototype.run = function(timestep) {
  var drawStart   = (timestep || Date.now());
  var delta_time  = drawStart - startTime;
  
    this.update(delta_time*this.speed);
    this.draw(this.context);
    requestAnimFrame(this.run.bind(this));
    
  startTime = drawStart;
}

World.prototype.start = function() {
  startTime = Date.now();
  this.gameState.run();
  this.run();
}

World.prototype._init_world = function() {
  this.WORLD_WIDTH = 700;
  this.WORLD_HEIGHT = 440;
  $(this.canvas_id).attr({ width: this.WORLD_WIDTH, height: this.WORLD_HEIGHT });
  
  this.context = $(this.canvas_id)[0].getContext("2d");

  this._init_waves();
  
  //Init InputManager
  this.inputManager = new InputManager(this.camera);
  this.inputManager.set_gameBoard(this.gameBoard);
  
  var self = this;
  $(this.canvas_id).bind("mousedown", function(event) {self.inputManager.mouse_down(event);});
  $(this.canvas_id).bind("mousemove", function(event) {self.inputManager.mouse_move(event);});
  $(this.canvas_id).bind("mouseup", function(event) {self.inputManager.mouse_up(event);});

  $(document).keydown(function(event) {self.inputManager.key_down(event);});
  $(document).keyup(function(event) {self.inputManager.key_up(event);});
  
  $("#tower").click(function() {self.inputManager.place_tower();});
  $("#survivor").click(function() {self.inputManager.new_survivor();});
  $("#move_survivor").click(function(){self.inputManager.move_survivor();});
  $("#upgrade_damage").click(function(){self.gameBoard.upgrade_survivor(3,DAMAGE);});
  $("#upgrade_range").click(function(){self.gameBoard.upgrade_survivor(10,RANGE);});
  $("#upgrade_rate").click(function(){self.gameBoard.upgrade_survivor(-25,RATE);});
  $("#search").click(function(){self.gameBoard.base.search();});
  
  $("#pause").click(function() {
    if(self.gameState.is_paused()) {
      startTime = Date.now();
      self.gameState.run();
      self.run(); 
      $(this).html("Pause");
    }
    else if(self.gameState.is_running()) {
      self.gameState.pause(); 
      $(this).html("Play");
    }
  });
  
  //Change to class and .each with an attribute holding the speed
  $("#speed_1").click(function() {self.speed = 1;});
  $("#speed_2").click(function() {self.speed = 2;});
  $("#speed_3").click(function() {self.speed = 3;});
}

World.prototype._init_game_objects = function() {
//init gameBoard
  this.gameBoard = new GameBoard(640,400,20,"rgba(0,0,0,0.05)","rgba(100,100,0,0.3)");
  //init gameState
  this.gameState = new GameStateManager();
}

World.prototype._init_waves = function() {
  this.waves_arr = [];
  for(var i = 1; i < 10000; i++) {
    this.waves_arr.push(Math.sin(i/25)*5+ Math.random()*10);
  }
}

World.prototype.draw_waves = function() {
  var tmpContext = $("#wave_rate")[0].getContext("2d");
  tmpContext.clearRect(0, 0, 700, 30);
  tmpContext.fillStyle = "rgba(73,110,28,0.6)";
  for(var i = 0; i < 700; i++) {
    tmpContext.fillRect(i-1,this.waves_arr[i]+5,1,20-this.waves_arr[i]);
  }
}

