ig.module( 
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',

	'impact.debug.debug',

	'game.entities.pointer',
	'game.entities.snail',
	'game.entities.breedingjar',
	'game.entities.jar',
	'game.entities.gui',
	'game.entities.trigger',

	'game.levels.main',
	'game.levels.title',

	'game.misc.controller',
	'game.misc.pool',
	'game.misc.impactsocket'
	// 'game.misc.gui'
)
.defines(function(){

Snails = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	controller: new ig.Controller(),
	pool: new ig.Pool(),
	clearColor: 'white',
	
	init: function() {
		this.ctx = ig.system.context;
		this.ctx.textBaseline = 'top';
		this.sessionSnails = [];
		// Initialize your game here; bind keys etc.
		ig.input.bind( ig.KEY.MOUSE1, 'mouse1' );
		// Define socket
		this.impactSocket = new ig.ImpactSocket(3000);
		// Load title screen
		this.loadLevel(LevelTitle);
	},

	loadLevel: function( data ) {
		this.currentLevel = data;
		this.parent( data );

		// Remove all triggers
		this.pool.removeAllObjects('trigger');

		// Spawn a pointer
		this.spawnEntity(EntityPointer, 0, 0);

		// Spawn a GUI controller entity
		this.spawnEntity(EntityGui, 0, 0);

		// Spawn n triggers for the pool
		for (var n = 0; n < 1; n++) {
			this.spawnEntity(EntityTrigger, 0, 0, {inUse: false});
		}

		switch (this.currentLevel) {
			case LevelTitle: 
				var x = ig.system.width / 2;
				var y = ig.system.height / 2;
				this.pool.useObject('trigger', {pos: {x: x, y: y}, kind: 'startButton' });
				break;

			// If main level
			case LevelMain:
				// Spawn breeding jar
				this.spawnEntity(EntityBreedingJar, ig.system.width - 170, ig.system.height - 270, {inUse: true});
				// Spawn one jar for the pool
				this.spawnEntity(EntityJar, -1000, -1000, {inUse: false});
				ig.game.gui.loadElements(this.currentLevel);
				// Spawn 10 snails for the pool
				for (var i = 0; i < 10; i++) {
					this.spawnEntity(EntitySnail, -200, -200, {inUse: false});
				}
				// Spawn the first jar
				var x = 10;
				var y = 10;
				if (this.controller.activeJars > 0) {
					var jarsToLoad = this.controller.activeJars;
					console.log('jarstoload: ' + jarsToLoad);
					for (var i = 1; i <= jarsToLoad; i++) {
						console.log('loading jar');
						this.pool.useObject('jar', {pos: {x: x, y: y}});
					}
				}
				else {
					console.log('new jar');
        			this.controller.activeJars++;
        			this.impactSocket.updateUser(this.sessionUserID,'activeJars',this.controller.activeJars);
					this.pool.useObject('jar', {pos: {x: x, y: y}});
				}
			//	x = 400;
			//	y = 15;
				// If no snails have been loaded in the session...
				if (ig.game.sessionSnails.length === 0) {
					console.log('no snails loaded');
					// Create 4 random starter snails (make this check if the user is a NEW user or not)
					for (var n = 0; n < 4; n++) {
						this.pool.useObject('snail', {visible: false, starterSnail: true});
						// y += 150;
					}
				}
				// If snails have been loaded from the database...
				else {
					console.log('loading snails');
					// Create each snail according to pulled in attributes
					for (var i = 0; i < this.sessionSnails.length; i++) {
						var snail = this.sessionSnails[i];
						var attributes = {
							pos: {x: x, y: y},
							visible: false,
							starterSnail: false,
							loadedSnail: true,
							ownerID: this.sessionUserID,
							snailID: snail._id,
							inDb: true,
							name: snail.name,
							adult: snail.adult,
							size: {x: snail.size.x, y: snail.size.y},
							age: snail.age,
							scale: snail.scale,
							maxScale: snail.maxScale,
							// maxScale: Number,
							// maxSize: {x: Number, y: Number},

							// Genetics
							shellColor: {r: snail.shellColor.r, g: snail.shellColor.g, b: snail.shellColor.b},
							eyeColor: {r: snail.eyeColor.r, g: snail.eyeColor.g, b: snail.eyeColor.b},
							patternColor: {r: snail.patternColor.r, g: snail.patternColor.g, b: snail.patternColor.b},
							patternShape: snail.patternShape,

							speed: snail.speed,
							endurance: snail.endurance,
							weight: snail.weight,
							health: snail.health,

							genes: {
								shellColor: {allele1: snail.genes.shellColor.allele1, allele2: snail.genes.shellColor.allele2},
								eyeColor: {allele1: snail.genes.eyeColor.allele1, allele2: snail.genes.eyeColor.allele2},
								patternColor: {allele1: snail.genes.patternColor.allele1, allele2: snail.genes.patternColor.allele2},
								patternShape: {allele1: snail.genes.patternShape.allele1, allele2: snail.genes.patternShape.allele2}
							},

							// Housing
							inJar: snail.inJar,
							// parentJar: snail.parentJar.jarID,

							// Gender and breeding
							orientation: snail.orientation,
    						inBreedingJar: snail.inBreedingJar,
    						mating: snail.mating,
    						mateID: snail.mateID,

							arousalDelay: snail.arousalDelay,
							stagID: null,
							doeID: null

						}
						this.pool.useObject('snail', attributes);
					}
				}
			break;
		}
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		
		// Add your own drawing code here
	//	if(ig.gui.show) ig.gui.draw();
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', Snails, 60, 1280, 768, 1 );

});
