/*************************************************************************
  InputManager
*************************************************************************/
function InputManager(camera) {
  this.mouseState = MOUSE_UP;
  this.mouseAction = NOTHING;
  this.mouseActionFunction = undefined;
  
  this.mouseX = 0;
  this.mouseY = 0;
  
  this.gameBoard = undefined;
  this.camera = camera;
}

InputManager.prototype.mouse_down = function(event) {
  this.mouseX = event.layerX;
  this.mouseY = event.layerY;
  var boardX = this.mouseX-this.camera.x;
  var boardY = this.mouseY-this.camera.y;
  if(this.mouseActionFunction) {
    if(!this.mouseActionFunction(boardX,boardY)) {
      this.mouseActionFunction = undefined;
      this.mouseAction = NOTHING;
    }
  }
  else {
    this.gameBoard.select_tower(clean_coord_index(boardX,this.gameBoard.gridSpace),clean_coord_index(boardY,this.gameBoard.gridSpace));
  }
  
}

InputManager.prototype.mouse_move = function(event) {
}

InputManager.prototype.mouse_up = function(event) {
}

InputManager.prototype.key_up = function(event) {
}

InputManager.prototype.key_down = function(event) {
  switch(event.keyCode) {
    case 84:
      this.place_tower();
      break;
    case 83:
      this.place_survivor();
      break;
    default:
      break;
  }
}

InputManager.prototype.place_tower = function() {
  this.mouseActionFunction = this.gameBoard.add_tower.bind(this.gameBoard);
}

InputManager.prototype.place_survivor = function() {
  this.mouseActionFunction = this.gameBoard.place_survivor.bind(this.gameBoard);
}


InputManager.prototype.set_mouse_action = function(action) {
}

InputManager.prototype.set_gameBoard = function(gameBoard) {
  this.gameBoard = gameBoard;
}