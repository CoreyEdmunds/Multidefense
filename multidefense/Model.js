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

MultiDefense.Model.SelectionModel = function() {
	var selectionActive = false;
	this.selectedItem = null;
	this.selectedTowerType = null;
	
	this.setSelectedItem = function(item) {
		this.selectedItem = item;
		this.notifySelectedItemUpdated();
	}
	this.setSelectedTowerType = function(item) {
		this.selectedTowerType = item;
		this.notifySelectedTowerTypeUpdated();
	}
	this.reset = function() {
		this.setSelectedItem(null);
		this.setSelectedTowerType(null);
	}
		
	
	this.notifySelectedItemUpdated = function() {}
	this.notifySelectedTowerTypeUpdated = function() {}
	
}

MultiDefense.Model.TipModel = function() {
	var UNKNOWN = "This thing is important, but I can't remember what it does.";
	var hovering = false;
	var hoverText = UNKNOWN;
	var generalTipText = "Press the \"Begin\" button to start playing!";	
	
	this.hoverExit = function(target) {
		hovering = false;
		this.notifyTooltipUpdated();
	}	
	
	this.hoverEnter = function(target) {
		var tip;
		
		if ( !this.hoverTips ) {
			return;		
		}
		
		for(var i=0; i<this.hoverTips.length; i++) {
			if ( this.hoverTips[i][0] == target ) {
				tip = this.hoverTips[i][1];
			}
		}
		
		if ( tip ) {
			hoverText = tip;
		} else {
			hoverText = UNKNOWN;		
		}
		hovering = true;
		this.notifyTooltipUpdated();
	}			
	
	this.setGeneralTipText = function(text) {
		generalTipText = text;
		this.notifyTooltipUpdated();
	}	
	
	this.getTip = function() {
		if ( hovering ) {
			return hoverText;
		} else {
			return generalTipText;
		}
	}		
}



MultiDefense.Model.ChatModel = function() {
	this.text = "You are now playing with Ralph.";
	this.ralphTimer;
	this.ralphQuotes = [
		"I caught a white apple.",
		"I'm a furniture.",
		"Okay, but if I win, you'll have to teach me how to play this game.",
		"Uh... so... do you like..... stuff?",
		"Do alligators alligate? ",
		"Fun toys are fun.",
		"My cat's breath smells like cat food."
	];
	var me = this;
	
	this.ralphChat = function() {
		var msg = this.ralphQuotes[Math.floor(Math.random()*(this.ralphQuotes.length))];
		this.text += "\n" + "Ralph: " + msg;
		this.onTextUpdated(); 
		
		if ( this.ralphTimer ) {
			clearTimeout(this.ralphTimer);
			this.ralphTimer = undefined;
		}
	}	
	
	this.sendMessage = function(from, text) {
		this.text += "\n" + from + ": " + text;
		this.onTextUpdated();
		
		if ( this.ralphTimer ) {
			clearTimeout(this.ralphTimer);
			this.ralphTimer = undefined;
		}		
		
		this.ralphTimer = setTimeout(function() {me.ralphChat()}, 3000);
	}
	
	this.getMessages = function() {
		return this.text;
	}
	
	this.onTextUpdated = function() {}
}

MultiDefense.Model.GameModel = function () {
	this.tipModel = new MultiDefense.Model.TipModel();
	this.selectionModel = new MultiDefense.Model.SelectionModel();	
	this.playerBoardModel = new MultiDefense.Model.BoardModel(this, this.selectionModel, this.tipModel);
	this.opponentBoardModel = new MultiDefense.Model.BoardModel(this);
	this.chatModel = new MultiDefense.Model.ChatModel();
	var me = this;
	
	this.GameState = { 
		INIT: 0,
		SETUP: 1,
		PLAYING: 2,
		FINISHED: 3
	};
	this.SETUP_TIME = 60;	
	
	var state = this.GameState.INIT;
	var countDown = this.SETUP_TIME;
	var countDownTimer;	
	
	
	this.TIME_DELTA = 50;
	this.timeElapsed = 0;
	
	this.tick = function() {
		this.playerBoardModel.tick(this.TIME_DELTA, 10);
		this.opponentBoardModel.tick(this.TIME_DELTA, 10);
		if ( state == this.GameState.PLAYING ) {
			this.checkForMatchCompletion();
		}
	}

	this.setState = function(gameState) {
		state = gameState;
		this.onGameStateChange();
		this.updateDefaultTooltip();
	}

	this.updateDefaultTooltip = function() {
		switch ( state ) {
			case this.GameState.INIT:
				this.tipModel.setGeneralTipText("Press the \"Begin\" button to start the game.");
				break;
			case this.GameState.SETUP:
				this.tipModel.setGeneralTipText("Build defenses!  Towers can be built by picking a tower type in the control panel, and then clicking in the player grid.");
				break;
			case this.GameState.PLAYING:
				this.tipModel.setGeneralTipText("Observe the outcome of the battle.");
				break;
			case this.GameState.FINISHED:
				this.tipModel.setGeneralTipText("The game is over.  You can press \"Begin\" to play again.");
				break;
		};
	}

	this.setCountdown = function(value) {
		countDown = value;
		this.countDownChanged();
	}
	
	this.getCountdown = function() {
		return countDown;
	}
	
	this.getState = function() {
		return state;
	}
	
	this.progressGameState = function() {
		if ( state == this.GameState.INIT ||
			state == this.GameState.FINISHED ) {
			this.beginGame();
		} else if ( state == this.GameState.SETUP ) {
			this.beginBattle();
		}
	}	
	
	this.resetGame = function() {
		this.setState(this.GameState.INIT);

		this.selectionModel.reset();
		this.playerBoardModel.reset();
		this.opponentBoardModel.reset();
	}	

	this.beginGame = function() {
		if ( state == this.GameState.FINISHED ) {
			this.resetGame();
		}
		if ( state != this.GameState.INIT ) {
			MultiDefense.Utilities.log("Cannot begin a game that has not been initialized");
			return;
		}
		
		this.beginSetup();
	}
	
	this.beginSetup = function() {
		if ( state != this.GameState.INIT && state != this.GameState.PLAYING ) {
			MultiDefense.Utilities.log("Cannot set up uninitialized/unplaying game");
			return;
		}
		
		this.setState(this.GameState.SETUP);
		this.setCountdown(this.SETUP_TIME);
		countdownTimer = setInterval(function() { me.countdownTimerTicked(); }, 1000);
	}	
	
	this.beginBattle = function() {
		if ( state != this.GameState.SETUP ) {
			MultiDefense.Utilities.log("Cannot battle a game that has not been set up");
			return;
		}
		
		if ( countdownTimer ) {
			clearInterval(countdownTimer);
			countdownTimer = undefined;
		}
		this.setState(this.GameState.PLAYING);
		this.playerBoardModel.beginBattle();
		this.opponentBoardModel.beginBattle();
	}	

	this.checkForMatchCompletion = function() {
		if ( this.playerBoardModel.isBattleComplete() && this.opponentBoardModel.isBattleComplete() ) {
			this.battleOver();
		}
	}	
	
	this.battleOver = function() {
		if ( this.playerBoardModel.healthPoints <= 0 || this.opponentBoardModel.healthPoints <= 0 ) {
			this.setState(this.GameState.FINISHED);
		} else {
			this.beginSetup();
		}
	}	
	
	this.countdownTimerTicked = function() {
		this.setCountdown(this.getCountdown() - 1);
		if ( this.getCountdown() == 0 ) {
			this.beginBattle();
		} else {
			this.doRalphThings();
		}
	}

	this.findAdjacentRoadCount = function(x, y) {
		var adjacentRoadCount = 0;
		for(var i=x-1; i<=x+1; i++) {
			for(var j=y-1; j<=y+1; j++) {
				if ( i < this.opponentBoardModel.BOARD_DIMENSION && j < this.opponentBoardModel.BOARD_DIMENSION &&
						i >= 0 && j >= 0 &&
					this.opponentBoardModel.board[i][j] instanceof MultiDefense.Model.RoadCell )
					adjacentRoadCount++;
			}
		}
		return adjacentRoadCount;
	}
	
	this.ralphCanAfford = function(towerType) {
		return this.opponentBoardModel.getPlayerResources() >= MultiDefense.Model.Tower.BaseCost[towerType];		
	}

	this.doRalphThings = function() {
		if ( !this.ralphCanAfford(MultiDefense.Model.Tower.Type.GATLING) )
			return;
		var board = this.opponentBoardModel.board;
						
		for(var i=0; i<50; i++) {
			var x = Math.floor(Math.random() * this.opponentBoardModel.BOARD_DIMENSION);
			var y = Math.floor(Math.random() * this.opponentBoardModel.BOARD_DIMENSION);
			if (board[x][y] == null || board[x][y] == undefined) {
				var adjacent = this.findAdjacentRoadCount(x,y);
				if ( adjacent >= 4 && this.ralphCanAfford(MultiDefense.Model.Tower.Type.SHOCKWAVE) ) {
					this.opponentBoardModel.buildTower(x,y,MultiDefense.Model.Tower.Type.SHOCKWAVE);
					break;
				} else if ( adjacent == 2 && adjacent == 1) {
					this.opponentBoardModel.buildTower(x,y,MultiDefense.Model.Tower.Type.GATLING);
					break;
				} else if ( adjacent == 3 && this.ralphCanAfford(MultiDefense.Model.Tower.Type.LASER) ) {
					if ( Math.random() > 0.5 ) {
						this.opponentBoardModel.buildTower(x,y,MultiDefense.Model.Tower.Type.LASER);
					} else {
						this.opponentBoardModel.buildTower(x,y,MultiDefense.Model.Tower.Type.GATLING);
					}
					break;
				} else if ( adjacent == 3 ) {
					this.opponentBoardModel.buildTower(x,y,MultiDefense.Model.Tower.Type.GATLING);
					break;
				}
			}
		}
	}
	
	this.onGameStateChange = function() {}
	this.countDownChanged = function() {}
}
