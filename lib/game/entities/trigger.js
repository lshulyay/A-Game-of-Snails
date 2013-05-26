ig.module( 
	'game.entities.trigger'
)
.requires(
	'impact.entity'
)
.defines(function(){"use strict";

ig.global.EntityTrigger = ig.Entity.extend({
	size: {x: 100, y: 28},
	offset: {x: 0, y: 0},
	maxVel: {x: 0, y: 0},
	kind: null,
	parentEntity: null,
	zIndex: 200,
	alpha: 0.6,
	active: true,
	clickable: true,
	cursorFade: true,
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: '#ffffff',
	inUse: false,
	textBg: '#25a20c',
	dependentsArr: [],
	temp: {},

	type: ig.Entity.TYPE.B,

    arrowAnimSheet: new ig.AnimationSheet( 'media/ui/arrow.png', 50, 50 ),
    mainMenuAnimSheet: new ig.AnimationSheet( 'media/ui/main-menu/raceFlag.png', 100, 133),
    snailAnimSheet: new ig.AnimationSheet( 'media/sprites/snail-template.png', 150, 117 ),


	init: function( x, y, settings ) {
        ig.game.pool.addToPool(this,ig.game.pool.allTriggersArr);

        this.anims.arrow = new ig.Animation( this.arrowAnimSheet, 1, [0], false );
        this.anims.raceFlag = new ig.Animation( this.mainMenuAnimSheet, 1, [0], false);
        this.anims.snail = new ig.Animation( this.snailAnimSheet, 1, [0], false);

		this.parent(x, y, settings);
		this.ctx = ig.game.ctx;
		this.panelButtonPos = {x: 10, y: ig.system.height - 35};

		if( !ig.global.wm ) {
			ig.game.sortEntitiesDeferred();
		}
	},

	initialize: function() {
		if (this.parentEntity) {
			this.parentEntity.dependentsArr.push(this);
		}
		switch (this.kind) {
			case 'breedSnail':
			//	this.snail = this.parentEntity.parentEntity;
				this.size.x = 200;
				this.pos.x = this.panelButtonPos.x;
				this.pos.y = this.panelButtonPos.y;
				break;
			case 'nameSnail':
				this.size.x = 200;
				this.pos.x = this.panelButtonPos.x + this.size.x + 5;
				this.pos.y = this.panelButtonPos.y;
				break;
			case 'startButton':
				this.pos.x -= 39;
				this.pos.y -= 3;
				this.size.x = 78;
				this.size.y = 45;
				break;
			case 'racesButton':
				this.pos.x  = ig.system.width - this.size.x - 10;
				this.pos.y = 10;
				this.size.x = 100;
				this.size.y = 133;
				this.currentAnim = this.anims.raceFlag;
				break;
			case 'createRace':
				this.pos.x = ig.game.gui.menuPanel2Pos.x;
				this.pos.y = this.panelButtonPos.y;
				this.size.x = 200;
				break;
			case 'singleRace':
				this.size.x = 200;
				this.size.y = 28;
				if (this.temp.countDown === true) {
					this.parentEntity.racesListedCount--;
					this.parentEntity.racesDisplayedArr.unshift(this);

				}
				else {
					this.parentEntity.racesListedCount++;
					this.parentEntity.racesDisplayedArr.push(this);
				}
				break;
			case 'raceSlot':
				this.size.x = 250;
				this.size.y = 60;
				break;
			case 'downArrow':
				this.size.x = 50;
				this.size.y = 50;
        		this.currentAnim = this.anims.arrow;
        		this.currentAnim.flip.y = true;
				break;
			case 'upArrow':
				this.size.x = 50;
				this.size.y = 50;
				this.currentAnim = this.anims.arrow;
				break;
		}

	},

	clicked: function() {
		if (this.inUse) {
			switch (this.kind) {
				case 'breedSnail':
					if (!this.snail.inBreedingJar) {
						this.snail.inBreedingJar = true;
						ig.game.breedingJar.addSnail(this.snail);
					}
					else {
						this.snail.inBreedingJar = false;
						ig.game.breedingJar.removeSnail(this.snail);
					}
					break;
				case 'nameSnail':
					ig.game.controller.toggleNamePrompt(this.snail);
					break;
				case 'startButton':
					ig.game.loadLevel(LevelMain);
					break;
				case 'racesButton':
					if (ig.game.gui.dispMenuPanel2 !== 'racelist') {
						ig.game.gui.dispMenuPanel2 = 'racelist';
						ig.game.impactSocket.loadRacelist(function(races) {
					        ig.game.gui.spawnRacelist(races);
						});
					}
					else {
						ig.game.gui.dispMenuPanel2 = null;
						var allTriggers = ig.game.getEntitiesByType(EntityTrigger);

						for (var i = 0; i < allTriggers.length; i++) {
							if (allTriggers[i].kind === 'createRace') {
								console.log('pre dest create race kind...');
							}
						}
						ig.game.gui.closeAllDependents(this);
						var allTriggers = ig.game.getEntitiesByType(EntityTrigger);
						for (var i = 0; i < allTriggers.length; i++) {
							if (allTriggers[i].kind === 'createRace') {
								console.log('post dest create race kind...');
							}
						}
					}
					break;
				case 'createRace':
					ig.game.controller.toggleRaceCreatePrompt();
					break;
				case 'downArrow':
					this.parentEntity.scrollDown();
					break;
				case 'upArrow':
					this.parentEntity.scrollUp();
					break;
				case 'singleRace':
					if (this.parentEntity.openRace && this.parentEntity.openRace._id === this.temp.raceID) {
						ig.game.gui.closeSomeDependents('raceSlot',this.parentEntity);
						this.parentEntity.closeRaceDetails();
					}
					else {
						console.log('toggling open race from trigger');
						ig.game.gui.closeSomeDependents('raceSlot',this.parentEntity);
						this.parentEntity.openRaceDetails(this.temp.raceID,true);
					}
					break;
			}
		}
	},
    
    update: function() {
    	if (this.inUse) {
			if (!this.touches(ig.game.pointer)) {
				if (this.textBg !== '#25a20c') {
					this.textBg = '#25a20c';
				}
			}
			this.parent();
		}  
	},

	draw: function() {
		if (this.inUse) {
			if (this.currentAnim === null || this.kind === 'raceSlot') {
				if (this.kind === 'singleRace' && this.temp.raceFinished === true) {
					this.ctx.fillStyle = '#ff0000';
				}
				else {
					this.ctx.fillStyle = this.textBg;
				}
				this.ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
				this.ctx.fillStyle = '#ffffff';
			}
			else {
				this.parent();
			}
			switch (this.kind) {
				case 'breedSnail':
					var x = this.pos.x + 3;
					var y = this.pos.y + 3;
					this.ctx.font = '15pt Arial';
					this.ctx.textAlign = 'left';
					if (!this.snail.inBreedingJar) {
	        			this.ctx.fillText('Send to Breeding Jar', x, y);
	        		}
	        		else {
	        			this.ctx.fillText('Remove from Breeding Jar', x, y);
	        		}
	        		break;
	        	case 'nameSnail':
	        		var x = this.pos.x + 3;
	        		var y = this.pos.y + 3;
					this.ctx.font = '15pt Arial';
					this.ctx.textAlign = 'left';
	        		this.ctx.fillText('Name Snail', x, y);
	        		break;
	        	case 'startButton':
	        		var x = ig.system.width / 2;
	        		var y = ig.system.height / 2;
					this.ctx.font = '25pt Arial';
					this.ctx.textAlign = 'center';
					this.ctx.fillText('Play!', x, y);
					break;
				case 'createRace':
					var x = this.pos.x + 3;
					var y = this.pos.y + 3;
					this.ctx.font = '15pt Arial';
					this.ctx.textAlign = 'left';
					this.ctx.fillText('Create Race', x, y);
					break;
				case 'singleRace':
					var x = this.pos.x + 3;
					var y = this.pos.y + 3;
					this.ctx.font = '15pt Arial';
					this.ctx.textAlign = 'left';
	        		this.ctx.fillText(this.temp.raceName, x, y);
	        		this.ctx.save();
	        		x = this.pos.x + this.size.x - 5;
	        		this.ctx.textAlign = 'right';
	        		this.ctx.fillText(this.temp.entrantsArr.length + '/' + this.temp.reqEntrants, x, y);
	        		this.ctx.restore();
	        		break;
	        	case 'raceSlot':
	        		if (!this.temp.slotOccupied) {
	        			var x = this.pos.x + 3;
	        			var y = this.pos.y + 3;
	        			this.ctx.fillStyle = '#cccccc';
	        			this.ctx.font = '15pt Arial';
	        			this.ctx.fillText('Drag snail here to enter!', x, y);
	        		}
	        		else {
	        			this.ctx.save();
	        			this.ctx.strokeStyle = 'black';
			            this.ctx.lineWidth = 5;
			            this.drawShell();
			            this.drawEyes();
			            this.drawPattern();
			            this.ctx.save();
			            this.ctx.translate( ig.system.getDrawPos( this.pos.x - this.offset.x - ig.game.screen.x ),
			                 ig.system.getDrawPos( this.pos.y - this.offset.y - ig.game.screen.y ) );
			            this.ctx.scale( this.temp.scale, this.temp.scale );
			            this.currentAnim.draw( 0, 0 );
			            this.ctx.restore();
			            this.ctx.restore();
			            this.ctx.font = '15pt Arial';
			            this.ctx.fillStyle = '#cccccc';
			            var x = this.pos.x + 100;
			            var y = this.pos.y + 3;
			            this.ctx.fillText(this.temp.occupyingSnail.name, x, y);
			            y += 30;
			           	this.ctx.fillText('Owner: ' + this.temp.occupyingSnail.owner, x, y);
			           	y += 30;
			            if (ig.game.raceListGui.openRace.finished) {
			            	this.ctx.fillText('Finished in Place: ' + this.temp.finishPos, x, y);
			            }
	        		}
	        		break;

			}
		}
	},

	/******* 'raceSlot' specific functions *******/
	assignSnail: function(snail) {
		this.temp.scale = 0.5;
		this.temp.shellRadius = 56;
		this.temp.occupyingSnail = snail;
		this.temp.slotOccupied = true; 
		this.currentAnim = this.anims.snail;
		if (ig.game.raceListGui.openRace.finished) {
        	for (var i = 0; i < ig.game.raceListGui.openRace.resultsArr.length; i++) {
    			var raceResult = ig.game.raceListGui.openRace.resultsArr[i];
    			if (raceResult === this.temp.occupyingSnail._id) {
    				this.temp.finishPos = i + 1;
    			}
        		
        	}
        }
	},

    drawShell: function() {
        var yPos = this.pos.y + 60 * this.temp.scale;
        if (!this.flip) {
            var xPos = this.pos.x + 90 * this.temp.scale;
        }
        else {
            var xPos = this.pos.x + 60 * this.temp.scale;
        }
        this.ctx.fillStyle = 'rgba(' + this.temp.occupyingSnail.shellColor.r + ',' + this.temp.occupyingSnail.shellColor.g + ',' + this.temp.occupyingSnail.shellColor.b + ', 1)';
        this.ctx.beginPath();
        this.ctx.arc(xPos, yPos,this.temp.shellRadius * this.temp.scale,0,Math.PI*2,true);
        this.ctx.fill();
    },

    drawEyes: function() {
        var yPos = this.pos.y + 50 * this.temp.scale;
        if (!this.flip) {
            var xPos = this.pos.x + 5 * this.temp.scale;
        }
        else {
            var xPos = this.pos.x + 115 * this.temp.scale;
        }
        this.ctx.fillStyle = 'rgba(' + this.temp.occupyingSnail.eyeColor.r + ',' + this.temp.occupyingSnail.eyeColor.g + ',' + this.temp.occupyingSnail.eyeColor.b + ', 1)';
        this.ctx.fillRect(xPos,yPos,10 * this.temp.scale,15 * this.temp.scale);
        xPos += 20 * this.temp.scale;
        this.ctx.fillRect(xPos,yPos,10 * this.temp.scale,15 * this.temp.scale);
    },

    drawPattern: function() {
        var yPos = this.pos.y + 60 * this.temp.scale;
        if (!this.flip) {
            var xPos = this.pos.x + 50 * this.temp.scale;
        }
        else {
            var xPos = this.pos.x + 20 * this.temp.scale;
        }

        var patternRadius = 10;
        switch (this.temp.occupyingSnail.patternShape) {
            case 1: 
                for (var i = 0; i < 3; i ++) {
                    switch (i) { 
                        case 0:
                            xPos += 35 * this.temp.scale;
                            yPos -= 20 * this.temp.scale;
                            break;
                        case 1: 
                            xPos -= 15 * this.temp.scale;
                            yPos += 25 * this.temp.scale;
                            break;
                        case 2:
                            xPos += 30 * this.temp.scale;
                            break;
                    }
                    this.ctx.beginPath();
                    this.ctx.arc(xPos, yPos, patternRadius * this.temp.scale,0,Math.PI*2,true);
                    this.ctx.stroke();
                    this.ctx.fill();
                }
                break;
            case 2:
                patternRadius = 20;
                yPos -= 10 * this.temp.scale;
                for (var i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                //    this.ctx.fillRect(x,y,patternRadius,patternRadius);
                    this.ctx.rect(xPos,yPos,patternRadius * this.temp.scale,patternRadius * this.temp.scale);
                    this.ctx.stroke();
                    this.ctx.fill();
                    xPos += (patternRadius + 10) * this.temp.scale;
                }
                break;
        }
    },

	/******* PERIPHERAL FUNCTIONS *******/
    destroy: function() {
    	if (this.inUse) {
			ig.game.pool.freeObject(this);
			if (this.kind === 'nameSnail' && ig.game.controller.namePromptOpen === true) {
				console.log('toggling from destroy');
				ig.game.controller.toggleNamePrompt();
			}
			else if (this.kind === 'raceSlot') {
				console.log('closing race slot');
			}

			this.temp = {};
			this.kind = null;
			this.parentEntity = null;
			this.currentAnim = null;
			this.pos = {x: -100, y: -100};
	    }
    },

	closeAllParent: function() {
		this.parentEntity.destroy();
		for( var i = 0; i < ig.game.entities.length; i++ ) {
			var entity = ig.game.entities[i];
			if (entity.parentEntity === this.parentEntity) {
				entity.destroy();
			}
		}
	}

});
});
	