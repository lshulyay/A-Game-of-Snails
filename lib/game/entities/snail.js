ig.module(
	'game.entities.snail'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntitySnail = ig.Entity.extend({
    type: ig.Entity.TYPE.B,

    inDb: false,

    size: {x: 150, y: 117},
    maxSize: {x: 150, y: 117},
    offset: {x: 0, y: 0},
    guiPos: {x: 10, y: 400},

    visualSpeed: 0,
    speed: 0,
    endurance: 0,
    weight: 0,
    health: 0,

    minStat: 1,
    maxStat: 5,

    shellRadius: 56,

    draggable: true,
    releasable: true,

    name: 'Unnamed',
    age: 1,
    ageInterval: 60,
    ageIncrement: 1,
    scale: 1,
    scaleIncrement: 0.01,
    adult: false,
    maxScale: 1,

    shellColor: {r: 255, g: 255, b: 255},
    eyeColor: {r: 255, g: 255, b: 255},
    patternColor: {r: 255, g: 255, b: 255},
    patternShape: null,

    genes: {
        shellColor: {allele1: null, allele2: null},
        eyeColor: {allele1: null, allele2: null},
        patternColor: {allele1: null, allele2 :null},
        patternShape: {allele1: null, allele2: null}
    },

    // Jar vars
    inJar: null,
    parentJar: null,
    visible: false,
    inUse: false,

    // Breeding vars
    orientation: 0, // 0 = neutral, -100 = fully female, 100 = fully male
    arousalDelay: 0,
    minArousalDelay: 1,
    maxArousalDelay: 15,
    inBreedingJar: false,
    mating: false,
    mate: null,

    stag: null,
    doe: null,

    // GUI vars
    dependentsArr: [],
    dispStats: false,

    flip: true,
    animSheet: new ig.AnimationSheet( 'media/sprites/snail-template.png', 150, 117 ),

    /******* CORE FUNCTIONS *******/

	init: function(x, y, settings) {
		this.parent(x, y, settings);
        ig.game.pool.addToPool(this,ig.game.pool.allSnailsArr);

        this.anims.idle = new ig.Animation( this.animSheet, 1, [0], false );
        this.currentAnim = this.anims.idle;

        this.ctx = ig.game.ctx;
        this.arousalTimer = new ig.Timer(this.arousalDelay);
        this.arousalTimer.pause();

        this.ageTimer = new ig.Timer(this.ageInterval);
        this.ageTimer.pause();
	},

    initialize: function() {
        // console.log('name: ' + this.name);
        if (!this.loadedSnail) {
            if (this.starterSnail) {
                console.log('startersnail');
                this.genRandomStats();
                this.generateRandomGenestring();
                var weightPercentage = ig.game.controller.calcPercentage(this.weight, 5);
                this.maxScale = ig.game.controller.calcTargetPercentageValue(weightPercentage,1);
                if (this.maxScale > 1) {
                    this.maxScale = 1;
                }
                this.maxSize.x = ig.game.controller.calcTargetPercentageValue(weightPercentage,150);
                this.maxSize.y = ig.game.controller.calcTargetPercentageValue(weightPercentage,117);
                this.size.x = this.maxSize.x;
                this.size.y = this.maxSize.y;
                this.adult = true;
                this.age = 3;
                this.scale = this.maxScale;
            }

            else if (this.newbornSnail) {
                console.log('newborn snail');
                this.generateStats();
                var weightPercentage = ig.game.controller.calcPercentage(this.weight, 5);
                this.maxScale = ig.game.controller.calcTargetPercentageValue(weightPercentage,1);
                if (this.maxScale > 1) {
                    this.maxScale = 1;
                }
                this.maxSize.x = ig.game.controller.calcTargetPercentageValue(weightPercentage,150);
                this.maxSize.y = ig.game.controller.calcTargetPercentageValue(weightPercentage,117);
                this.size.x = this.maxSize.x;
                this.size.y = this.maxSize.y;
                this.adult = false;
                this.age = 0;
                this.scale = 0.3;
            }

        }
        else {
            var weightPercentage = ig.game.controller.calcPercentage(this.weight, 5);
            this.maxSize.x = ig.game.controller.calcTargetPercentageValue(weightPercentage,150);
            this.maxSize.y = ig.game.controller.calcTargetPercentageValue(weightPercentage,117);
        }
        this.addToJar();

        this.health = this.weight + this.endurance;

        this.visualSpeed = this.speed * 5;

        this.ageTimer.set(this.ageInterval);
        this.ageTimer.unpause();

        var rand = ig.game.controller.randomFromTo(0,1);
        if (rand === 0) {
            this.flip = true;
        }
        else {
            this.flip = false;
        }
        var xPos = ig.game.controller.randomFromTo(10, ig.system.width - 10);
        this.pos.x = xPos;
        this.pos.y = 200 + (117 - this.size.y);
        var xdir = this.flip ? 1 : -1;
        this.vel.x = this.visualSpeed * xdir;
        this.currSpeed = this.speed;
        this.currEndurance = this.endurance;

        if (!this.inDb) {
            this.inDb = true;
            console.log('adding to db..once ' + this.id);

            ig.game.impactSocket.saveSnail(this);
        }
        console.log('size: ' + this.size.x + ' ' + this.size.y + ' name: ' + this.name);

    },

    addToJar: function() {
        console.log('addToJar()');
        var allJars = ig.game.pool.allJarsArr;
        var length = allJars.length;
        for (var i = length; i > 0; i--) {
            var jar = allJars[i - 1];
            if (!this.inJar) {
                if (jar.inUse && jar.occupantsArr.length < jar.maxOccupants) {
                    this.parentJar = jar.jarID;
                    this.inJar = jar.jarID;
                    this.parentJar = jar;
                    jar.addSnail(this);
                }
            }
            
            else if (this.inJar === jar.jarID) {
                jar.addSnail(this);
                this.parentJar = jar;
            }
            if (this.inBreedingJar) {
                console.log('in breeding jar');
                ig.game.breedingJar.addSnail(this);
            }
            if (jar.open) {
                this.visible = true;
            }
            break;
        }
    },

    update: function() {
        if (this.inUse) {
            if (this.flip && !this.currentAnim.flip.x) {
                this.currentAnim.flip.x = true;
            }

            else if (!this.flip && this.currentAnim.flip.x) {
                this.currentAnim.flip.x = false;
            } 

            if (this.pos.x <= 0 + this.size.x && !this.flip) {
                this.flip = true;
                this.currentAnim.flip.x = true;
                var xdir = this.flip ? 1 : -1;
                this.vel.x = this.visualSpeed * xdir; 
            }

            else if (this.pos.x >= ig.system.width - this.size.x && this.flip) {
                this.flip = false;
                this.currentAnim.flip.x = false;
                var xdir = this.flip ? 1 : -1;
                this.vel.x = this.visualSpeed * xdir; 
            }

            if (this.mating && this.arousalTimer.delta() > 0) {
                this.arousalTimer.set(this.arousalDelay);
                this.arousalTimer.pause();
                ig.game.breedingJar.generateBabySnail(this,this.mate);
            }

            if (this.scale < this.maxScale) {
            //    console.log('scale incrementing');
                this.scale += this.scaleIncrement * ig.system.tick;
                this.size.x = this.maxSize.x * this.scale;
                this.size.y = this.maxSize.y * this.scale;
                this.pos.y = 200 + (117 - this.size.y);
            }

            else {
                if (!this.adult) {
                    this.adult = true;
                    this.scale = this.maxScale;
                    this.size.x = this.maxSize.x * this.scale;
                    this.size.y = this.maxSize.y * this.scale;
                    this.pos.y = 200 + (117 - this.maxSize.y);
                }
            }

            if (this.draggable) {
                if (this.beingDragged) {
                    this.drag(ig.game.pointer);
                }
            }

            this.parent();
        }
    },

    draw: function() {

        if (this.inUse && this.visible) {
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 5;
            this.drawShell();
            this.drawEyes();
            this.drawPattern();
            this.ctx.save();
            this.ctx.translate( ig.system.getDrawPos( this.pos.x - this.offset.x - ig.game.screen.x ),
                 ig.system.getDrawPos( this.pos.y - this.offset.y - ig.game.screen.y ) );
            this.ctx.scale( this.scale, this.scale );
            this.currentAnim.draw( 0, 0 );

            this.ctx.restore();
        }
    },

    /******* PERIPHERAL FUNCTIONS *******/
    drag: function(pointer) {
        this.pos.x = pointer.pos.x - this.size.x / 2;
        this.pos.y = pointer.pos.y - this.size.y / 2;
    },

    // When the player stops dragging this snail
    stopDrag: function() {
        // set this.beingDragged to false
        this.beingDragged = false;
        // If the number of open/dosplayed race entrants is smaller than the number of required race entrants...
        if (ig.game.raceListGui) {
            if (ig.game.raceListGui.openRaceEntrantsArr.length < ig.game.raceListGui.openRace.reqEntrants) {
                // Find all race slot triggers
                var raceSlotsArr = ig.game.controller.findTriggerByKind('raceSlot', true);
                // For each race slot trigger...
                for (var i = 0; i < raceSlotsArr.length; i++) {
                    var slot = raceSlotsArr[i];
                    // If the snail touches said slot
                    if (this.touches(slot)) {
                        // If the slot is not occupied...
                        if (!slot.temp.slotOccupied) {
                            // Try to add snail to the race in this slot.
                            ig.game.gui.updateRaceList(this);
                            break;
                        }
                        else {
                            console.log('slot already occupied');
                        }
                    }

                }
            }
        }
        this.pos.y = 200 + (117 - this.size.y);
    },

    released: function() {
        if (this.visible) {
        /*        if (!this.statPromptOpen) {
                    this.statPromptOpen = true;
                    console.log('opening');
                    document.getElementById("snailMenu").style.display = 'block';
                    // this.snailToName = snail;
                    // this.namePromptOpen = true;
                }
                else {
                    this.statPromptOpen = false;
                    console.log('closing');
                    document.getElementById("snailMenu").style.display = 'none';
                    // this.snailToName = null;
                } */


            if (!this.dispStats) {
                // console.log('gotta display yo!');
                this.dispStats = true;
                ig.game.pool.freeAllObjects('snailstatsgui');
                ig.game.pool.useObject('snailstatsgui', {parentEntity:this});
            }
            else {
                this.dispStats = false;
                ig.game.gui.closeAllDependents(this);
            }
        }
    },


    destroy: function() {
        if (this.inUse) {
            ig.game.pool.freeObject(this);
            this.kind = null;
            this.parentEntity = null;
            this.pos = {x: -200, y: -200};
            this.ageTimer.reset();
            this.ageTimer.pause();
        }
    },


    activateArousalTimer: function(mate,delay) {
        this.mate = mate;
        this.arousalTimer.set(delay);
    },

    genRandomStats: function() {
        this.speed = ig.game.controller.randomFromTo(this.minStat, this.maxStat);
        this.endurance = ig.game.controller.randomFromTo(this.minStat, this.maxStat);
        this.weight = ig.game.controller.randomFromTo(this.minStat, this.maxStat);

        this.shellColor = ig.game.controller.pickRandomColor(0,255,0,255,0,255);
        this.eyeColor = ig.game.controller.pickRandomColor(0,255,0,255,0,255);
        this.patternColor = ig.game.controller.pickRandomColor(0,255,0,255,0,255);
        this.patternShape = ig.game.controller.randomFromTo(1,3);
        this.arousalDelay = ig.game.controller.randomFromTo(this.minArousalDelay,this.maxArousalDelay);
    },

    generateStats: function() {
        // Generate speed
        this.speed = this.generateBackgroundTraits(this.speed,this.stag.speed,this.doe.speed);
        // Generate endurance
        this.endurance = this.generateBackgroundTraits(this.endurance,this.stag.endurance,this.doe.endurance);

        // Generate weight
        this.weight = this.generateBackgroundTraits(this.weight,this.stag.weight,this.doe.weight);

        // Generate arousalDelay
        this.arousalDelay = this.generateBackgroundTraits(this.arousalDelay,this.stag.arousalDelay,this.doe.arousalDelay);

        // Generate shell color
        this.generateAlleles(this.genes.shellColor,this.stag.genes.shellColor,this.doe.genes.shellColor);
        this.shellColor = this.generateVisibleTraits(this.shellColor, this.stag.shellColor, this.doe.shellColor);

        // Generate eyeColor
        this.generateAlleles(this.genes.eyeColor,this.stag.genes.eyeColor,this.doe.genes.eyeColor);
        this.eyeColor = this.generateVisibleTraits(this.eyeColor, this.stag.eyeColor, this.doe.eyeColor);
        // Generate patternColor
        this.generateAlleles(this.genes.patternColor,this.stag.genes.patternColor,this.doe.genes.patternColor);
        this.patternColor = this.generateVisibleTraits(this.patternColor, this.stag.patternColor, this.doe.patternColor);
        // Generate patternShape
        this.generateAlleles(this.genes.patternShape,this.stag.genes.patternShape,this.doe.genes.patternShape);
        this.patternShape = this.generateVisibleTraits(this.patternShape, this.stag.patternShape, this.doe.patternShape);
    },

    generateBackgroundTraits: function(trait,stagTrait,doeTrait) {
        var traitAverage = (stagTrait + doeTrait) / 2;
        var modifier = ig.game.controller.calcTargetPercentageValue(5,traitAverage);
        modifier = ig.game.controller.decimalRandomFromTo(-modifier,modifier);
        console.log('modifier: ' + modifier);
        var finalTrait = traitAverage + modifier;
        if (finalTrait < 0) {
            finalTrait = 1;
        }
        return finalTrait;
    },

    generateVisibleTraits: function(trait,stagTrait,doeTrait) {
        var color;
        var alleles = this.getAllele(trait);
        console.log('getting allele for trait: ' + trait);
        var allele1Dominant = this.checkAlleleDominance(alleles.allele1);
        var allele2Dominant = this.checkAlleleDominance(alleles.allele2);
        if (trait !== this.patternShape) {
            if (allele1Dominant && !allele2Dominant) {
                return this.pickColor(alleles.allele1,stagTrait);
            }

            else if (allele2Dominant && !allele1Dominant) {
                return this.pickColor(alleles.allele2,doeTrait);
            }

            else if (allele1Dominant && allele2Dominant || !allele1Dominant && !allele2Dominant) {
                var a1 = alleles.allele1.toUpperCase();
                var a2 = alleles.allele2.toUpperCase();
                switch (true) {
                    case a1 === 'R' || a2 === 'R':
                        return this.pickColor('R');
                        break;
                    case a1 === 'G' || a2 === 'G':
                        return this.pickColor('G');
                        break;
                    case a1 === 'B' || a2 === 'B':
                        return this.pickColor('B');
                        break;

                }
            }
        }

        else {
            if (allele1Dominant && !allele2Dominant) {
                return this.pickShape(alleles.allele1);
            }

            else if (allele2Dominant && !allele1Dominant) {
                return this.pickShape(alleles.allele2);
            }

            else if (allele1Dominant && allele2Dominant || !allele1Dominant && !allele2Dominant) {
                var rand = ig.game.controller.randomFromTo(0,1);
                if (rand === 0) {
                    return this.pickShape(alleles.allele1);
                }
                else {
                    return this.pickShape(alleles.allele2);
                }
            //    return rand;
            }
        }
    },

    pickColor: function (allele,parentTrait) {
        var c = allele.toUpperCase();
        var color;
        var minValue = 0;
        var maxValue = 255;
        switch (c) {
            case 'R':
                if (parentTrait) {
                    minValue = parentTrait.r - 50;
                }
                return ig.game.controller.pickRandomColor(minValue,maxValue,0,minValue,0,minValue);
                break;
            case 'G':
                if (parentTrait) {
                    minValue = parentTrait.g - 50;
                }
                return ig.game.controller.pickRandomColor(0,minValue,minValue,maxValue,0,minValue);
                break;
            case 'B':
                if (parentTrait) {
                    minValue = parentTrait.g - 50;
                }                
                return ig.game.controller.pickRandomColor(0,minValue,0,minValue,minValue,maxValue);
                break;
        }    
    },

    pickShape: function(allele) {
        var s = allele.toUpperCase();
        switch (s) {
            case 'A':
                return 1;
                break;
            case 'B':
                return 2;
                break;
            case 'C':
                return 3;
                break;
        }
    },

    generateAlleles: function(trait,stagTrait,doeTrait) {
        // Generate shellColor
        var possibilities = [
                                {allele1: stagTrait.allele1, allele2: doeTrait.allele1},
                                {allele1: stagTrait.allele1, allele2: doeTrait.allele2},
                                {allele1: stagTrait.allele2, allele2: doeTrait.allele1},
                                {allele1: stagTrait.allele2, allele2: doeTrait.allele2}
                            ];
        var rand = ig.game.controller.randomFromTo(0,3);
        trait.allele1 = possibilities[rand].allele1;
        trait.allele2 = possibilities[rand].allele2;

    },

    generateRandomGenestring: function() {
        // Set shell color alleles
        var allele = ig.game.controller.getHighestNumber(this.shellColor,true);
        this.genes.shellColor.allele1 = allele.toUpperCase();
        this.genes.shellColor.allele2 = allele;

        // Set eye color alleles
        var allele = ig.game.controller.getHighestNumber(this.eyeColor,true);
        this.genes.eyeColor.allele1 = allele.toUpperCase();
        this.genes.eyeColor.allele2 = allele;

        // Set pattern color alleles
        var allele = ig.game.controller.getHighestNumber(this.patternColor,true);
        this.genes.patternColor.allele1 = allele.toUpperCase();
        this.genes.patternColor.allele2 = allele;

        // Set pattern shape alleles
        switch(this.patternShape) {
            case 1:
                this.genes.patternShape.allele1 = 'A';
                this.genes.patternShape.allele2 = 'a';
            break;

            case 2:
                this.genes.patternShape.allele1 = 'B';
                this.genes.patternShape.allele2 = 'b';
            break;

            case 3:
                this.genes.patternShape.allele1 = 'C';
                this.genes.patternShape.allele2 = 'c';
            break;
        }
    },

    getAllele: function(trait) {
        switch (trait) {
            case this.shellColor: 
                return this.genes.shellColor;
                break;
            case this.eyeColor:
                return this.genes.eyeColor;
                break;
            case this.patternColor:
                return this.genes.patternColor;
                break;
            case this.patternShape:
                return this.genes.patternShape;
                break;
        }
    },

    checkAlleleDominance: function(allele) {
        if (allele === allele.toUpperCase()) {
            return true;
        }
        else {
            return false;
        }
    },
	
    drawShell: function() {
        var yPos = this.pos.y + 60 * this.scale;
        if (!this.flip) {
            var xPos = this.pos.x + 90 * this.scale;
        }
        else {
            var xPos = this.pos.x + 60 * this.scale;
        }
        this.ctx.fillStyle = 'rgba(' + this.shellColor.r + ',' + this.shellColor.g + ',' + this.shellColor.b + ', 1)';
        this.ctx.beginPath();
        this.ctx.arc(xPos, yPos,this.shellRadius * this.scale,0,Math.PI*2,true);
        this.ctx.fill();
    },

    drawEyes: function() {
        var yPos = this.pos.y + 50 * this.scale;
        if (!this.flip) {
            var xPos = this.pos.x + 5 * this.scale;
        }
        else {
            var xPos = this.pos.x + 115 * this.scale;
        }
        this.ctx.fillStyle = 'rgba(' + this.eyeColor.r + ',' + this.eyeColor.g + ',' + this.eyeColor.b + ', 1)';
        this.ctx.fillRect(xPos,yPos,10 * this.scale,15 * this.scale);
        xPos += 20 * this.scale;
        this.ctx.fillRect(xPos,yPos,10 * this.scale,15 * this.scale);
    },

    drawPattern: function() {
        var yPos = this.pos.y + 60 * this.scale;
        if (!this.flip) {
            var xPos = this.pos.x + 50 * this.scale;
        }
        else {
            var xPos = this.pos.x + 20 * this.scale;
        }

        var patternRadius = 10;
        switch (this.patternShape) {
            case 1: 
                for (var i = 0; i < 3; i ++) {
                    switch (i) { 
                        case 0:
                            xPos += 35 * this.scale;
                            yPos -= 20 * this.scale;
                            break;
                        case 1: 
                            xPos -= 15 * this.scale;
                            yPos += 25 * this.scale;
                            break;
                        case 2:
                            xPos += 30 * this.scale;
                            break;
                    }
                    this.ctx.beginPath();
                    this.ctx.arc(xPos, yPos, patternRadius * this.scale,0,Math.PI*2,true);
                    this.ctx.stroke();
                    this.ctx.fill();
                }
                break;
            case 2:
                patternRadius = 20;
                yPos -= 10 * this.scale;
                for (var i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                //    this.ctx.fillRect(x,y,patternRadius,patternRadius);
                    this.ctx.rect(xPos,yPos,patternRadius * this.scale,patternRadius * this.scale);
                    this.ctx.stroke();
                    this.ctx.fill();
                    xPos += (patternRadius + 10) * this.scale;
                }
                break;
        }
    },

    drawStats: function() {
        var x = this.guiPos.x;
        var y = this.guiPos.y;
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(this.guiPos.x, this.guiPos.y, 350, 100);
        var lineIncrement = 20;
        this.ctx.font = '15pt Arial';
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText('Speed: ' + this.speed, x, y);
        y += lineIncrement;
        this.ctx.fillText('Endurance: ' + this.endurance, x, y);
        y += lineIncrement;
        this.ctx.fillText('Weight: ' + this.weight, x, y);
        y += lineIncrement;
        this.ctx.fillText('Mating: ' + this.mating, x, y);
        y += lineIncrement;
        if (!this.stag) {
            this.ctx.fillText('ID: ' + this.id, x, y);
        }
        else {
            this.ctx.fillText('ID: ' + this.id + ' stag: ' + this.stag.id + ' doe: ' + this.doe.id, x, y);
        }
    //    this.ctx.fillText('Genestring: ' + this.genes.shellColor.allele1 + this.genes.shellColor.allele2 + this.genes.eyeColor.allele1 + this.genes.eyeColor.allele2 + this.genes.patternColor.allele1 + this.genes.patternColor.allele2 + this.genes.patternShape.allele1 + this.genes.patternShape.allele2, x, y);
    },


});
});