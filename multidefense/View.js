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


MultiDefense.View.GameView = function(model) {
	this.model = model;
	this.opponentCanvas = document.getElementById("MultiDefense.OpponentCanvas");
	this.playerCanvas = document.getElementById("MultiDefense.PlayerCanvas");
	
	this.chatArea = document.getElementById("MultiDefense.ChatArea");
	this.chatInput = document.getElementById("MultiDefense.ChatInput");
	this.chatSendButton = document.getElementById("MultiDefense.ChatSendButton");
	this.chatForm = document.getElementById("MultiDefense.ChatForm");
		
	this.gatlingButton = document.getElementById("MultiDefense.GatlingButton");
	this.laserButton = document.getElementById("MultiDefense.LaserButton");
	this.samButton = document.getElementById("MultiDefense.SamButton");
	this.shockwaveButton = document.getElementById("MultiDefense.ShockwaveButton");

	this.upgradeButton = document.getElementById("MultiDefense.UpgradeButton");
	this.sellButton = document.getElementById("MultiDefense.SellButton");
	
	this.towerCostLabel = document.getElementById("MultiDefense.TowerCostLabel");
	this.towerTypeLabel = document.getElementById("MultiDefense.TowerTypeLabel");
	this.towerDamageLabel = document.getElementById("MultiDefense.TowerDamageLabel");
	this.towerNoteLabel = document.getElementById("MultiDefense.TowerNoteLabel");
	this.towerLevelLabel = document.getElementById("MultiDefense.TowerLevelLabel");
	
	this.towerUpgradeCostLabel = document.getElementById("MultiDefense.TowerUpgradeCostLabel");
	this.towerSellCostLabel = document.getElementById("MultiDefense.TowerSellCostLabel");	

	this.resourceLabel = document.getElementById("MultiDefense.Resources");
	this.timeRemainingLabel = document.getElementById("MultiDefense.TimeRemaining");
	this.readyButton = document.getElementById("MultiDefense.DoneButton");	
	
	this.toolTipLabel = document.getElementById("MultiDefense.ToolTipLabel");
	
	this.playerHealthLabel = document.getElementById("MultiDefense.PlayerHealthLabel");
	this.opponentHealthLabel = document.getElementById("MultiDefense.OpponentHealthLabel");

	var playerBoardView = new MultiDefense.View.BoardView(this.playerCanvas, model.playerBoardModel);
	var opponentBoardView = new MultiDefense.View.BoardView(this.opponentCanvas, model.opponentBoardModel, null, null);
	var my = this;
	
	model.tipModel.hoverTips = [
		[this.opponentCanvas,  "This is where your opponent plays."],
		[this.playerCanvas, "Build towers on your canvas!"],
		
		[this.chatArea, "You can read messages that your opponent has sent in that window."],
		[this.chatInput, "You can type in a message to your opponent with that input box."],
		[this.chatSendButton, "Click the button to send a message that you have typed in."],
		
		[this.gatlingButton, "The gatling gun shoots at ground units.  It is a good general purpose weapon."],
		[this.laserButton, "The laser tower shoots at ground units, and it never misses."],
		[this.samButton, "The SAM Launcher fires Surface to Air Missiles at airborne targets.  There aren't many airborne targets, though."],
		[this.shockwaveButton, "Shock towers send out shockwaves that damage all enemies within the tower range."],
		
		[this.upgradeButton, "The upgrade button upgrades a tower.  Upgraded towers do more damage and have longer range."],
		[this.sellButton, "The sell button sells a tower.  You get half your money back when you sell a tower."],
		[this.readyButton, "The ready/begin button acknowledges that you are ready to play"],
		[this.resourceLabel, "This shows how much resources you have to work with."],
		[this.timeRemainingLabel, "This shows how much time you have left to set up your towers.  When the time runs out, the game starts!"]
	]
	
	
	this.chatArea.onmouseover =
		this.chatInput.onmouseover = 
		this.chatSendButton.onmouseover =
		this.gatlingButton.onmouseover =
		this.laserButton.onmouseover =
		this.samButton.onmouseover =
		this.shockwaveButton.onmouseover =
		this.upgradeButton.onmouseover =
		this.sellButton.onmouseover =
		this.opponentCanvas.onmouseover =
		this.readyButton.onmouseover =
		this.resourceLabel.onmouseover =
		this.timeRemainingLabel.onmouseover =
		function(e) {
			model.tipModel.hoverEnter(e.currentTarget);
		}
		
	this.chatArea.onmouseout =
		this.chatInput.onmouseout = 
		this.chatSendButton.onmouseout =
		this.gatlingButton.onmouseout =
		this.laserButton.onmouseout =
		this.samButton.onmouseout =
		this.shockwaveButton.onmouseout =
		this.upgradeButton.onmouseout =
		this.sellButton.onmouseout =
		this.opponentCanvas.onmouseout =
		this.readyButton.onmouseout =
		this.resourceLabel.onmouseout =
		this.timeRemainingLabel.onmouseout =
		function(e) {
			model.tipModel.hoverExit(e.currentTarget);
		}
	
	this.checkForGameOver = function() {
		if ( model.getState() == model.GameState.FINISHED ) {
			if (confirm("Game over!  Do you want to see high scores?")) {
				window.location.href="scores.html";
			}
		}
	}

	this.sendChatMessage = function() {
		var msg = this.chatInput.value;
		if ( msg.length <= 0 )
			return;
		this.chatInput.value = "";
		model.chatModel.sendMessage("Player", msg);
	}

	this.chatSendButton.onclick = function(e) {
		e.returnValue = false;
		my.sendChatMessage();
	}
	
	this.chatInput.onkeypress = function(e) {
		// www.bloggingdeveloper.com/post/Disable-Form-Submit-on-Enter-Key-Press.aspx
		var key;     
     	if(window.event)
      	key = window.event.keyCode; //IE
     	else
      	key = e.which; //firefox     

		if ( key == 13 ) {
			my.sendChatMessage();
			return false;
		} else {
			return true;
		}
	}
	
	this.chatForm.onsubmit = function(e) {
		e.returnValue = false;
		my.sendChatMessage();
	}
	
	model.chatModel.onTextUpdated = function() {
		my.chatArea.value = model.chatModel.getMessages();
	}
	
	
	var toggleButtonSelection = function(button, towerType) {
		if ( button === model.selectionModel.selectedItem ) {
			model.selectionModel.setSelectedItem(null);
			model.selectionModel.setSelectedTowerType(null);
		} else {
			model.selectionModel.setSelectedTowerType(towerType);
			model.selectionModel.setSelectedItem(button);
		}
	}	
	
	this.gatlingButton.onclick = function(e) {
		toggleButtonSelection(e.currentTarget, MultiDefense.Model.Tower.Type.GATLING);
	}
	
	this.laserButton.onclick = function(e) {	
		toggleButtonSelection(e.currentTarget, MultiDefense.Model.Tower.Type.LASER);
	}
	
	this.samButton.onclick = function(e) {	
		toggleButtonSelection(e.currentTarget, MultiDefense.Model.Tower.Type.SAM);
	}
	
	this.shockwaveButton.onclick = function(e) {
		toggleButtonSelection(e.currentTarget, MultiDefense.Model.Tower.Type.SHOCKWAVE);
	}
	
	this.readyButton.onclick = function() {
		my.model.progressGameState();
	}

	this.sellButton.onclick = function() {
		my.model.playerBoardModel.sellSelectedTower();
	}

	this.upgradeButton.onclick = function() {
		my.model.playerBoardModel.upgradeSelectedTower();
	}

	this.updateResources = function() {
		this.resourceLabel.innerHTML = model.playerBoardModel.getPlayerResources();
		this.updateBuildNewButtons();
		this.updateUpgradeButton();
		this.updateSelectedTowerIndicators();
		this.updateUpgradeButton();
	}	
	
	this.updateBuildNewButtons = function() {
		this.updateBuildNewButton(this.gatlingButton, MultiDefense.Model.Tower.Type.GATLING);
		this.updateBuildNewButton(this.laserButton, MultiDefense.Model.Tower.Type.LASER);
		this.updateBuildNewButton(this.samButton, MultiDefense.Model.Tower.Type.SAM);
		this.updateBuildNewButton(this.shockwaveButton, MultiDefense.Model.Tower.Type.SHOCKWAVE);
	}
	
	this.updateBuildNewButton = function(button, type) {
		var cost = MultiDefense.Model.Tower.CalculateCost(type, 1);
		if ( cost <= model.playerBoardModel.getPlayerResources() ) {
			button.disabled = false;
		} else {
			button.disabled = true;
		}
		if ( model.getState() != model.GameState.SETUP ) {
			button.disabled = true;
		}
	}
	
	this.updateUpgradeButton = function() {
		if ( model.selectionModel.selectedItem instanceof MultiDefense.Model.Tower.Tower ) {
			var cost = MultiDefense.Model.Tower.CalculateCost(
				model.selectionModel.selectedItem.towerType,
				model.selectionModel.selectedItem.level+1);
			this.towerUpgradeCostLabel.innerHTML = cost;
			this.upgradeButton.disabled = cost > model.playerBoardModel.getPlayerResources();
		} else if (model.selectionModel.selectedTowerType != null && model.selectionModel.selectedTowerType != undefined) {
			var cost = MultiDefense.Model.Tower.CalculateCost(
				model.selectionModel.selectedTowerType,
				2);
			this.towerUpgradeCostLabel.innerHTML = cost;
			this.upgradeButton.disabled = true;
		} else {
			this.towerUpgradeCostLabel.innerHTML = "";
			this.upgradeButton.disabled = true;
		}
		
		if ( model.getState() != model.GameState.SETUP ) {
			this.upgradeButton.disabled = true;
		}
	}
	
	this.updateSellButton = function() {
		if ( model.selectionModel.selectedItem instanceof MultiDefense.Model.Tower.Tower ) {
			var cost = model.selectionModel.selectedItem.cost / 2;
			this.towerSellCostLabel.innerHTML = cost;
			this.sellButton.disabled = cost > model.playerBoardModel.getPlayerResources();
		} else if (model.selectionModel.selectedTowerType != null && model.selectionModel.selectedTowerType != undefined) {
			var cost = MultiDefense.Model.Tower.CalculateCost(
				model.selectionModel.selectedTowerType,
				1);
			cost /= 2;
			this.towerSellCostLabel.innerHTML = cost;
			this.sellButton.disabled = true;
		} else {
			this.towerSellCostLabel.innerHTML = "";
			this.sellButton.disabled = true;
		}

		if ( model.getState() != model.GameState.SETUP ) {
			this.sellButton.disabled = true;
		}
	}
	
	this.updateReadyButton = function() {
		var state = model.getState();
		if ( state == model.GameState.INIT || state == model.GameState.FINISHED ) {
			this.readyButton.disabled = false;
			this.readyButton.innerHTML = "Begin";
		} else if ( state == model.GameState.SETUP ) {
			this.readyButton.disabled = false;
			this.readyButton.innerHTML = "Ready";
		} else {
			this.readyButton.disabled = true;
		}
	}
	
	this.updateTimerLabel = function() {
		if ( model.getState() == model.GameState.SETUP ) {
			this.timeRemainingLabel.innerHTML = model.getCountdown();
		} else {
			this.timeRemainingLabel.innerHTML = "-";
		}
	}

	
	this.towerTypeName = function(towerType) {
		if ( towerType == MultiDefense.Model.Tower.Type.GATLING ) {
			return "Gatling Gun";
		} else if ( towerType == MultiDefense.Model.Tower.Type.SAM ) {
			return "SAM Launcher";
		} else if ( towerType == MultiDefense.Model.Tower.Type.LASER ) {
			return "Laser Turret";
		} else if ( towerType == MultiDefense.Model.Tower.Type.SHOCKWAVE ) {
			return "Shock Tower";
		} else {
			return towerType;
		}
	}
	
	this.updateSelectedTowerIndicators = function() {
		this.towerCostLabel;
		this.towerTypeLabel;
		this.towerDamageLabel;
		this.towerNoteLabel;
		this.towerLevelLabel;
		
		if ( model.selectionModel.selectedItem instanceof MultiDefense.Model.Tower.Tower ) {
			this.towerCostLabel.innerHTML = model.selectionModel.selectedItem.cost;
			this.towerTypeLabel.innerHTML = this.towerTypeName(model.selectionModel.selectedItem.towerType);
			var damage = model.selectionModel.selectedItem.damage / model.selectionModel.selectedItem.fireInterval;
			damage = Math.round(damage*10)/10;
			this.towerDamageLabel.innerHTML = damage;
			this.towerLevelLabel.innerHTML = model.selectionModel.selectedItem.level;
		} else if ( model.selectionModel.selectedItem && 
				model.selectionModel.selectedTowerType != null && 
				model.selectionModel.selectedTowerType != undefined) {
			this.towerCostLabel.innerHTML = MultiDefense.Model.Tower.CalculateCost(model.selectionModel.selectedTowerType,1)
			this.towerTypeLabel.innerHTML = this.towerTypeName(model.selectionModel.selectedTowerType);
			var damage = MultiDefense.Model.Tower.CalculateDamage(model.selectionModel.selectedTowerType,1) / 
				MultiDefense.Model.Tower.CalculateFireInterval(model.selectionModel.selectedTowerType,1);
			damage = Math.round(damage*10)/10;
			this.towerDamageLabel.innerHTML = damage;
			this.towerLevelLabel.innerHTML = 1;
		} else {
			this.towerCostLabel.innerHTML = "";
			this.towerTypeLabel.innerHTML = ""
			this.towerDamageLabel.innerHTML = "";
			this.towerLevelLabel.innerHTML = "";
		}
	}
	
	this.updateHealthPoints = function() {
		var php = model.playerBoardModel.healthPoints / model.opponentBoardModel.MAX_HEALTHPOINTS;
		var ohp = model.opponentBoardModel.healthPoints / model.opponentBoardModel.MAX_HEALTHPOINTS;

		this.playerHealthLabel.innerHTML = Math.max(0, Math.round(php*100));
		this.opponentHealthLabel.innerHTML = Math.max(0, Math.round(ohp*100));
	}	
	
	this.updateButtonSelectionStates = function() {     
     this.gatlingButton.style.fontWeight="";
     this.laserButton.style.fontWeight="";
     this.samButton.style.fontWeight="";
     this.shockwaveButton.style.fontWeight="";     
     
     var selectedItem =  model.selectionModel.selectedItem;
		if ( selectedItem === this.gatlingButton ) {
			this.gatlingButton.style.fontWeight="bolder";
		} else if ( selectedItem === this.laserButton ) {
			this.laserButton.style.fontWeight="bolder";
		} else if ( selectedItem === this.samButton ) {
			this.samButton.style.fontWeight="bolder";
		} else if ( selectedItem === this.shockwaveButton ) {
			this.shockwaveButton.style.fontWeight="bolder";
		}
	}
	
	this.updateEverything = function() {
		this.updateButtonSelectionStates();
		this.updateHealthPoints();
		this.updateSelectedTowerIndicators();
		this.updateSellButton();
		this.updateUpgradeButton();
		this.updateBuildNewButtons();
		this.updateResources();
		this.updateReadyButton();
		this.updateTimerLabel();
		my.chatArea.value = model.chatModel.getMessages();
	}	
	
	model.playerBoardModel.notifyResourcesUpdated = function() {
		my.updateResources();
	}	
	
	model.selectionModel.notifySelectedItemUpdated = function() {
		my.updateButtonSelectionStates();
		model.playerBoardModel.updateCanBuildTower();  // HACK - fixme
		my.updateSelectedTowerIndicators();
		my.updateUpgradeButton();
		my.updateSellButton();
	}
	
	
	model.tipModel.notifyTooltipUpdated = function() {
		my.toolTipLabel.innerHTML = model.tipModel.getTip();
	}
	
	model.opponentBoardModel.notifyHealthPointsUpdated = 
		model.playerBoardModel.notifyHealthPointsUpdated = 
			function() { my.updateHealthPoints(); }
	
	model.onGameStateChange = function() {
		my.updateEverything();
		my.checkForGameOver();
	}
	
	model.countDownChanged = function() {
		my.updateTimerLabel();
	}
	
	this.tick = function() {
		playerBoardView.tick();
		opponentBoardView.tick();
	}
	
	this.updateEverything();
}
