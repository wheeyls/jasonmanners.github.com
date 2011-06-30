/*************************************************************************
  Base
**************************************************************************/
function Base(x,y,width,height,health) {
  this.survivors = [];
  this.unplacedSurvivors = [];
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.health = health;
  
  this.supplies = 200;
  this.midX = this.x + (this.width / 2);
  this.midY = this.y + (this.height / 2);
  
  this.add_survivor(new Survivor());
}

Base.prototype.draw = function(context) {
  context.save();
    context.fillStyle = "rgba(75,175,175,0.9)";
    context.fillRect (this.x, this.y, this.width, this.height);
    context.strokeStyle = "rgba(50,125,125,0.9)";
    context.beginPath();
      context.rect (this.x, this.y, this.width, this.height);
    context.stroke();
  context.restore();
}

Base.prototype.update = function(delta_time) {
}

Base.prototype.is_dead = function() {
  return (this.health <= 0);
}

Base.prototype.add_survivor = function(survivor) {
  this.survivors.push(survivor);
  this.unplacedSurvivors.push(survivor);
}

Base.prototype.kill_survivor = function(damage) {
  this.health -= damage;
}

Base.prototype.get_supplies = function() {
  return this.supplies;
}

Base.prototype.get_health = function() {
  return this.health;
}

Base.prototype.subtract_supplies = function(supplies) {
  this.supplies -= supplies;
}

Base.prototype.is_enough_supplies = function(supplies) {
  return ((this.supplies - supplies) >= 0);
}
