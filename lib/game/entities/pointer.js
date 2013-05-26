ig.module(
	'game.entities.pointer'
)
.requires(
	'impact.entity'
)

.defines(function(){

EntityPointer = ig.Entity.extend({
        checkAgainst: ig.Entity.TYPE.B,
        size: {x:1, y:1},
        mousePressed: {x: 0, y: 0},
        dragging: false,

		init: function(x, y, settings) {
			this.parent(x, y, settings);
            ig.game.pointer = this;
		},
		
        update: function() {
            this.pos.x = ig.input.mouse.x;
            this.pos.y = ig.input.mouse.y;
        },

        check: function( other ) {
            if (other.textBg && other.clickable) {
                if (other.textBg !== '#157203') {
                    other.textBg = '#157203';
                }
            }

            if (ig.input.pressed('mouse1') && other.clickable) {
                other.clicked();
            }

            else if (ig.input.state('mouse1') && other.draggable) {
                if (this.mousePressed.x === 0 && this.mousePressed.y === 0) {
                    this.mousePressed.x = this.pos.x;
                    this.mousePressed.y = this.pos.y;
                }
                var distance = Math.sqrt(Math.pow((this.mousePressed.x - this.pos.x),2)+Math.pow((this.mousePressed.y - this.pos.y),2));
                if (distance > 5) {
                    // other.drag(this);
                    if (!other.beingDragged && !this.dragging) {
                        other.beingDragged = true;
                    }
                    this.dragging = true;
                }
            }

            if (ig.input.released('mouse1')) {
                if (other.beingDragged) {
                    other.stopDrag();
                    this.mousePressed.x = 0;
                    this.mousePressed.y = 0;
                    this.dragging = false;
                }

                else if (other.releasable) {
                    other.released();
                }
            }

        }

});
});