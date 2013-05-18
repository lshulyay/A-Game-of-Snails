/* This controller class contains most tree growing functions and some generic utility functions */
ig.module(
	'game.misc.pool'
)
.requires(
	'impact.impact'
)
.defines(function(){"use strict";

ig.Pool = ig.Class.extend({

	allSnailsArr: [],
	allTriggersArr: [],
	allJarsArr: [],
	allSnailStatsGUI: [],

	addToPool: function(entity,arr) {
		arr.unshift(entity);
	},

	useObject: function(object,attributes) {
		// Set poolArr and entityType depending on which entity is being used
		var poolArr = null;
		var entityType = null;
		var entity = null;
		switch(object) {
			case 'snail': 
				poolArr = this.allSnailsArr;
				entityType = 'EntitySnail';
				break;
			case 'trigger':
				poolArr = this.allTriggersArr;
				entityType = 'EntityTrigger';
				break;
			case 'jar':
				poolArr = this.allJarsArr;
				entityType = 'EntityJar';
				break;
			case 'snailstatsgui':
				poolArr = this.allSnailStatsGUI;
				entityType = 'EntitySnailStatsGUI';
				break;
		}
		entity = poolArr[0]; // Get first entity in relevant pool
	//	console.log('entity inUse: ' + entity.inUse + ' total: ' + poolArr.length);
		// If the entity is not already in use...
		if (entity.inUse === false) {
	//		console.log('found available entity');
			// Set any additional attributes
			for(var propt in attributes){
				entity[propt] = attributes[propt];
			}
			entity.inUse = true;
			entity.initialize(); // Initialize entity
			this.moveArrElement(poolArr,0,poolArr.length - 1); // Move the now used entity to the end of the pool
		}

		// If the entity IS already in use, either the array is cluttered or there are no free entities left in the pool...
		else {
			var foundAvailableEntity = false;
			// Loop through pool backwards
			for (var i = poolArr.length - 1; i > 0; i--) {
				entity = poolArr[i];
				// If the entity is not in use, move it to the front of the array
				if (!entity.inUse) {
					this.moveArrElement(poolArr,i,0);
					foundAvailableEntity = true;
				}
			}

			// If no available entities were found, spawn a new entity.
			if (!foundAvailableEntity) {
				console.log('creating new entity');
				ig.game.spawnEntity(entityType, 0, 0);
			}
			this.useObject(object,attributes);
		}
	},

	freeObject: function(entity) {
		if (entity.inUse) {
			entity.inUse = false;
			ig.game.gui.closeAllDependents(entity);

		}
	},

	freeAllObjects: function(object) {
		var poolArr;
		switch (object) {
			case 'snail':
				poolArr = this.allSnailsArr;
				break;
			case 'trigger':
				poolArr = this.allTriggersArr;
				break;
			case 'jar':
				poolArr = this.allJarsArr;
				break;
			case 'snailstatsgui':
				poolArr = this.allSnailStatsGUI;
				break;
		}
		for (var i = 0; i < poolArr.length; i++) {
			var entity = poolArr[i];
			if (entity.inUse) {
				entity.destroy();
			//	ig.game.gui.closeAllDependents(entity);
			}
		} 
	},

	removeAllObjects: function(object) {
		var poolArr;
		switch (object) {
			case 'snail':
				poolArr = this.allSnailsArr;
				break;
			case 'trigger':
				poolArr = this.allTriggersArr;
				break;
			case 'jar':
				poolArr = this.allJarsArr;
				break;
		}
		poolArr.length = 0;
	},


	moveArrElement: function(array, old_index, new_index) {
		if (new_index >= array.length) {
			var k = new_index - array.length;
			while ((k--) + 1) {
				array.push(undefined);
			}
		}
		array.splice(new_index,0,array.splice(old_index, 1)[0]);
		return array;
	}


});

});