var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('lol!');
});

/******* SOCKET IO STUFF *******/
// Require HTTP module (to start server) and Socket.IO
var http = require('http'), io = require('socket.io');

// Start the server at port 8080
var server = http.createServer();
var port = process.env.PORT || 3000;
server.listen(port);


// Create a Socket.IO instance, passing it our server
var socket = io.listen(server);
// var _io = require("socket.io");
// var io = _io.listen(server);
// var io = require('socket.io').listen(server);

// assuming io is the Socket.IO server object
socket.configure(function () { 
  socket.set("transports", ["xhr-polling"]); 
  socket.set("polling duration", 10); 
});

// Add a connect listener
socket.on('connection', function(client){ 

	// Create periodical which ends a message to the client every 5 seconds
	var interval = setInterval(function() {
		client.send('This is a message from the server!  ' + new Date().getTime());
	},5000);

	// Success!  Now listen to messages to be received
	client.on('message',function(event){ 
		console.log('Received message from client!',event);
	});
	client.on('disconnect',function(){
	//	clearInterval(interval);
		console.log('Server has disconnected');
	});

	client.on('registeruser', function (data) {
		console.log('add user: ' + data.username);
		var user = new User({ username: data.username, password: data.password, newUser: true });
		user.save(function (err, user) {
		  if (err) // TODO handle the error
		  console.log('saved');
		});
	});

	client.on('savesnail', function (data, cb) {
		console.log('save snail: ' + data.name);
		var snail = new Snail(data);
		snail.save(function (err, snail) {
			if (err) {return cb(err)} // TODO handle the error
			var snailID = snail._id;
			console.log('saved snail ID ' + snailID);
			// client.emit('setSnailID', snailID);
			var conditions = {_id: data.ownerID},
				update = {$set: {newUser: false}}

			User.update(conditions,update,function(err){});
			console.log('user updated');
			cb(null,snailID);
		});

	});

	client.on('updatesnail', function (data) {
		// var snailData = data;
		var attrToUpdate = data.attrToUpdate;
		var newAttr = data.newAttr;
		var snailID = data.snailID;
		console.log('snailID: ' + snailID);
		var conditions = {_id: snailID};
		//	update = {$set: {attrToUpdate: newAttr}}
		var update = {}; 
  		update[attrToUpdate] = newAttr; 

		Snail.update(conditions,{ $set: update },function(err){});
		console.log('updated ' + snailID);
	});

	client.on('updateuser', function (data) {
		// var snailData = data;
		var attrToUpdate = data.attrToUpdate;
		var newAttr = data.newAttr;
		var userID = data.userID;
		console.log('userID: ' + userID);
		var conditions = {_id: userID};
		//	update = {$set: {attrToUpdate: newAttr}}
		var update = {}; 
  		update[attrToUpdate] = newAttr; 

		User.update(conditions,{ $set: update },function(err){});
		console.log('updated ' + userID);
	});


	client.on ('loginuser', function (data, cb) {
			// Gets user 
			var user = mongoose.model('User', userSchema);
			// Find user with passed username and password
			user.findOne({ 'username': data.username, 'password': data.password }, 'username password newUser _id activeJars', function (err, user) {
			  	// If user is not found, say so to client
			  	if (!user) {
			  		console.log('not found');
	  				cb( null, null);
	  				// client.emit('setuser', { username: null });
			  	}

			  	// If user is found, pass logged in username
			  	else if (user) {
			  		console.log('%s is a %s.', user.username, user.password) // Space Ghost is a talk show host.
	  				console.log('new user? ' + user.newUser);
	  				// client.emit('setuser', { username: user.username, userID: user._id });
	  				cb(null, {username: user.username, userID: user._id, activeJars: user.activeJars});
	  				// Find all snails owned by user
	  				if (!user.newUser) {
	  					console.log('not newUser');
	  					var userID = user._id;
	  					// Find snails owned by this user ID
	  					var snail = mongoose.model('Snail', snailSchema);
	  					snail.find({'ownerID': userID}, function(err, docs) {
	  						console.log('looking for snails');
	  						var snails = docs;
	  						if (snails !== null) {
	  						//	console.log('emit snails: ' + snails);
	  							client.emit('setsessionsnails', snails)
	  						}
	  						else {
	  							console.log('no snails found');
	  						}
	  					});
	  				}
	  			}
			})

		// var user = new User({ name: data.username, password: data.password });
	});

	client.on('createrace', function (data) {
		console.log('create race: ' + data.racename + 'entrants: ' + data.reqentrants);
		var race = new Race({ name: data.racename, reqEntrants: data.reqentrants, distance: data.distance, finished: false });
		race.save(function (err, race) {
		  if (err) // TODO handle the error
		  console.log('saved!');
		});
	});

	client.on('loadracelist', function (data, cb) {
		console.log('load all races');
		var race = mongoose.model('Race', raceSchema);
		var finished = data;
		race.find({'finished': finished}, function(err, docs) {
			console.log('looking for races');
			var races = docs;
			if (races !== null) {
				console.log('emit races: ' + races);
				// client.emit('setsessionraces', races)
				cb(null, races);

			}
			else {
				console.log('no races found');
				cb (null, null);
			}
		});	
	});

	client.on('runrace', function(data) {
		var distance = data.race.distance;
		var entrantsArr = data.entrants;
		// For every step in the race...
		for (var i = 0; i < distance; i++) {
			// For every entrant...
			for (var n = 0; n < entrantsArr.length; n++) {
				var snail = entrantsArr[n];
				snail.racePosition = i;
				// Apply endurance decay
				if (snail.currEndurance > 0) {
					snail.currEndurance--;
					console.log('currEndurance: ' + snail.currEndurance);
				}
				snail.health = snail.currEndurance + snail.weight;
				// Set action. 1: move forward; 2: bump snail; 3: stop
				// Move forard if endurance > 0 and condition !== hindered
				// Stop if endurance <= 0 or condition === hindered (take off hindered state)
				console.log('ID: ' + snail._id + ' race position: ' + snail.racePosition);
			}
		}

	});

	client.on('updateraceentries', function (data, cb) {
		console.log('entering race');
		// var snailData = data;
		var raceID = data.raceID;
		if (data.snailID) {
			var snailID = data.snailID;
		}
		var conditions = {_id: raceID};
		var attrToUpdate = 'entrantsArr';
		var update = {}
		// if snailID is present, add snail to race
		if (snailID) {
  			update[attrToUpdate] = snailID; 
			Race.update(conditions,{ $addToSet: update },function(err){
				if(err){
	                console.log('error: ' + err);
	        	} 
	        	else {
	                console.log("Successfully added");
	        	}
			});
		}

		// If snailID is not present, simply refresh race list and send to client
		var race = mongoose.model('Race', raceSchema);
		// Get array of all entrants
		race.findOne({ '_id': raceID }, 'entrantsArr reqEntrants distance', function (err, race) {
			console.log('entrants: ' + race.entrantsArr.length);
			var enteredSnailsArr = [];
			// for each entrant, find snail with matching ID
	/*		for (var i = 0; i < race.entrantsArr.length; i++) {
				var entryID = race.entrantsArr[i];
				var snail = mongoose.model('Snail', snailSchema);
				snail.findOne({'_id': entryID}, function(err, snail) {
					enteredSnailsArr.push(snail)
				//	client.emit('loadracingsnail', snail);
					// console.log('pushed ' + enteredSnailsArr.length);
					if (i === race.entrantsArr.length) {
						console.log('enteredSnailsArr: ' + enteredSnailsArr.length);
						cb(null,enteredSnailsArr);
					}

				});
			} */
			for (var i = 0; i < race.entrantsArr.length; i++) {
				var entryID = race.entrantsArr[i];
				var snail = mongoose.model('Snail', snailSchema);
				snail.findOne({'_id': entryID}, function(err, snail) {
					client.emit('loadracingsnail', snail);
				});
			} 
			if (race.entrantsArr.length === race.reqEntrants) {
				console.log('run race now!');
			}
		});
	});
});


/* socket.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
}); */

/* socket.on('connection', function (socket) {
		// Login
		socket.on ('loginuser', function (data) {
			// Gets user 
			var user = mongoose.model('User', userSchema);
			// Find user with passed username and password
			user.findOne({ 'username': data.username, 'password': data.password }, 'username password newUser _id', function (err, user) {
			  	// If user is not found, say so to client
			  	if (!user) {
			  		console.log('not found');
	  				socket.emit('setuser', { username: null });
			  	}

			  	// If user is found, pass logged in username
			  	else if (user) {
			  		console.log('%s is a %s.', user.username, user.password) // Space Ghost is a talk show host.
	  				console.log('ID: ' + user._id);
	  				socket.emit('setuser', { username: user.username });
	  				// Find all snails owned by user
	  				if (!user.newUser) {

	  				}
	  			}
			})

		// var user = new User({ name: data.username, password: data.password });
		});	
}); */



/******* END SOCKET IO STUFF *******/

var raceSchema = mongoose.Schema({
	name: String,
    entrantsArr: [],
    winnerID: Number,
    reqEntrants: Number,
    distance: Number,
    finished: Boolean,
})

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    newUser: Boolean,
    activeJars: Number,
})

var snailSchema = mongoose.Schema({

	// Core stats
	ownerID: mongoose.Schema.Types.ObjectId,
	inDb: Boolean,
	name: String,
	size: {x: Number, y: Number},
    age: Number,
    adult: Boolean,
    scale: Number,
    maxScale: Number,
    // maxScale: Number,
	// maxSize: {x: Number, y: Number},

    // Genetics
    shellColor: {r: Number, g: Number, b: Number},
    eyeColor: {r: Number, g: Number, b: Number},
    patternColor: {r: Number, g: Number, b: Number},
    patternShape: Number,

    speed: Number,
    currSpeed: Number,
    endurance: Number,
    currEndurance: Number,
    weight: Number,
    health: Number,

    raceAction: String,
    raceCondition: String,
    racePosition: Number,

    genes: {
        shellColor: {allele1: String, allele2: String},
        eyeColor: {allele1: String, allele2: String},
        patternColor: {allele1: String, allele2: String},
        patternShape: {allele1: String, allele2: String}
    },

    // Housing
    inJar: Number,
    parentJar: Number,

    // Gender and breeding
    orientation: Number,
    inBreedingJar: Boolean,
    mating: Boolean,
    mateID: Number,
    arousalDelay: Number,
    stagID: Number,
    doeID: Number
})

// NOTE: methods must be added to the schema before compiling it with mongoose.model()
userSchema.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name"
  console.log(greeting);
}

var User = mongoose.model('User', userSchema)
var Snail = mongoose.model('Snail', snailSchema)
var Race = mongoose.model('Race', raceSchema)


/* var fluffy = new User({ name: 'fluffy' });
fluffy.speak() // "Meow name is fluffy"

fluffy.save(function (err, fluffy) {
  if (err) // TODO handle the error
  fluffy.speak();
});

User.find(function (err, kittens) {
  if (err) // TODO handle err
  console.log(kittens)
}) */