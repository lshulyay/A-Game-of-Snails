ig.module(
	'game.entities.gui'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityGui = ig.Entity.extend({
    type: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    zIndex: 2,

    // Style attributes
    headingsColor: '#52CC52',
    headingsFont: '40pt Arial',
    headingsLineIncrement: 55,

    maintextColor: '#CCCCCC',
    maintextFont: '20pt Arial',
    maintextLineIncrement: 30,
    dispMenuPanel2: null,

    // Menu Panel entities
    menuPanel2Pos: {x: 450, y: 350},
    menuPanel2Size: {x: 205, y: 400},

	init: function(x, y, settings) {
     //   this.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent(x, y, settings);
        this.ctx = ig.game.ctx;
        ig.game.gui = this;
    },

    loadElements: function(currentLevel) {
            switch (currentLevel) {
            case LevelMain:
                // Spawn snail stat GUI entity
                ig.game.spawnEntity(EntitySnailStatsGUI, 0, 0, {inUse: false});
                // Create menu triggeres
                ig.game.pool.useObject('trigger', { kind: 'racesButton' });

        }    
    },
	
    update: function() {
        this.parent();
    },

    draw: function() {
    //    this.parent();
   /*     switch (this.dispMenuPanel2) {
            case 'racelist':
                this.drawRaceHeading();
                break;
        } */
    },

    closeAllDependents: function(entity) {
        if (entity.dependentsArr) {
            var length = entity.dependentsArr.length;
            for (var i = 0; i < length; i++) {
            //    console.log('destroy');
                var dependentEntity = entity.dependentsArr[i];
                if (dependentEntity.dependentsArr.length > 0) {
                    this.closeAllDependents(dependentEntity);
                    dependentEntity.dependentsArr.length = 0;
                }
                dependentEntity.destroy();
            }
            entity.dependentsArr.length = 0;   
        } 
    },

    closeSomeDependents: function(kind,entity) {
        if (entity.dependentsArr) {
            var length = entity.dependentsArr.length;
            for (var i = 0; i < entity.dependentsArr.length; i++) {
                var dependentEntity = entity.dependentsArr[i];
                if (dependentEntity.kind === kind) {
                    if (dependentEntity.dependentsArr.length > 0) {
                        this.closeAllDependents(dependentEntity);
                        dependentEntity.dependentsArr.length = 0;
                    }
                //    entity.dependentsArr.splice(i,1);
                    dependentEntity.destroy();
                }
            }
        }
    },

    updateRaceList: function(entrant) {
        // Call refreshRaceSlots 
        ig.game.impactSocket.refreshRaceSlots(entrant);
        // Spawn the Racelist GUI
        this.spawnRacelist(null);
    },

    spawnRacelist: function(races) {
        // Set openRace to null
        var openRace = null;
        // If an instance of the racelist GUI already exists...
        if (ig.game.raceListGui) {
            // If the openRace of the existing racelist GUI is not null...
            if (ig.game.raceListGui.openRace !== null) {
                // Set openRace to the existing openRace
                openRace = ig.game.raceListGui.openRace;
            }
            // Find the races button
            var racesButton = ig.game.controller.findTriggerByKind('racesButton');
            // Close all dependents on the races button
            this.closeAllDependents(racesButton);
            // If openRace is not null and openRace has an ID...
            if (openRace && openRace._id) {
                // Spawn the racelistGUI with the openRace
                ig.game.spawnEntity(EntityRacelistGUI, 0, 0, {openRace: openRace});
            }
            else {
                // Else, spawn racelist GUI without openRace
                ig.game.spawnEntity(EntityRacelistGUI, 0, 0);
            }
            // raceListGui.destroy();
        }
        // If an instance of racelist GUI does not already exist,
        else {
            // Spawn the racelist GUI without an openRace set
            ig.game.spawnEntity(EntityRacelistGUI, 0, 0);
        }
    }

    /******* IF dispMenuPanel22 IS 'racelist' *******/

/*    spawnRaceTriggers: function(races) {
        //function(races) {
        // First, kill all existing race list triggers
        console.log('races: ' + races.length);
        var parentTrigger = ig.game.controller.findTriggerByKind('racesButton');
        this.closeAllDependents(parentTrigger);
        var x = ig.game.gui.menuPanel2Pos.x;
        var y = ig.game.gui.menuPanel2Pos.y + 55;
        for (var i = 0; i < ig.game.controller.raceListArr.length; i++) {
            var race = ig.game.controller.raceListArr[i];
            ig.game.pool.useObject('trigger', {kind: 'singleRace', parentEntity: parentTrigger, raceName: race.name, pos: {x: x, y: y}});
            y += 30;
        }
        ig.game.pool.useObject('trigger', {kind: 'createRace', parentEntity: parentTrigger});

                    //   }
    },

    drawRaceHeading: function() {
        var x = this.menuPanel2Pos.x + 3;
        var y = this.menuPanel2Pos.y + 3;
        var lineIncrement = this.headingsLineIncrement;
    //    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
   //     this.ctx.fillRect(this.pos.x,this.pos.y, 350, 100);
        this.ctx.font = this.headingsFont;
        this.ctx.fillStyle = this.headingsColor;
        this.ctx.fillText('Races...', x, y);
     /*   y += lineIncrement;
        lineIncrement = this.maintextLineIncrement;
        this.ctx.font = this.maintextFont;
        this.ctx.fillStyle = this.maintextColor;
        this.ctx.fillText('Speed:', x, y);
        y += lineIncrement;
        this.ctx.fillText('Endurance: ', x, y);
        y += lineIncrement;
        this.ctx.fillText('Weight: ', x, y);
        y += lineIncrement;
        this.ctx.fillText('Mating: ', x, y);
        y += lineIncrement; 
    } */


});

/******* ENTITY SNAIL STATS GUI *******/

ig.global.EntitySnailStatsGUI = ig.Entity.extend({
    type: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    pos: {x: 10, y: 350},
    zIndex: 2,
    parentEntity: null,
    dependentsArr: [],
    openRace: null,

    init: function(x, y, settings) {
     //   this.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent(x, y, settings);
        this.ctx = ig.game.ctx;
        this.size.x = ig.system.width - 20;
        this.pos.x = 10;
        this.pos.y = 350;
        ig.game.pool.addToPool(this,ig.game.pool.allSnailStatsGUI);
    },

    initialize: function() {
        if (this.parentEntity) {
            this.parentEntity.dependentsArr.push(this);
            this.gui = ig.game.gui;

        }

        var x = this.pos.x + 250;
        var y = this.pos.y;
        ig.game.pool.useObject('trigger', {pos: {x: x, y: y}, kind: 'breedSnail', parentEntity: this, snail: this.parentEntity });
        y += 40;
        if (this.parentEntity.name === 'Unnamed') {
            ig.game.pool.useObject('trigger', {pos: {x: x, y: y}, kind: 'nameSnail', parentEntity: this, snail: this.parentEntity });
        }

        var snail = this.parentEntity;
        this.speed = snail.speed;
        this.endurance = snail.endurance;
        this.weight = snail.weight;
        this.mating = snail.mating;
        this.id = snail.id;
        this.stag = snail.stag;
        this.doe = snail.doe;
    },
    
    update: function() {
        if (this.inUse) {
            this.parent();
        }
    },

    draw: function() {
        if (this.inUse) {
    //    this.parent();
            var snail = this.parentEntity;
            var x = this.pos.x;
            var y = this.pos.y;
            var lineIncrement = this.gui.headingsLineIncrement;
        //    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
       //     this.ctx.fillRect(this.pos.x,this.pos.y, 350, 100);
            this.ctx.font = this.gui.headingsFont;
            this.ctx.fillStyle = this.gui.headingsColor
            this.ctx.fillText(snail.name, x, y);
            y += lineIncrement;
            lineIncrement = this.gui.maintextLineIncrement;
            this.ctx.font = this.gui.maintextFont;
            this.ctx.fillStyle = this.gui.maintextColor;
            this.ctx.fillText('Speed: ' + snail.speed, x, y);
            y += lineIncrement;
            this.ctx.fillText('Endurance: ' + snail.endurance, x, y);
            y += lineIncrement;
            this.ctx.fillText('Weight: ' + snail.weight, x, y);
            y += lineIncrement;
            this.ctx.fillText('Mating: ' + snail.mating, x, y);
            y += lineIncrement;
            if (!snail.stag) {
                this.ctx.fillText('ID: ' + snail.id, x, y);
            }
            else {
                this.ctx.fillText('ID: ' + snail.id + ' stag: ' + snail.stag.id + ' doe: ' + snail.doe.id, x, y);
            }
        }
    },

    destroy: function() {
        if (this.inUse) {
            ig.game.pool.freeObject(this);
            this.parentEntity.dispStats = false;
            this.kind = null;
            this.parentEntity = null;
        //    this.pos = {x: -this.size.x, y: -this.size.y};
        }
    },

    closeAllDependents: function(entity) {
        var length = entity.dependentsArr.length;
        for (var i = 0; i < length; i++) {
        //    console.log('destroy');
            var dependentEntity = entity.dependentsArr[i];
            dependentEntity.destroy();
        }
        entity.dependentsArr.length = 0;    
    }

});


// I have no idea why this works...
ig.global.EntityRacelistGUI = ig.Entity.extend({
    type: ig.Entity.TYPE.NONE,
    size: {x:500, y:350},
    // pos: {x: 10, y: 400},
    zIndex: 2,
    parentEntity: null,
    dependentsArr: [],
    racesDisplayedArr: [],
    racesListedCount: 0,
    openRace: null,
    openRaceEntrantsArr: [],

    // GUI attributes
    listLimit: 10,

    init: function(x, y, settings) {
     //   this.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent(x, y, settings);
        this.ctx = ig.game.ctx;
        // this.size.x = ig.system.width - 20;
        this.initialize();
        // ig.game.pool.addToPool(this,ig.game.pool.allSnailStatsGUI);
    },

    initialize: function() {
        ig.game.raceListGui = this;
        this.openRaceEntrantsArr.length = 0;

        this.size.x = ig.game.gui.menuPanel2Size.x;
        this.size.y = ig.game.gui.menuPanel2Size.y;
        this.pos.x = ig.game.gui.menuPanel2Pos.x;
        this.pos.y = ig.game.gui.menuPanel2Pos.y;
        if (this.openRace !== null) {
            console.log('openRace is not null ' + this.openRace);
            this.openRaceDetails(this.openRace._id);
        }
        // Create up and down scroll arrows
        ig.game.pool.useObject('trigger', {kind: 'downArrow', pos: {x: this.pos.x + this.size.x, y: this.pos.y + this.size.y - 39}, parentEntity: this});
        ig.game.pool.useObject('trigger', {kind: 'upArrow', pos: {x: this.pos.x + this.size.x, y: this.pos.y + 55}, parentEntity: this});
        // First, kill all existing race list triggers
        var parentTrigger = ig.game.controller.findTriggerByKind('racesButton');
        ig.game.pool.useObject('trigger', {kind: 'createRace', parentEntity: this});
        this.parentEntity = parentTrigger;
        if (this.parentEntity) {
            this.parentEntity.dependentsArr.push(this);
        }

        // this.closeAllDependents(parentTrigger);
        var x = ig.game.gui.menuPanel2Pos.x;
        var y = ig.game.gui.menuPanel2Pos.y + 55;
        for (var i = 0; i < this.listLimit; i++) {
            var race = ig.game.controller.raceListArr[i];
            if (race) {
                ig.game.pool.useObject('trigger', {kind: 'singleRace', parentEntity: this, temp: {raceID: race._id, raceName: race.name, countDown: false, entrantsArr: race.entrantsArr, reqEntrants: race.reqEntrants}, pos: {x: x, y: y}});
                y += 30;
            }
        }

        this.inUse = true;
    },
    
    update: function() {
        if (this.inUse) {
            this.parent();
        }
    },

    draw: function() {
        if (this.inUse) {
            var x = ig.game.gui.menuPanel2Pos.x + 3;
            var y = ig.game.gui.menuPanel2Pos.y + 3;
            var lineIncrement = ig.game.gui.headingsLineIncrement;
            this.ctx.font = ig.game.gui.headingsFont;
            this.ctx.fillStyle = ig.game.gui.headingsColor;
            this.ctx.fillText('Races', x, y);
            if (this.openRace !== null) {
                this.drawRaceDetails();
            }

        }
    },

    drawRaceDetails: function() {
        var x = this.pos.x + this.size.x + 60;
        var y = this.pos.y;
        var lineIncrement = ig.game.gui.headingsLineIncrement;
        this.ctx.font = ig.game.gui.headingsFont;
        this.ctx.fillStyle = ig.game.gui.headingsColor;
        this.ctx.fillText(this.openRace.name, x, y);
        y += lineIncrement;
        lineIncrement = ig.game.gui.maintextLineIncrement;
     //   this.ctx.save();
        this.ctx.font = ig.game.gui.maintextFont;
        this.ctx.fillStyle = ig.game.gui.maintextColor;
        this.ctx.fillText('Entrants: ' + this.openRace.entrantsArr.length, x, y);

    //    y += lineIncrement;
    /*    y += lineIncrement;
        this.ctx.fillText('Required Entrants: ' + this.openRace.reqEntrants, x, y);
        y += lineIncrement;
        for (var i = 0; i < this.openRace.entrantsArr.length; i++) {
            var snail = this.openRace.entrantsArr[i];
            this.ctx.fillText(snail.name, x, y);
            y += lineIncrement;
        } */
    //    this.ctx.restore();

    },

    destroy: function() {
        if (this.inUse) {
            ig.game.raceListGui = null;
            this.kill();
        //    this.pos = {x: -this.size.x, y: -this.size.y};
        }
    },

    closeAllDependents: function(entity) {
        var length = entity.dependentsArr.length;
        for (var i = 0; i < length; i++) {
        //    console.log('destroy');
            var dependentEntity = entity.dependentsArr[i];
            dependentEntity.destroy();
        }
        entity.dependentsArr.length = 0;    
    },

    openRaceDetails: function(id,pullEntrants) {
        this.openRaceEntrantsArr.length = 0;
        var allRaceSlots = ig.game
        console.log('opening race ID: ' + id);
        for (var i = 0; i < ig.game.controller.raceListArr.length; i++) {
            var race = ig.game.controller.raceListArr[i];

            if (race._id === id) {
                this.openRace = race;
                break;
            }
        }

        // Spawn entry slots for open race
        var x = this.pos.x + this.size.x + 60;
        var y = this.pos.y + 85;
        for (var i = 0; i < this.openRace.reqEntrants; i++) {
            ig.game.pool.useObject('trigger', {kind: 'raceSlot', parentEntity: this, temp: {raceEntrantsArr: race.entrantsArr, raceID: race._id}, pos: {x: x, y: y}});
            y += 65;
        }
        if (pullEntrants) {
            ig.game.impactSocket.refreshRaceSlots();
        }
    },

    refreshRaceEntrants: function(snail) {
        var alreadyDisplayed = ig.game.controller.inArray(this.openRaceEntrantsArr,snail);
        if (!alreadyDisplayed) {
            this.openRaceEntrantsArr.push(snail);
            var allRaceSlots = ig.game.controller.findTriggerByKind('raceSlot', true);
            for (var i = 0; i < allRaceSlots.length; i++) {
                var slot = allRaceSlots[i];
                if (!slot.temp.slotOccupied) {
                    slot.assignSnail(snail);
                    console.log('assigning');
                    break;
                }
            }
        }
        console.log('open race entrants arr length: ' + this.openRaceEntrantsArr.length);
        if (this.openRaceEntrantsArr.length >= this.openRace.reqEntrants) {
            ig.game.impactSocket.runRace(this.openRace, this.openRaceEntrantsArr);
        }
    },

    closeRaceDetails: function() {
        this.openRace = null;
        this.openRaceEntrantsArr.length = 0;
    },

    scrollDown: function() {
        var race = ig.game.controller.raceListArr[this.racesListedCount];
        if (race) {
            this.racesDisplayedArr[0].destroy();
            this.racesDisplayedArr.splice(0,1);
            if (race) {
                for (var i = 0; i < this.racesDisplayedArr.length; i++) {
                    var prevRace = this.racesDisplayedArr[i];
                    prevRace.pos.y -= 30;
                }
                var x = ig.game.gui.menuPanel2Pos.x;
                var y = ig.game.gui.menuPanel2Pos.y + 55 + (this.racesDisplayedArr.length * 30);
                ig.game.pool.useObject('trigger', {kind: 'singleRace', parentEntity: this, temp: {raceID: race._id, raceName: race.name, countDown: false, entrantsArr: race.entrantsArr, reqEntrants: race.reqEntrants}, pos: {x: x, y: y}});
            }
        }
    },

    scrollUp: function() {
        var race = ig.game.controller.raceListArr[this.racesListedCount-this.listLimit-1];
        if (race) {
            var lastDisplayedRace = this.racesDisplayedArr[this.racesDisplayedArr.length-1];
            lastDisplayedRace.destroy();
            // Remove the last element from the races displayed array
            this.racesDisplayedArr.pop();
            if (race) {
                for (var i = 0; i < this.racesDisplayedArr.length; i++) {
                    var prevRace = this.racesDisplayedArr[i];
                    prevRace.pos.y += 30;
                }
                var x = ig.game.gui.menuPanel2Pos.x;
                var y = ig.game.gui.menuPanel2Pos.y + 55;
                ig.game.pool.useObject('trigger', {kind: 'singleRace', parentEntity: this, temp: {raceID: race._id, raceName: race.name, countDown: true, entrantsArr: race.entrantsArr, reqEntrants: race.reqEntrants}, pos: {x: x, y: y}});
            }
        }
    },


}); 
});

