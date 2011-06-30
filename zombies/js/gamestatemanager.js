/*************************************************************************
  GameStateManager
*************************************************************************/
function GameStateManager() {
  this.currentState = STOPPED;
}

GameStateManager.prototype.run = function() {
  this.currentState = RUNNING;
}

GameStateManager.prototype.pause = function() {
  this.currentState = PAUSED;
}

GameStateManager.prototype.is_running = function() {
  return (this.currentState === RUNNING);
}

GameStateManager.prototype.is_paused = function() {
  return (this.currentState === PAUSED);
}