ig.module(
	'game.misc.impactsocket'
)
.requires(
	'impact.impact'
).defines(function() {

	ig.ImpactSocket = ig.Class.extend({
		
		init : function(port) {
			// this.remoteId;
			//reconnecting wont work for now
			this.socket = io.connect('http://gentle-cliffs-3423.herokuapp.com:'+port, {
					'reconnect' : true,
					'reconnection delay' : 500,
					'max reconnection attempts' : 10
				});
			/**
			 * starts communication with server
			 */
			this.socket.emit('start');
			
			

			// Add a connect listener
			this.socket.on('connect',function() {
				console.log('Client has connected to the server!');
			});			

			this.socket.on('news', function (data) {
				console.log(data);
				this.socket.emit('my other event', { my: 'data' });
			});

			// This is called when the user logs in, to load all of the snails.
			this.socket.on('setsessionsnails', function (data) {
				ig.game.sessionSnails = data;
				console.log('snails length: ' + ig.game.sessionSnails.length);
				if (ig.game.sessionSnails.length > 0) {
					ig.game.loadLevel(LevelMain);
				}
        	});        	
 
			this.socket.on('loadracingsnail', function (data) {
				var snail = data;
				console.log('load racing snail: ' + data._id);
				if (ig.game.raceListGui.openRace !== null) {
					console.log('refreshing race entrants');
					ig.game.raceListGui.refreshRaceEntrants(snail);
				}
        	});        	



			// Announce text to everyone
			this.socket.on('announced', function(data) {
				ig.game.write(data.text,{
					x: ig.system.width/4,
					y: ig.system.height/4
				});
			});
			
		},
		
		
		// Universal broadcasting
		send: function(name, data){
			console.log('send called');
			this.socket.emit("impactsocketbroadcast", {
				name: name,
				data: data
			});
		},

		// User registration
		registerUser: function() {
			console.log('register user');
			// Get username and password from the HTML form
			var data = {username: null, password: null};
			data.username = document.getElementById("username").value;
			data.password = document.getElementById("password").value;
			if (data.username && data.password) {
				// Send username and password to server
				this.socket.emit("registeruser",data);
			}
			else {
				console.log('Username and/or password blank');
			}
		},

		// User login
		loginUser: function() {
			// Get username and password from form
			var data = {username: null, password: null};
			data.username = document.getElementById("username").value;
			data.password = document.getElementById("password").value;
			console.log('loginUser: ' + data.username + ' ' + data.password);
			// If username and password were successfully retrieved...
			if (data.username && data.password) {
				// Emit the data to server and get user back
				this.socket.emit("loginuser", data, function(err, user) {
					if (err) {
						return console.error(err);
					}
					if (user !== null) {
						console.log('setUser: ' + user.username);
					// Set username based on form input and ID based on DB info
        				ig.game.sessionUsername = data.username;
	            		ig.game.sessionUserID = user.userID;
	            		ig.game.controller.toggleAccessPrompt();
	            		ig.game.controller.activeJars = user.activeJars;

	            	}
	            	else {
	            		console.log('account not found');
	            	}
				});
			}
		},
		
		saveSnail: function(snail) {
			// Core stats
			var data = {};
			data.ownerID = ig.game.sessionUserID;
			data.ownerUsername = ig.game.sessionUsername;
			data.inDb = true;
			data.name = snail.name;
			data.size = {x: snail.size.x, y: snail.size.y};
			data.age = snail.age;
			data.adult = snail.adult;
			data.scale = snail.scale;
			data.maxScale = snail.maxScale;

			// Genetics
			data.shellColor = {r: snail.shellColor.r, g: snail.shellColor.g, b: snail.shellColor.b};
			data.eyeColor = {r: snail.eyeColor.r, g: snail.eyeColor.g, b: snail.eyeColor.b};
			data.patternColor = {r: snail.patternColor.r, g: snail.patternColor.g, b: snail.patternColor.b};
			data.patternShape = snail.patternShape;

			data.speed = snail.speed;
			data.currSpeed = snail.currSpeed;
			data.endurance = snail.endurance;
			data.currEndurance = snail.currEndurance;
			data.weight = snail.weight;
			data.health = snail.health;

			data.genes = {
				shellColor: {allele1: snail.genes.shellColor.allele1, allele2: snail.genes.shellColor.allele2},
				eyeColor: {allele1: snail.genes.eyeColor.allele1, allele2: snail.genes.eyeColor.allele2},
				patternColor: {allele1: snail.genes.patternColor.allele1, allele2: snail.genes.patternColor.allele2},
				patternShape: {allele1: snail.genes.patternShape.allele1, allele2: snail.genes.patternShape.allele2}
			};

			// Housing
			data.inJar = snail.inJar;
			data.parentJar = snail.parentJar.jarID;

			// Gender and breeding
			data.orientation = snail.orientation;
			data.arousalDelay = snail.arousalDelay;
    		data.inBreedingJar = snail.inBreedingJar;
    		data.mating = snail.mating;
    		if (snail.mate) {
    			data.mateID = snail.mate.snailID;
    		}

			data.stagID = null;
			data.doeID = null;
			if (snail.stag) {
				stagID = snail.stag.stagID;
				snail.doeID = snail.doe.doeID;
			}

			console.log('saving snail');
			this.socket.emit("savesnail", data, function(err, snailid) {

				if (err) {
					return console.error(err);
				}
				snail.snailID = snailid;
				console.log('snail ID set: ' + snailid);
			});
		},


		updateSnail: function(snailID,attrToUpdate,newAttr) {
			console.log('updating');
			var data = {
				snailID: snailID,
				attrToUpdate: attrToUpdate,
				newAttr: newAttr
			};
			console.log('data.snailID: ' + data.snailID);
			this.socket.emit("updatesnail", data);
		},

		updateRace: function(raceID,attrToUpdate,newAttr) {
			console.log('updating');
			var data = {
				raceID: raceID,
				attrToUpdate: attrToUpdate,
				newAttr: newAttr
			};
			console.log('data.raceID: ' + data.raceID);
			this.socket.emit("updaterace", data);
			ig.game.impactSocket.loadRacelist(function(races) {
		        ig.game.gui.spawnRacelist(races);
				ig.game.impactSocket.refreshRaceSlots();
			});
		},

		updateUser: function(userID,attrToUpdate,newAttr) {
			console.log('updating');
			var data = {
				userID: userID,
				attrToUpdate: attrToUpdate,
				newAttr: newAttr
			};
			console.log('data.userID: ' + data.userID);
			this.socket.emit("updateuser", data);
		},
		/**
		 * writes text on every screen
		 * font is your ig.game.font
		 */
		announce: function(data){
			this.socket.emit("announce", data);
		},


		/******* RACING *******/
		createRace: function() {
			console.log('create race');
			// Get race name and entrants number from the HTML form
			var data = {racename: null, reqentrants: null};
			data.racename = document.getElementById("racename").value;
			data.reqentrants = document.getElementById("reqentrants").value;
			data.distance = document.getElementById("distance").value;
			// Send username and password to server
			this.socket.emit("createrace",data);
			ig.game.controller.toggleRaceCreatePrompt();

			this.loadRacelist(function(races) {
				ig.game.gui.spawnRacelist(races);
			});
		},

		loadRacelist: function(cb) {
			var finished = null;
			this.socket.emit("loadracelist", finished, function(err, races) {
				if (err) {
					return console.error(err);
				}
				if (races !== null) {

					ig.game.controller.raceListArr = races;
					console.log('racelisarr: ' + ig.game.controller.raceListArr.length);
	    			cb(ig.game.controller.raceListArr); 

            	} 
            	else {
            		console.log('races not found');
            	}
	        });
		},

		refreshRaceSlots: function(snail) {
			// Get open race
			var race = ig.game.raceListGui.openRace;
			// Set data to empty object
			var data = {};
			// Set raceID to pass, which is the ID of the currently open race
			data.raceID = race._id;
			// If a snail was passed...
			if (snail) {
				// Set the snailID to pass
				data.snailID = snail.snailID;
			}
			// Emit to server
			this.socket.emit("updateraceentries", data, function(err, enteredSnailsArr) {
				if (err) {
					console.log('error: ' + err);
				}
				else {
					console.log('done! ' + enteredSnailsArr[0]);
				}
			});
		},

		runRace: function(race,entrants) {
			var data = {};
			data.race = race;
			data.entrants = entrants;
			console.log('running race');

			this.socket.emit("runrace", data, function(err,raceResultsArr) {
				if (err) {
					console.log('race results error: ' + err);
				}
				else {
					console.log('raceResultsArr: ' + raceResultsArr);
					ig.game.impactSocket.updateRace(race._id,'resultsArr',raceResultsArr);
					ig.game.impactSocket.updateRace(race._id,'finished',true);			           
				}
			});
		}		
	});
});