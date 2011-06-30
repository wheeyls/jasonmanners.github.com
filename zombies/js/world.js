/*************************************************************************
  World
**************************************************************************/
function World(canvas_id) {
  this.canvas_id = "#"+canvas_id; //might change
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
  speed : 1
}

World.prototype.initialize = function() {
  this._init_world();
  this._init_game_objects();
  this.initialized = true;
}

World.prototype.update = function(delta_time) {
  //update gameBoard
  if(this.gameState.is_running()) {
    this.gameBoard.update(delta_time);
  }
  
  $("#score_number").html(this.gameBoard.get_score());
  $("#health_number").html(this.gameBoard.get_health());
  $("#resources_number").html(this.gameBoard.get_supplies());
  
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
  
  var self = this;
  $(this.canvas_id).bind("mousedown", function(event) {self.inputManager.mouse_down(event);});
  $(this.canvas_id).bind("mousemove", function(event) {self.inputManager.mouse_move(event);});
  $(this.canvas_id).bind("mouseup", function(event) {self.inputManager.mouse_up(event);});

  $(document).keydown(function(event) {self.inputManager.key_down(event);});
  $(document).keyup(function(event) {self.inputManager.key_up(event);});
  
  $("#start").click(function() {self.gameState.run(); self.start(); $(this).css("display","none");});
  $("#tower").click(function() {self.inputManager.place_tower();});
  $("#survivor").click(function() {self.inputManager.place_survivor();});
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
}

World.prototype._init_game_objects = function() {
//init gameBoard
  this.gameBoard = new GameBoard(640,400,20,"rgba(0,0,0,0.05)","rgba(100,100,0,0.3)");
  this.inputManager.set_gameBoard(this.gameBoard);
  //init gameState
  this.gameState = new GameStateManager();
}

World.prototype._init_waves = function() {
  $("#wave_rate").attr({ width: 700, height:30 });
  var tmpContext = $("#wave_rate")[0].getContext("2d");
  for(var i = 1; i < 700; i++) {
    var tmpNum = Math.sin(i/25)*5+ Math.random()*10;
    tmpContext.fillRect(i-1,tmpNum+5,1,20-tmpNum);
  }
}
