/* This controller class contains most tree growing functions and some generic utility functions */
ig.module(
	'game.misc.controller'
)
.requires(
	'impact.impact'
)
.defines(function(){"use strict";

ig.Controller = ig.Class.extend({

	score: 0,
	difficulty: 1,
	activeJars: 0,

	// Races
	raceListArr: [],

	// Text input
	accessPromptOpen: true,
	createRacePromptOpen: false,
	namePromptOpen: false,
	snailToName: null,

	/******* MAIN FUNCTIONS *******/
	grow: function(entity,growthpoints) {
		entity.scale = entity.scale + (entity.scale * growthpoints);
	/*	player.size.x = player.size.x + (player.size.x * growthpoints);
		player.size.y = player.size.y + (player.size.y * growthpoints);
		player.accelGround = player.accelGround + (player.accelGround * growthpoints);
		player.maxVel.x = player.maxVel.x + (player.maxVel.x * growthpoints);
		player.maxVel.y = player.maxVel.y + (player.maxVel.y * growthpoints);
		player.jump = player.jump + (player.jump * growthpoints);
		console.log('width: ' + player.size.x);
		console.log('height: ' + player.size.y); */
	},

	toggleAccessPrompt: function() {
    	if (!this.accessPromptOpen) {
    		console.log('opening');
    		document.getElementById("accessPrompt").style.display = 'block';
    		// this.snailToName = snail;
    		// this.namePromptOpen = true;
    	}
    	else {
    		console.log('closing');
    		document.getElementById("accessPrompt").style.display = 'none';
    		// this.snailToName = null;
    		this.accessPromptOpen = false;
    	}
	},

	toggleRaceCreatePrompt: function() {
		console.log('toggling! ' + this.createRacePromptOpen);
		if (!this.createRacePromptOpen) {
    		this.createRacePromptOpen = true;
    		document.getElementById("createracePrompt").style.display = 'block';
		}
		else {
    		this.createRacePromptOpen = false;
    		document.getElementById("createracePrompt").style.display = 'none';
		}
	},

	toggleNamePrompt: function(snail) {
    	if (!this.namePromptOpen) {
    		console.log('opening');
    		document.getElementById("namePrompt").style.display = 'block';
    		this.snailToName = snail;
    		this.namePromptOpen = true;
    	}
    	else {
    		console.log('closing');
    		document.getElementById("namePrompt").style.display = 'none';
    		this.snailToName = null;
    		this.namePromptOpen = false;
    	}
	},

    setSnailName: function() {
		if (this.snailToName) {
    	//	document.getElementById("namePrompt").style.display = 'none';
    	//	this.namePromptOpen = false;
			var name = document.getElementById("name").value;
			if (name) {
				this.snailToName.name = name;
				console.log('snailtoname id: ' + this.snailToName.snailID);
				ig.game.impactSocket.updateSnail(this.snailToName.snailID,'name',name);
				for (var i = 0; i < ig.game.pool.allTriggersArr.length; i++) {
					var trigger = ig.game.pool.allTriggersArr[i];
					if (trigger.kind === 'nameSnail') {
						trigger.destroy();
					}
				}
				document.getElementById("name").value = "";
			}
			else {
				this.toggleNamePrompt();
			}
		}
		else {
			console.log('toggling from setSnailName');
			this.toggleNamePrompt();
		}

    },

    findTriggerByKind: function(kind,findAll) {
		var allTriggers = ig.game.getEntitiesByType(EntityTrigger);
		var allTriggersOfKindArr = [];
		for (var i = 0; i < allTriggers.length; i++) {
			var trigger = allTriggers[i];
			if (trigger.kind === kind) {
				if (!findAll) {
					return trigger;
				}
				else {
					allTriggersOfKindArr.push(trigger);
				}
			}
		}
		if (findAll === true) {
			return allTriggersOfKindArr;
		}
    },

	/******* UTILITY FUNCTIONS *******/

	randomFromTo: function(from, to) {
       return Math.floor(Math.random() * (to - from + 1) + from);
    },

    decimalRandomFromTo: function(from, to) {
       return Math.random() * (to - from + 1) + from;
    },

    getHighestNumber: function(object,getKey) {
		var largest = {
    		key: null,
    		val: null
		};

		for(var i in object){
		    if( object[i]>largest.val ){
		        largest.key = i;
		        largest.val = object[i];
		    }
		}

		if (getKey) {
			return largest.key;
		}
		else {
			return largest.val;
		}
    },

    inArray: function(arr, obj) {
		return (arr.indexOf(obj) != -1);
	},

	shuffleArray: function(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	},

	removeFromArray: function(object,array) {
		var index = array.indexOf(object);
		array.splice(index, 1);
	},


	// Calculate what percentage of value2 value1 is.
	calcPercentage: function(value1,value2) {
		return 100 * value1 / value2;
	},

	// Calculate a value2 for targetpercent of value1.
	calcTargetPercentageValue: function(targetpercent,value1) {
		return targetpercent * value1 / 100;
	},

	// Pick a random color.
	pickRandomColor: function(rFrom,rTo,gFrom,gTo,bFrom,bTo) {
		var r = this.randomFromTo(rFrom,rTo);
		var g = this.randomFromTo(gFrom,gTo);
		var b = this.randomFromTo(bFrom,bTo);
		return {r: r, g: g, b: b};
	},

/*	pickColorInRange: function(target) {
		var r;
		var g;
		gar b;
		switch (target) {
			case 'r': 
				r = this.randomFromTo()
		}
	} */

	// Transition color smoothly into next closest shade.
	transitionColor: function(currentColor,targetColor) {
		if (currentColor > targetColor) {
			currentColor -= 5;
		}
		else if (currentColor < targetColor) {
			currentColor += 5;
		}
		return currentColor;
	},

	// Pause game and music.
	pause: function() {
		if (!ig.game.paused) {
			ig.music.pause();
		}
		else {
			ig.music.play();
		}
		ig.Timer.timeScale = (ig.Timer.timeScale === 0 ? 1 : 0);
		this._paused = ig.Timer.timeScale === 0;
		ig.game.paused = !(ig.game.paused);
	},

	checkDetection: function(posX,posY,sizeX) {
		var primaryEye = ig.game.primaryEye;
		var detected = false;
		var dist = Math.sqrt(Math.pow(primaryEye.pointOfSight.x - (posX + sizeX / 2),2)+Math.pow(primaryEye.pointOfSight.y - (posY + sizeX / 2),2));
		if (dist<(primaryEye.sightArea + sizeX / 2)) detected = true;
		return detected;
    }


});

});