/************************************************************************
 * Multiplayer Tower Defense Demo Client
 * Copyright (C) 2011, Corey Edmunds
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 ************************************************************************/

MultiDefense.Model = {};

var Vec = MultiDefense.Utilities.Vec;

MultiDefense.Model.RoadEnemy = function RoadEnemy(path) {
	this.path = path;
	this.position = new Vec(path[0].x, path[0].y);
	this.pathIndex = 0;
	this.velocity = 1; // squares per second
	this.lastMoved = 0;
	this.isActive = false;
	this.maxHealth = 100;
	this.health = 100;
	var me = this;
	
	this.moveFunc = function(dt) {
		if ( this.pathIndex >= this.path.length || !this.isActive )
			return false;
		var toNext = this.path[this.pathIndex].subtract(this.position);
		var timeStep = dt/1000;

		var travelsPerTick = this.velocity * timeStep;
		if ( toNext.magnitude() < 2*travelsPerTick ) {
			this.pathIndex++;
			if ( this.pathIndex != this.path.length ) 
				toNext = this.path[this.pathIndex].subtract(this.position);
		}
		
		var vec = toNext.normalize().scale(travelsPerTick);
		this.position = this.position.add(vec);
		
		return true;
	} 
	
	this.move = function(dt) {
		return me.moveFunc(dt);
	}
	
	this.takeDamage = function(damage) {
		this.health -= damage;
		if ( this.health <= 0 )
			this.isActive = false;
	}
	
	this.healthRatio = function() {
		return this.health / this.maxHealth;
	}
}

MultiDefense.Model.RoadCell = function RoadCell() {
	
}

MultiDefense.Model.Projectile = function(sourceTower, targetEnemy, damageOnImpact) {
	this.sourceTower = sourceTower;
	this.targetEnemy = targetEnemy;
	this.firedAt = new Vec(targetEnemy.position.x, targetEnemy.position.y);
	this.position = new Vec(this.sourceTower.positionCentre.x, this.sourceTower.positionCentre.y);
	this.velocity = 4;
	
	
	this.tick = function(dt) {
		var vecToEnemy = this.position.subtract(this.targetEnemy.position);
		var vecToTarget = this.firedAt.subtract(this.position);
		
		var timeStep = dt/1000;

		var travelsPerTick = this.velocity * timeStep;
		
		if ( vecToEnemy.magnitude() < 3*travelsPerTick ) {
			return true;
		} else if ( vecToTarget.magnitude() < 1.5*travelsPerTick ) {
			return false;
		}

		this.position = this.position.add(vecToTarget.normalize().scale(travelsPerTick));
	} 
}


MultiDefense.Model.Tower = {};

MultiDefense.Model.Tower.Tower = function(type, position, level) {
	this.towerType = type;
	this.animationSequence = 0;
	this.lastFired = 0;

	this.position = position;
	this.positionCentre = new Vec(position.x+0.5, position.y+0.5);
	
	this.orientationAzimuth = 0;
	this.level = level;

	this.currentTarget = null;
	
	this.range;
	this.damage;
	this.cost = MultiDefense.Model.Tower.CalculateCost(this.towerType, this.level);	
	this.fireInterval=0;
	
	this.updateProperties = function() {
		this.range = MultiDefense.Model.Tower.CalculateRange(this.towerType, this.level);
		this.damage = MultiDefense.Model.Tower.CalculateDamage(this.towerType, this.level);
		//this.cost = ;
		this.fireInterval = MultiDefense.Model.Tower.CalculateFireInterval(this.towerType, this.level);
	};
	this.updateProperties();

	this.upgradeTower = function() {
		this.cost += this.getUpgradeCost();
		this.level++;
		this.updateProperties();
	};
	
	this.getUpgradeCost = function() {
		return MultiDefense.Model.Tower.CalculateCost(this.towerType, this.level + 1);
	};
	
	
	this.targetEnemy = null;
	
	this.trackTarget = function() {
		var vec = this.targetEnemy.position.subtract(this.positionCentre);

		if ( vec.magnitude() > this.range || !this.targetEnemy.isActive) {
			this.targetEnemy = null;
		} else {
			this.orientationAzimuth = 0.5 * Math.PI + Math.atan2(vec.y, vec.x);
		}
	}	
	
	this.acquireTarget = function(board) {
		for(var i=0; i<board.enemies.length; i++) {
			var enemy = board.enemies[i];
			if ( enemy && enemy.isActive ) {
				var vec = enemy.position.subtract(this.positionCentre);
				if ( vec.magnitude() <= this.range ) {
					this.targetEnemy = enemy;
					break;
				}
			}
		}
	}		
	
	this.openFire = function(board) {
		if ( this.animationSequence - this.lastFired < this.fireInterval )
			return;
		this.lastFired = this.animationSequence;
		
		if ( this.towerType == MultiDefense.Model.Tower.Type.GATLING ) {
			board.fireProjectile(this, this.targetEnemy);
		} else if ( this.towerType == MultiDefense.Model.Tower.Type.SAM ) {
			board.fireMissile(this, this.targetEnemy);
		} else if ( this.towerType == MultiDefense.Model.Tower.Type.LASER ) {
			board.fireLaser(this, this.targetEnemy);
		} else if ( this.towerType == MultiDefense.Model.Tower.Type.SHOCKWAVE ) {
			board.fireShockwave(this);
		}
	}	
	
	this.tick = function(board) {
		this.animationSequence++;
		if ( this.targetEnemy ) {
			this.trackTarget();		
		}
		if ( !this.targetEnemy ) {
			this.acquireTarget(board);
		}
		if ( this.targetEnemy ) {
			this.openFire(board);
		}
	}
}

MultiDefense.Model.Tower.Type = {
    GATLING: 0,
    LASER: 1,
    SAM: 2,
    SHOCKWAVE: 3
}

MultiDefense.Model.Tower.BaseRange = [
    3,
    3,
    3.5,
    2
]

MultiDefense.Model.Tower.BaseDamage = [
	51,
	6,
	25,
	17
]

MultiDefense.Model.Tower.BaseCost = [
	5,
	10,
	15,
	20
]

MultiDefense.Model.Tower.FireInterval = [
	7,
	1,
	12,
	12
]


MultiDefense.Model.Tower.CalculateDamage = function(towerType, level) {
	var damage = MultiDefense.Model.Tower.BaseDamage[towerType];
	damage *= 1 + (level-1)*0.5;
	return Math.floor(damage);
}

MultiDefense.Model.Tower.CalculateRange = function(towerType, level) {
	var range = MultiDefense.Model.Tower.BaseRange[towerType];
	range *= 1 + (level-1)*0.05;
	return range;
}

MultiDefense.Model.Tower.CalculateCost = function(towerType, level) {
	var cost = MultiDefense.Model.Tower.BaseCost[towerType];
	cost *= 0.5 * Math.pow(2,level);
	return cost;
}

MultiDefense.Model.Tower.CalculateFireInterval = function(towerType, level) {
	return MultiDefense.Model.Tower.FireInterval[towerType];
}



MultiDefense.Model.BoardModel = function BoardModel(gameModel, selectionModel, tipModel) {
	this.BOARD_DIMENSION = 13;
	this.MAX_HEALTHPOINTS = 25;
	this.DEFAULT_RESOURCES = 100;

	this.gameModel = gameModel;
	this.selectionModel = selectionModel;
	this.tipModel = tipModel;	

	this.board;
	
	this.leftPath;
	this.rightPath;
	this.flightPaths;
	
	this.enemies;
	this.towers;
	this.projectiles;

	this.hoverCellX;
	this.hoverCellY;
	this.isHovering;
	this.canBuildTower;
	this.canSelectTower;
	this.selectedCellRange;
	
	var playerResources;
	this.healthPoints;
	this.level;

	this.reset = function() {
		this.board = new Array(this.BOARD_DIMENSION);
	
		this.leftPath = new Array();
		this.rightPath = new Array();
		this.flightPaths = new Array();
	
		this.enemies = new Array();
		this.towers = new Array();
		this.projectiles = new Array();

		this.hoverCellX = 0;
		this.hoverCellY = 0;
		this.isHovering = false;
		this.canBuildTower = false;
		this.canSelectTower = false;
		this.selectedCellRange = 5;
		this.level = 0;
	
		playerResources = this.DEFAULT_RESOURCES;
		this.healthPoints = this.MAX_HEALTHPOINTS;	
	
		this.battleComplete = false;	
	
		for (var i=0; i<this.BOARD_DIMENSION; i++) {
			this.board[i] = new Array(this.BOARD_DIMENSION);
		}
		
		for(var height=0; height < this.BOARD_DIMENSION / 4; height+=1) {
			this.leftPath[this.leftPath.length] = new Vec(Math.floor(this.BOARD_DIMENSION/2), height);
		}
		for(var height=0; height < this.BOARD_DIMENSION / 4; height+=1) {
			var p = new Vec(Math.floor(this.BOARD_DIMENSION/2) - height, Math.floor(this.BOARD_DIMENSION / 4));
			if ( !p.equals(this.leftPath[this.leftPath.length-1]) )
				this.leftPath[this.leftPath.length] = p;
		}
		for(var height=0; height < this.BOARD_DIMENSION / 2; height+=1) {
			var p = new Vec(Math.floor(this.BOARD_DIMENSION/4), Math.floor(this.BOARD_DIMENSION / 4)+height)
			if ( !p.equals(this.leftPath[this.leftPath.length-1]) )
				this.leftPath[this.leftPath.length] = p;
		}	
		for(var height=0; height <= this.BOARD_DIMENSION / 4-1; height+=1) {
			var p = new Vec(Math.floor(this.BOARD_DIMENSION/4)+height, Math.floor(this.BOARD_DIMENSION / 4 * 3))
			if ( !p.equals(this.leftPath[this.leftPath.length-1]) )
				this.leftPath[this.leftPath.length] = p;
		}	
		
		for(var height=0; height <= this.BOARD_DIMENSION / 4 + 1; height+=1) {
			var p = new Vec(Math.floor(this.BOARD_DIMENSION / 2)-1, Math.floor(this.BOARD_DIMENSION / 4 * 3) + height)
			if ( !p.equals(this.leftPath[this.leftPath.length-1]) )
				this.leftPath[this.leftPath.length] = p;
		}	
		
		for(var i=0; i<this.leftPath.length; i++) {
			this.rightPath[i] = new Vec(this.BOARD_DIMENSION-this.leftPath[i].x-1, this.leftPath[i].y);
		}
		
		for(var i=0; i<this.leftPath.length; i++) {
			this.board[this.leftPath[i].x][this.leftPath[i].y] = new MultiDefense.Model.RoadCell();
			this.leftPath[i].x += 0.5;
			this.leftPath[i].y += 0.5;
		}
		for(var i=0; i<this.rightPath.length; i++) {
			this.board[this.rightPath[i].x][this.rightPath[i].y] = new MultiDefense.Model.RoadCell();
			this.rightPath[i].x += 0.5;
			this.rightPath[i].y += 0.5;
		}
	}
	this.reset();
	
	this.beginBattle = function() {
		this.enemies = new Array();
		this.level++;
		for (var i=0; i<20 + this.level; i++) {
			var enemy;
			if ( Math.floor(Math.random() * 2) == 0 ) {
				enemy = new MultiDefense.Model.RoadEnemy(this.leftPath);
			} else {
				enemy = new MultiDefense.Model.RoadEnemy(this.rightPath);
			}
			enemy.isActive = true;
			enemy.velocity = 0.5 + Math.random() * 1.5;
			enemy.maxHealth = enemy.health = 50 + 50*this.level + 40*this.level * Math.random();
			this.enemies.push(enemy);	
		}
	}
	
	this.tick = function(dt, time) {
		for(var i=0; i<this.enemies.length; i++) {
			var alive = this.enemies[i].move(dt);
			if ( this.enemies[i].position.y >= this.BOARD_DIMENSION && this.enemies[i].isActive) {
				this.loseHealthPoint();
				this.enemies[i].isActive = false;
				this.enemies.splice(i,1);
				i--;
			} else if ( !alive ) {
				if ( !this.enemies[i].isActive ) 
					this.addResources(1);
				this.enemies.splice(i,1);
				i--;
			}
		}
		for(var i=0; i<this.towers.length; i++) {
			this.towers[i].tick(this);
		}
		for(var i=0; i<this.projectiles.length; i++) {
			var hit = this.projectiles[i].tick(dt);
			if ( hit == undefined ) {
			} else {
				if ( hit == true ) {
					this.projectiles[i].targetEnemy.takeDamage(this.projectiles[i].sourceTower.damage);
				}
				this.projectiles.splice(i,1);
				i--;
			}
		}
	};
	
	this.loseHealthPoint = function() {
		this.setHealthPoints(this.healthPoints-1);
	}	
	
	this.setHealthPoints = function(value) {
		this.healthPoints = value;
		this.notifyHealthPointsUpdated();
	}	
	
	this.addResources = function(resources) {
		this.setPlayerResources(playerResources + resources);
	}	
	
	this.setPlayerResources = function(resources) {
		playerResources = resources;
		this.notifyResourcesUpdated();
	}
	
	this.getPlayerResources = function() {
		return playerResources; 
	}
	
	this.updateHoverPosition = function(x,y) {
		this.hoverCellX = x;
		this.hoverCellY = y;
		this.updateCanBuildTower();
		this.updateCanSelectTower();
	}
	
	this.setIsHovering = function(state) {
		this.isHovering = state;
		this.updateCanBuildTower();
		this.updateCanSelectTower();
	}	
	
	this.updateCanBuildTower = function() {
		this.canBuildTower = this.determineCanBuildTower(this.hoverCellX, this.hoverCellY);
	}	
	
	this.determineCanBuildTower = function(x, y) {
			if ( x < 0 || x >= this.BOARD_DIMENSION || y < 0 || y >= this.BOARD_DIMENSION )
			return false;
		if ( (this.board[x][y] == null || this.board[x][y] == undefined) 
				//&& this.isHovering 
				&& this.selectionModel != undefined
				&& this.selectionModel.selectedTowerType != null) {
				var cost = MultiDefense.Model.Tower.CalculateCost(this.selectionModel.selectedTowerType, 1);
				return cost <= playerResources;
			return true;
		} else {
			return false;
		}
	}
	
	this.updateCanSelectTower = function() {
		this.canSelectTower = this.determineCanSelectTower(this.hoverCellX, this.hoverCellY);
	}
	
	this.determineCanSelectTower = function(x, y) {
		if ( x < 0 || x >= this.BOARD_DIMENSION || y < 0 || y >= this.BOARD_DIMENSION )
			return false;
		if ( (this.board[x][y] != null || this.board[x][y] != undefined) && 
				!(this.board[x][y] instanceof MultiDefense.Model.RoadCell) /*&& isHovering */) {
			return true;
		} else {
			return false;
		}
	}
	
	this.getSelectedItemRange = function() {
		if ( this.selectionModel.selectedItem instanceof MultiDefense.Model.Tower.Tower ) {
			return this.selectionModel.selectedItem.range;
		} else if ( this.selectionModel.selectedTowerType != null && this.selectionModel.selectedTowerType != undefined ) {
			return MultiDefense.Model.Tower.CalculateRange(this.selectionModel.selectedTowerType, 1);
		} else {
			MultiDefense.Utilities.log("No item selected for range rings");
			return;
		}
	}
		
	this.buildTower = function(x, y, type) {
     if ( type == undefined ) 
         type = this.selectionModel.selectedTowerType;

     if ( type == undefined )  {
         MultiDefense.Utilities.log("Attempted to build tower with no type specified");
         return;
     }	
	
		if ( this.board[x][y] != null || this.board[x][y] != undefined ) {
			MultiDefense.Utilities.log("Attempted to build tower on occupied square: " + x + " " + y);
			return;
		}

		var cost = MultiDefense.Model.Tower.CalculateCost(type, 1);
		
		if ( cost > playerResources ) {
			MultiDefense.Utilities.log("Cannot afford tower: " + x + " " + y);
			return;
		}
		
		this.addResources(-cost);	
		
		this.board[x][y] = new MultiDefense.Model.Tower.Tower(type, new Vec(x,y), 1); 
		this.towers.push(this.board[x][y]);
		
		this.updateCanBuildTower();
	}	
		
	this.upgradeTower = function(tower) {
		var cost = tower.getUpgradeCost();
		if ( cost <= playerResources ) {
			this.addResources(-cost);
			tower.upgradeTower();
		} else {
			MultiDefense.Utilities.log("Cannot afford to upgrade tower");
		}
	}
	
	this.upgradeTowerAt = function(x, y) {
		if ( this.board[x][y] == null || this.board[x][y] == undefined || this.board[x][y] instanceof MultiDefense.Model.RoadCell) {
			MultiDefense.Utilities.log("Attempted to upgrade tower on unoccupied square: " + x + " " + y);
			return;
		}
		this.upgradeTower(this.board[x][y]);
	}
	
	this.upgradeSelectedTower = function() {
		if ( this.selectionModel.selectedItem instanceof MultiDefense.Model.Tower.Tower ) {
			this.upgradeTower(this.selectionModel.selectedItem);
			this.selectionModel.setSelectedItem(this.selectionModel.selectedItem); //re-select
		} else {
			MultiDefense.Utilities.log("Tried to upgrade something that wasn't a tower");
		}
	}
	
	this.sellTower = function(tower) {
		this.addResources(tower.cost/2);
		this.board[tower.position.x][tower.position.y] = undefined;
		for(var i=0; i<this.towers.length; i++) {
			if (this.towers[i] === tower) {
				this.towers.splice(i,1);
				return;
			}
		}
	}	
	
	this.sellSelectedTower = function() {
		if ( this.selectionModel.selectedItem instanceof MultiDefense.Model.Tower.Tower ) {
			this.sellTower(this.selectionModel.selectedItem);
			this.selectionModel.setSelectedItem(null); //re-select
		} else {
			MultiDefense.Utilities.log("Tried to sell something that wasn't a tower");
		}
	}	
	
	this.sellTowerAt = function(x, y) {
		if ( this.board[x][y] == null || this.board[x][y] == undefined || this.board[x][y] instanceof MultiDefense.Model.RoadCell) {
			MultiDefense.Utilities.log("Attempted to sell tower on unoccupied square: " + x + " " + y);
			return;
		}
		this.sellTower(this.board[x][y]);
	}
	
	this.selectTower = function(x, y) {
		this.selectionModel.setSelectedItem(this.board[x][y]);
		this.selectionModel.setSelectedTowerType(null);
	}
	
	this.fireProjectile = function(tower, target) {
		var projectile = new MultiDefense.Model.Projectile(tower, target, tower.damage);
		this.projectiles.push(projectile);
	}
	
	this.fireMissile = function(tower, target) {
		
	}
	
	this.fireLaser = function(tower, target) {
		target.takeDamage(tower.damage);
	}
	
	this.fireShockwave = function(tower, target) {
		for(var i=0; i<this.enemies.length; i++) {
			var dist = this.enemies[i].position.subtract(tower.positionCentre).magnitude();
			if ( dist <= tower.range )
				this.enemies[i].takeDamage(tower.damage);
		}
	}	
	
	this.isBattleComplete = function() {
		return this.enemies.length == 0;
	}	
	
	this.notifyResourcesUpdated = function(){};
	this.notifyHealthPointsUpdated = function() {};
}
