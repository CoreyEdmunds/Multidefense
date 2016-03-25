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


MultiDefense.View = {};

MultiDefense.View.BoardView = function BoardView(canvas, model) {
	this.model = model;
	this.canvas = canvas;	
  	var context = canvas.getContext("2d"); 
  	this.onePixel = 1;
  	var me = this;
	
	this.drawRangeRing = function(x, y, range) {
		context.strokeStyle = "#555555";
		context.lineWidth = this.onePixel*1;
	  	context.beginPath();
		context.moveTo(x+0.5 + range,y+0.5);
		context.arc(x+0.5,y+0.5,range,0,2*3.14159268, false);
  		context.stroke();
  		context.closePath();
	}

	this.highlightCell = function(x, y, fill) {
		context.strokeStyle = "#0000CC";
		context.fillStyle = "#CCCCFF";
		context.lineWidth = this.onePixel*2;
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x+1, y);
		context.lineTo(x+1, y+1);
		context.lineTo(x, y+1);
		context.lineTo(x,y);
  		context.stroke();
  		if ( fill )
  			context.fill();
		context.closePath();
	}
	
	this.drawGatlingTurret = function() {
  		context.fillStyle = "#009900";
  		context.fillRect(-0.1,-0.4,0.2,0.4);
  		
  		context.fillStyle = "#00AA00";
  		context.beginPath();
  		context.moveTo(0, 0.25);
		context.arc(0,0,0.25,0,2*3.14159268, false);
		context.closePath();
  		context.fill();
	}
	
	this.drawSamTurret = function() {
		context.fillStyle = "#0000FF";
		context.fillRect(-0.3, -0.4, 0.1, 0.7);
		context.fillRect(0.2, -0.4, 0.1, 0.7);
		context.fillStyle = "#0000AA";
  		context.beginPath();
  		context.moveTo(0, 0.25);
		context.arc(0,0,0.25,0,2*3.14159268, false);
		context.closePath();
  		context.fill();
	}
	
	this.drawLaserTurret = function() {
  		context.fillStyle = "#AA0000";
  		context.fillRect(-0.1,-0.4,0.2,0.8);
	}
	
	this.drawShockwaveTurret = function() {
		context.fillStyle = "#555555";
  		context.beginPath();
  		context.moveTo(0, 0.20);
		context.arc(0,0,0.20,0,2*3.14159268, false);
		context.closePath();
  		context.fill();
  		context.strokeStyle = "#555555";
  		context.lineWidth = this.onePixel*2;
  		context.beginPath();
  		context.moveTo(0.3, 0);
		context.arc(0,0,0.3,0,2*3.14159268, false);
		context.closePath();
		context.stroke();
	}	
	
	this.drawTower = function(tower) {
		context.save();
		context.translate(tower.position.x+0.5,tower.position.y+0.5);		
		context.fillStyle="000000";
		for(var i=1; i<5&&i<tower.level; i++) {
			context.fillRect(0.2*i-0.6, 0.3, 0.15, 0.15);
		}
		context.rotate(tower.orientationAzimuth);
		if ( tower.towerType == MultiDefense.Model.Tower.Type.GATLING ) {
			this.drawGatlingTurret();
		} else if ( tower.towerType == MultiDefense.Model.Tower.Type.SAM ) {
			this.drawSamTurret();
		} else if ( tower.towerType == MultiDefense.Model.Tower.Type.LASER ) {
			this.drawLaserTurret();
		} else if ( tower.towerType == MultiDefense.Model.Tower.Type.SHOCKWAVE ) {
			this.drawShockwaveTurret();
		}
		context.restore();

	}

	this.drawPathBackground = function(path) {
		context.fillStyle = "#AAAAAA";
		for(var i=0; i<path.length; i++) {
			context.fillRect(Math.floor(path[i].x), Math.floor(path[i].y), 1, 1);
		}
  		context.closePath();
	}
  	
	this.drawPathForeground = function(path) {
		context.strokeStyle = "#CFCF00";
		context.lineWidth = this.onePixel*3;
		context.beginPath();		
  		context.moveTo(path[0].x, path[0].y-0.5);
		for(var i=0; i<path.length; i++) {
			context.lineTo(path[i].x, path[i].y);
		}
		context.lineTo(path[path.length-1].x, path[path.length-1].y+0.5);
  		context.stroke();
  		context.closePath();
	}	
	
	
	this.repaint = function() {
		var width = canvas.width;
		var height = canvas.height;
	
		this.onePixel = Math.min(model.BOARD_DIMENSION/width, model.BOARD_DIMENSION/height);
	  	context.lineWidth = this.onePixel;
	  	context.save();
		context.scale(width/model.BOARD_DIMENSION,height/model.BOARD_DIMENSION);
		context.globalAlpha = 1;
		context.clearRect(0, 0, model.BOARD_DIMENSION+1, model.BOARD_DIMENSION+1);

	  	context.strokeStyle = "#555555";
		context.fillStyle = "#FFFF00";
	  	context.beginPath();
 		for(var i=0; i<model.BOARD_DIMENSION+1; i++) {
  			context.moveTo(i, 0);
 	 		context.lineTo(i, model.BOARD_DIMENSION);
  			context.moveTo(0, i);
  			context.lineTo(model.BOARD_DIMENSION, i);
  		}
  		context.stroke();
  		context.closePath();
 		
  		this.drawPathBackground(model.leftPath);
		this.drawPathBackground(model.rightPath);
		this.drawPathForeground(model.leftPath);  			
		this.drawPathForeground(model.rightPath);
  		

  		for(var x=0; x<model.BOARD_DIMENSION; x++) {
  			for(var y=0; y<model.BOARD_DIMENSION; y++) {
  				if ( model.board[x][y] != undefined && model.selectionModel && model.board[x][y] === model.selectionModel.selectedItem ) {
  					this.highlightCell(x, y, true);
  					this.drawRangeRing(x, y, model.board[x][y].range);
  				}
  				if ( model.board[x][y] instanceof MultiDefense.Model.Tower.Tower ) {
					this.drawTower(model.board[x][y]);
  				}
  			}
  		}


	  	context.strokeStyle = "#FF0000";
		context.fillStyle = "#FF0000";
		context.lineWidth = this.onePixel;
	  	context.beginPath();
		for(var i=0; i<model.enemies.length; i++) {
			var enemy = model.enemies[i];
			if ( enemy.isActive ) {
				var pos = enemy.position;
				context.moveTo(pos.x - 0.25,pos.y+0.3);
  				context.lineTo(pos.x - 0.25 + 0.5*enemy.healthRatio(),pos.y+0.3);
			}
		}
		context.stroke();
		context.closePath();
  		
	  	context.strokeStyle = "#AA0000";
		context.fillStyle = "#AA0000";
		context.lineWidth = this.onePixel;
	  	context.beginPath();
		for(var i=0; i<model.enemies.length; i++) {
			var enemy = model.enemies[i];
			if ( enemy.isActive ) {
				var pos = enemy.position;
				context.moveTo(pos.x + 0.25,pos.y);
  				context.arc(pos.x,pos.y,0.25,0,2*3.14159268, false);
			}
		}
		context.fill();
		context.closePath();

	  	context.strokeStyle = "#00AA00";
		context.fillStyle = "#00AA00";
		context.lineWidth = this.onePixel;
		for(var i=0; i<model.projectiles.length; i++) {
			var pos = model.projectiles[i].position;
			context.beginPath();
			context.moveTo(pos.x + 0.1,pos.y);
  			context.arc(pos.x,pos.y,0.1,0,2*3.14159268, false);
  			context.fill();
			context.closePath();
		}
				
		if ( model.isHovering ) {
			if ( model.canBuildTower) {
				context.fillStyle = "#00AA00";
	  			context.fillRect(model.hoverCellX, model.hoverCellY, 1, 1);
	  			this.drawRangeRing(model.hoverCellX, model.hoverCellY, model.getSelectedItemRange());
	  		} else if ( model.canSelectTower ) {
				this.highlightCell(model.hoverCellX, model.hoverCellY, false);
	  		}
	  	}				
				
	  	context.strokeStyle = "#FF5555";
		for(var i=0; i<model.towers.length; i++) {
			var tower = model.towers[i];
			if ( tower.targetEnemy != null && tower.towerType == MultiDefense.Model.Tower.Type.LASER) {
				context.beginPath();
				context.moveTo(tower.positionCentre.x, tower.positionCentre.y);
  				context.lineTo(tower.targetEnemy.position.x,tower.targetEnemy.position.y);
  				context.stroke();
				context.closePath();
			}
		}

	  	context.strokeStyle = "#AAAAAA";
		for(var i=0; i<model.towers.length; i++) {
			var tower = model.towers[i];
			if ( tower.targetEnemy != null && tower.towerType == MultiDefense.Model.Tower.Type.SHOCKWAVE) {
				context.beginPath();
				var radius = tower.range * (tower.animationSequence - tower.lastFired) / tower.fireInterval;
				context.moveTo(tower.positionCentre.x+radius, tower.positionCentre.y);
  				context.arc(tower.positionCentre.x,tower.positionCentre.y,radius,0,2*3.14159268, false);
  				context.stroke();
				context.closePath();
			}
		}		
		
  		context.restore();
	};
	
	var cellPosition = function(e) {
		var pos = MultiDefense.Utilities.cursorPosition(e);		
		var x = pos[0];
		var y = pos[1];	
				
		x = Math.floor(x / canvas.width * model.BOARD_DIMENSION);
		y = Math.floor(y / canvas.height * model.BOARD_DIMENSION);
		
		return [x,y];		
	}	
	
	canvas.onmousemove = function mouseMove(e) {
		var pos = cellPosition(e);
		var x = pos[0];
		var y = pos[1];
		
		if ( x != model.hoverCellX || y != model.hoverCellY ) {
			model.updateHoverPosition(x, y);
			// repaint(); 
		}
	};
	
	canvas.onmousedown = function mouseClick(e) {
		var pos = cellPosition(e);
		var x = pos[0];
		var y = pos[1];
		
		if ( model.determineCanBuildTower(x,y) ) {
			model.buildTower(x, y);
  		} else if ( model.determineCanSelectTower(x, y) ) {
  			model.selectTower(x, y);
			// repaint();
		}
	};
	
	canvas.onmouseout = function mouseOut(e) {
		model.isHovering = false;
		// repaint();
	}	
	
	canvas.onmouseover = function mouseEnter(e) {
		model.isHovering = true;
	}		
	
	
	this.tick = function() {
		me.repaint();
	};
}
