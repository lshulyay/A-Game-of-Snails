ig.module(
	'game.entities.jar'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityJar = ig.Entity.extend({
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.NONE,
    inUse: false,
    jarID: null,
    size: {x:100, y:133},
    occupantsArr: [],
    maxOccupants: 100,
    activeOccupants: 0,
    maxSpaces: 6,
    occupantsGrid: [
                    {x: 10, y: 220, occupied: false},
                    {x: 10, y: 342, occupied: false},
                    {x: 10, y: 464, occupied: false},
                    {x: 10, y: 586, occupied: false},

                    {x: 300, y: 220, occupied: false},
                    {x: 300, y: 342, occupied: false},
                    {x: 300, y: 464, occupied: false},
                    {x: 300, y: 586, occupied: false}
                ],
    // GUI vars
    open: false,
    clickable: true,


    animSheet: new ig.AnimationSheet( 'media/items/jar.png', 100, 133 ),

	init: function(x, y, settings) {
		this.parent(x, y, settings);
        this.ctx = ig.game.ctx;
        ig.game.pool.addToPool(this,ig.game.pool.allJarsArr);
        this.jarID = ig.game.pool.allJarsArr.length;
        this.anims.idle = new ig.Animation( this.animSheet, 1, [0]);
        this.ctx = ig.game.ctx;
        this.currentAnim = this.anims.idle;
        // this.initialize();
	},


    initialize: function() {
        this.open = true;
        console.log('active jars: ' + ig.game.controller.activeJars);
    },
	
    update: function() {
        if (this.inUse) {
            this.parent();
        }
    },

    draw: function() {
        if (this.inUse) {
            this.parent();
            this.ctx.save();
            this.ctx.font = '50pt Arial'
            this.ctx.fillStyle = '#4a8abc';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.occupantsArr.length, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 3);
            this.ctx.restore();
        } 
    },

    clicked: function() {
        if (!this.open) {
            for (var i = 0; i < ig.game.pool.allJarsArr.length; i++) {
                var jar = ig.game.pool.allJarsArr[i];
                if (jar.inUse && jar.open) {
                    jar.clicked();
                }
            }
            if (ig.game.breedingJar.open) {
            //    console.log('open1? ' + ig.game.breedingJar.open);
                ig.game.breedingJar.clicked();
            //    console.log('open2? ' + ig.game.breedingJar.open)
            }
            this.open = true;
            for (var i = 0; i < this.occupantsArr.length; i++) {
                var snail = this.occupantsArr[i];
                snail.visible = true;
            }
        }

        else {
            this.open = false;
            for (var i = 0; i < this.occupantsArr.length; i++) {
                var snail = this.occupantsArr[i];
                snail.visible = false;
                snail.dispStats = false;
                ig.game.gui.closeAllDependents(snail);
            }
        }
    },

    addSnail: function(snail) {
        this.occupantsArr.push(snail);
        this.activeOccupants++;
        snail.visible = true;
    },

    removeSnail: function(snail) {
        ig.game.controller.removeFromArray(snail,this.occupantsArr);
        snail.visible = false;
        snail.dispStats = false;
        ig.game.gui.closeAllDependents(snail);
    }


});
});