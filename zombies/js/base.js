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

  this.totalSurvivors = 5;
  this.cooldown = 15*MS_IN_SEC;
  this.timer = 0;
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
  this.timer += delta_time;
}

Base.prototype.is_dead = function() {
  return (this.health <= 0);
}

Base.prototype.add_survivor = function(survivor) {
  if(this.can_add_survivor()) {
    this.survivors.push(survivor);
    this.unplacedSurvivors.push(survivor);
    return this.survivors.length-1;
  }
  return false;
}

Base.prototype.can_add_survivor = function() {
  return (this.survivors.length+1 <= this.totalSurvivors);
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

Base.prototype.search = function() {
  if(this.can_search()) {
    this.timer = 0;
    this.supplies += 200;
    this.totalSurvivors++;
  }
}

Base.prototype.can_search = function() {
  return (this.timer >= this.cooldown);
}

Base.prototype.get_total_survivors = function() {
  return this.totalSurvivors;
}

Base.prototype.get_current_survivor_num = function() {
  return this.survivors.length;
}

Base.prototype.decrease_max_survivors = function(num) {
  this.totalSurvivors--;
}