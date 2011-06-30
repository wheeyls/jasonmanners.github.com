/*************************************************************************
  Survivor
*************************************************************************/
function Survivor() {
  this.tower = undefined;
}

Survivor.prototype = {
  damage : 3,
  range : 125,
  rate : 120,
  velocity: 300,
  projectile_size : 2
}

Survivor.prototype.upgrade_damage = function(damage) {
  this.damage += damage;
}

Survivor.prototype.upgrade_rate = function(rate) {
  this.rate += rate;
}

Survivor.prototype.upgrade_range = function(range) {
  this.range += range;  
}

Survivor.prototype.get_damage = function() {
  return this.damage;
}

Survivor.prototype.get_rate = function() {
  return this.rate;
}

Survivor.prototype.get_range = function() {
  return this.range;
}

Survivor.prototype.get_velocity = function() {
  return this.velocity;
}

Survivor.prototype.get_tower = function() {
  return this.tower;
}

Survivor.prototype.get_projectile_size = function() {
  return this.projectile_size;
}

Survivor.prototype.set_tower = function(tower) {
  this.tower = tower;
}



