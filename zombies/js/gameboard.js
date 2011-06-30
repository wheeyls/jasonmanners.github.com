/*************************************************************************
  GameBoard
**************************************************************************/
function GameBoard(width,height,gridSpace,gridColor,bgColor) {
  this.width = width;
  this.height = height;
  this.gridSpace = gridSpace;
  this.gridColor = gridColor;
  this.bgColor= bgColor;
  
  this.score = 0;
  this.base = new Base(600,160,40,80,200);
  
  this.respawnRate = 750;
  this.respawnCooldown = 0;
  
  this.totalTime = 0;
  
  this.enemies = [];
  
  this.towers = [];
  
  this.projectiles = [];
  
  
  this.maxX = Math.floor(this.width / this.gridSpace)
  this.maxY = Math.floor(this.height / this.gridSpace);
  this.occupiedCells = new Array();
  this.occupiedList = [];
  
  for(var i = 0; i < this.maxX; i++) {
    this.occupiedCells[i] = new Array();
    for(var j = 0; j < this.maxY; j++) {
      this.occupiedCells[i][j] = false;  
    }
  }

  for(var i = 0; i < this.base.width/this.gridSpace; i++) {
    for(var j = 0; j < this.base.height/this.gridSpace; j++) {
      this.occupiedCells[coord_to_index(this.base.x,this.gridSpace)+i][coord_to_index(this.base.y,this.gridSpace)+j] = true;
    }
  }
}

GameBoard.prototype.update = function(delta_time){

  this.totalTime += delta_time;
  this.respawnCooldown += delta_time;
  
  if(this.respawnCooldown >= this.respawnRate) {
    this.respawnCooldown = 0;
    var tmpX = -10;
    var tmpY = Math.random()*this.height;
    var tmpDir = Math.atan2(this.base.midY-tmpY,this.base.midX-tmpX);
    this.add_enemy(new Enemy(tmpX,tmpY,Math.random()*10+15,tmpDir,10+10*(this.totalTime / MS_IN_SEC / 5),10,7,0,this.base.midX,this.base.midY));
  }
  
  this._update_enemies(delta_time);
  this._update_towers(delta_time,this.currentEnemies);
  this.score += this._update_projectiles(delta_time);
}

GameBoard.prototype.draw = function(context){
  context.save();
    context.fillStyle = this.bgColor;
    context.fillRect (0, 0, this.width, this.height);
    this._draw_board(context);
  context.restore();
  
  this.base.draw(context);
  this._draw_projectiles(context);
  this._draw_towers(context);
  this._draw_enemies(context);
}

GameBoard.prototype._draw_board = function(context){
 context.save();
    context.beginPath();
    //Draw Vertical Lines
    for (var x = 0.5; x <= this.width+0.5; x += this.gridSpace) {
      context.moveTo(x, 0);
      context.lineTo(x, this.height);
    }

    //Draw Horizontal Lines
    for (var y = 0.5; y <= this.height+0.5; y += this.gridSpace) {
      context.moveTo(0, y);
      context.lineTo(this.width, y);
    }
    context.strokeStyle = this.gridColor;
    context.stroke();
  context.restore();
}

GameBoard.prototype._draw_enemies = function(context){
  for(var i = 0; i < this.enemies.length; i++) {
    if(this.enemies[i].x > 0 && this.enemies[i].x < this.width &&
        this.enemies[i].y > 0 && this.enemies[i].y < this.height) {
      this.enemies[i].draw(context);
    }
  }
}

GameBoard.prototype._draw_towers = function(context){
  for(var i = 0; i < this.towers.length; i++) {
    this.towers[i].draw(context);
  }
}

GameBoard.prototype._draw_projectiles = function(context){
  for(var i = 0; i < this.projectiles.length; i++) {
    this.projectiles[i].draw(context);
  }
}

GameBoard.prototype._update_enemies = function(delta_time){
  for(var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].update(delta_time,this.towers);
    
    if(this.enemies[i].x >= this.base.x && this.enemies[i].x <= this.base.x+this.base.width &&
        this.enemies[i].y >= this.base.y && this.enemies[i].y <= this.base.y+this.base.height) {
      this.base.kill_survivor(this.enemies[i].damage);
      this.enemies.splice(i--,1);
    }
  }
}

GameBoard.prototype._update_towers = function(delta_time){
  for(var i = 0; i < this.towers.length; i++) {
    var tmpProjectile = this.towers[i].update(delta_time,this.enemies);
    if(tmpProjectile !== false) {
      this.add_projectile(tmpProjectile);
    }
  }
}

GameBoard.prototype._update_projectiles = function(delta_time){
  //Update projectiles and check hits
  var tmpScore = 0;
  for(var i = 0; i < this.projectiles.length; i++) {
    this.projectiles[i].update(delta_time);
    
    if(this.projectiles[i].x <= 0 || this.projectiles[i].x >= this.width ||
        this.projectiles[i].y <= 0 || this.projectiles[i].y >= this.height) {
      this.projectiles.splice(i--,1);
      continue;
    }
    
    for(var j = 0; j < this.enemies.length; j++) {
      if(this.enemies[j].is_collision(this.projectiles[i].x,this.projectiles[i].y)) {
        tmpScore += this.projectiles[i].damage;
        
        this.enemies[j].take_damage(this.projectiles[i].damage);

        if(this.enemies[j].is_dead()) {
          this.enemies.splice(j--,1);
          break;
        }
        
        this.projectiles.splice(i--,1);
        break;
      }
    }
    

  }
  
  return tmpScore;
}

GameBoard.prototype.add_enemy = function(enemy){
  this.enemies.push(enemy);
}

GameBoard.prototype.add_tower = function(x,y){
  var self = this;
  var cleanX = clean_coord(x,self.gridSpace);
  var cleanY = clean_coord(y,self.gridSpace);
  var xInd = coord_to_index(cleanX,self.gridSpace);
  var yInd = coord_to_index(cleanY,self.gridSpace);
  if(!self.is_cell_occupied(xInd,yInd)) {
    var tmpTower = new Tower(cleanX,cleanY,self.gridSpace);
    self.occupiedCells[xInd][yInd] = tmpTower;
    self.towers.push(tmpTower);
    this.base.subtract_supplies(tmpTower.cost);
    return true;
  }
  else {
    return false;
  }
}

GameBoard.prototype.add_projectile = function(projectile){
  this.projectiles.push(projectile);
}

GameBoard.prototype.is_on_board = function(x,y) {
  return (x >= 0 && x < this.width && y >= 0 && y < this.height);
}

GameBoard.prototype.is_cell_occupied = function(x,y) {
  return (this.occupiedCells[x][y] !== false);
}

GameBoard.prototype.get_score = function() {
  return this.score;
}

GameBoard.prototype.get_health = function() {
  return this.base.get_health();
}

GameBoard.prototype.get_supplies = function() {
  return this.base.get_supplies();
}

GameBoard.prototype.get_tower = function(x,y) {
    return this.occupiedCells[x][y];
}

GameBoard.prototype.place_survivor = function(x,y) {
  var cleanX = clean_coord(x,this.gridSpace);
  var cleanY = clean_coord(y,this.gridSpace);
  var xInd = coord_to_index(cleanX,this.gridSpace);
  var yInd = coord_to_index(cleanY,this.gridSpace);
  
  if(this.is_cell_occupied(xInd,yInd)) {
    this.select_tower(xInd,yInd);
    this.get_tower(xInd,yInd).set_survivor(this.base.survivors[0]);
    this.base.survivors[0].set_tower(this.get_tower(xInd,yInd));
  }
  
  return false;
}

GameBoard.prototype.select_tower = function(xInd,yInd) {
  if(this.selected) {
    this.selected.lose_focus();
  }
  if(this.is_cell_occupied(xInd,yInd)) {
    this.selected = this.get_tower(xInd,yInd).set_focus();
  }
}
