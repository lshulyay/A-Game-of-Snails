ig.module(
	'game.entities.breedingjar'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityBreedingJar = ig.Entity.extend({
    type: ig.Entity.TYPE.B,

    size: {x:100, y:133},
    clickable: true,

    occupantsArr: [],
    breedableOccupants: 0,

    minBreedingTime: 5,
    maxBreedingTime: 10,

    open: false,


    animSheet: new ig.AnimationSheet( 'media/items/breeding-jar.png', 100, 133 ),

	init: function(x, y, settings) {
		this.parent(x, y, settings);
        this.ctx = ig.game.ctx;
        ig.game.breedingJar = this;
        this.anims.idle = new ig.Animation( this.animSheet, 1, [0]);
        this.currentAnim = this.anims.idle;
        this.initialize();
	},


    initialize: function() {
        this.pos.x = ig.system.width / 2 - this.size.x;
        this.pos.y = 10;
        this.breedingTimer = new ig.Timer(0);
        this.resetBreedingTimer();
    //    this.arousalTimer = new ig.Timer(0);
    //    this.arousalTimer.pause();

    },
	
    update: function() {
        if (this.breedableOccupants > 1) {
            if (this.breedingTimer.delta() > 0) {
                console.log('breeding timer done');
                this.resetBreedingTimer();
                // Match up two snails here
                this.pickBreedingPair();
            }
            this.parent();
        }
    },

    draw: function() {
        this.parent();
        this.ctx.save();
        this.ctx.font = '50pt Arial'
        this.ctx.fillStyle = '#925ba7';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.occupantsArr.length, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 3);
        this.ctx.restore();
    },

    clicked: function() {
        if (!this.open) {
            console.log('opening');
            for (var i = 0; i < ig.game.pool.allJarsArr.length; i++) {
                var jar = ig.game.pool.allJarsArr[i];
                if (jar.inUse && jar.open) {
                    console.log('clicked');
                    jar.clicked();
                }
            }
            this.open = true;
            for (var i = 0; i < this.occupantsArr.length; i++) {
                var snail = this.occupantsArr[i];
                snail.visible = true;
            }
        }

        else {
            console.log('now closed');
            this.open = false;
            for (var i = 0; i < this.occupantsArr.length; i++) {
                var snail = this.occupantsArr[i];
                snail.visible = false;
                snail.dispStats = false;
                ig.game.gui.closeAllDependents(snail);
            }
        }
    },

    /******* PERIPHERAL FUNCTIONS *******/
    resetBreedingTimer: function() {
        var breedingTime = ig.game.controller.randomFromTo(this.minBreedingTime,this.maxBreedingTime);
        this.breedingTimer.set(breedingTime);
    },

    pickBreedingPair: function() {
        console.log('picking breeding pair');
        var snail1;
        var snail2;
        snail1 = this.pickBreedableSnail();
        snail1.mating = true;
        snail2 = this.pickBreedableSnail();
        snail2.mating = true;
        this.checkBreedableOccupants();
        console.log('snail1: ' + snail1.shellColor.r + ' snail2: ' + snail2.shellColor.r);
        this.setArousalTimer(snail1,snail2);
    },

    pickBreedableSnail: function() {
        this.occupantsArr = ig.game.controller.shuffleArray(this.occupantsArr);
        if (this.occupantsArr[0].mating) {
            console.log('picking again');
            this.pickBreedableSnail();
        }
        return this.occupantsArr[0];
    },

    setArousalTimer: function(snail1,snail2) {
        var arousalDelay;
        if (snail1.arousalDelay > snail2.arousalDelay) {
            arousalDelay = snail1.arousalDelay;
        }
        else {
            arousalDelay = snail2.arousalDelay;
        }
        this.assignGenders(snail1,snail2,arousalDelay);
    },

    assignGenders: function(snail1,snail2,arousalDelay) {
        /* See whose orientation is greater. That snail becomes a male. The other a female. If both are the same, randomize */
        if (snail1.orientation > snail2.orientation) {
            snail1.orientation = 100;
            snail2.orientation = -100;
            snail2.activateArousalTimer(snail1,arousalDelay);
            console.log('snail1 male!');
        }

        else if (snail1.orientation < snail2.orientation) {
            snail1.orientation = -100;
            snail2.orientation = 100;
            snail1.activateArousalTimer(snail2,arousalDelay);
            console.log('snail2 male!');
        }

        else if (snail1.orientation === snail2.orientation) {
            var rand = ig.game.controller.randomFromTo(0,1);
            if (rand === 0) {
                snail1.orientation = 100;
                snail2.orientation = -100;
                snail2.activateArousalTimer(snail1,arousalDelay);
                console.log('rand snail1 male!');
            }
            else{
                snail1.orientation = -100;
                snail2.orientation = 100;
                snail1.activateArousalTimer(snail2,arousalDelay);
                console.log('rand snail2 male!');
            }
        }
    },

    generateBabySnail: function(snail1,snail2) {
        console.log('generating baby snail');
        var stag;
        var doe;
        var x = snail1.pos.x + snail1.size.x + 10;
        var y = 10;
        var y; 
        if (snail1.orientation === 100) {
            stag = snail1;
            doe = snail2;
        }
        else {
            stag = snail2;
            doe = snail1;
        }
        ig.game.pool.useObject('snail', {pos: {x: x, y: y}, newbornSnail: true, stag: stag, doe: doe});
        
        this.removeSnail(snail1);
        snail1.mate = null;
        snail1.mating = false;


        this.removeSnail(snail2);
        snail2.mate = null;
        snail2.mating = false;

    },

    addSnail: function(snail) {
        snail.parentJar.removeSnail(snail);
        this.occupantsArr.push(snail);
        this.resetBreedingTimer();
        this.checkBreedableOccupants();
        ig.game.impactSocket.updateSnail(snail.snailID,'inBreedingJar',true);

    },

    removeSnail: function(snail) {
        ig.game.controller.removeFromArray(snail,this.occupantsArr);
        snail.inBreedingJar = false;
        snail.dispStats = false;
        ig.game.gui.closeAllDependents(snail);
        this.checkBreedableOccupants();
        snail.parentJar.addSnail(snail);
        ig.game.impactSocket.updateSnail(snail.snailID,'inBreedingJar',false);
        snail.visible = false;

    },

    checkBreedableOccupants: function() {
        var total = 0;
        for (var i = 0; i < this.occupantsArr.length; i++) {
            var occupant = this.occupantsArr[i];
            if (!occupant.mating) {
                total++;
            }
        }
        this.breedableOccupants = total;
    }


});
});