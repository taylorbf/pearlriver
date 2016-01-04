/* SERVER */

/* Put connection address here */
//var socket = io.connect('http://10.0.1.101:8080');
var socket = io.connect('http://10.0.1.101:8080');


var Users = new Array();
var target = null;
var myName = false;
var operators = {
	freq: 0,
	dur: 0,
	wait: 0,
	amp: 0,
	pos: 0
};

var funnyNames = [
	"Morty",
	"Barty",
	"Prince",
	"Hobart",
	"Spock",
	"Ingleby",
	"Barney",
	"Poe",
	"Chuck",
	"Mace",
	"ObiWan",
	"Yoda"
]


// on connection to server
socket.on('connect', function() {
	//users and user interaction
	if (!myName){
		myName = funnyNames[Math.floor(Math.random()*funnyNames.length)]+Math.floor(Math.random()*100);
	}
	$("#welcome").fadeOut(500);
	socket.emit('adduser', myName);
});

socket.on('disconnect', function() {
	socket.emit('removeuser', myName);
});

// LISTEN for daisies
socket.on('updatechat', function (type, data) {
	if (type=="daisy") {
		if (data.target == myName) {
			console.log(data.pattern);
			daisyBloom(data.pattern);
		} else {
			$("#user"+data.target).stop().css("background-color", "#49f").animate({backgroundColor: "#DDD"}, 500);
		}
	}
	if (type=="connection") {
		addConnection(data[0],data[1]);
	}
	if (type=="soundProfile") {
		if (data.direction == myName) {
			daisyVals.pos = data.pos;
		}
	}
	if (type=="chat") {
		postToChat(data);
	}
	/*
	if (type=="node") {
		position1.groupNode(data);
	} 
	*/
});

// update user list
socket.on('updateusers', function(data) {
	$('#users').empty();
	Users = new Array();
	$.each(data, function(key, value) {
		Users.push(key);
		$('#users').append('<div class="a_user" id="user'+key+'" onclick="selectUser(\''+key+'\')">' + key + '</div>');
	});
	$("#user"+myName).css("border","solid 2px #4af");
	defineUserPaths();
	makeAllConnections();
});


var context, carrier, mod, modpoint, modgain, buff, delay, delayGain, verb, ring, prefxbus;
var canvas, visctx;


/* Onload */

var sound = new Array();

$(document).ready(function() {
	
	canvas = document.getElementById("paths");
	visctx = canvas.getContext("2d");
	
	canvas.width = 400;
	canvas.height = 400;
	
	// audio priming will go here
	
	context = new webkitAudioContext();
	tuna = new Tuna(context);
	
	tremolo = new tuna.Tremolo({
	      intensity: 0.7,    //0 to 1
	      rate: 0.001,         //0.001 to 8
	      stereoPhase: 180,    //0 to 180
	      bypass: 0
	  });

	prefxbus = context.createGainNode();	
	prefxbus.gain.value = 0.5;
	
	/* fx - needs work */
	
	delay = context.createDelayNode();
	delay.delayTime.value = dream(10)*0.2+0.2;
	
	delayGain = context.createGainNode();
	delayGain.gain.value = 0.7;


	toDelay = context.createGainNode();
	toDelay.gain.value = 0;
	
	
//	prefxbus.connect(delay);
	
	buffCount = 0;
	
	
	/*indiv buffer players */

	for (var i=0;i<10;i++) {
		sound[i] = {
			osc: context.createOscillator(),
			volume: context.createGainNode()
			
		}
		sound[i].osc.frequency.value = daisyVals.freq;
		sound[i].osc.type = 0;
		sound[i].osc.start(context.currentTime);
		sound[i].volume.gain.value = 0;
		sound[i].osc.connect(sound[i].volume);
		sound[i].volume.connect(prefxbus);

	}
	

	var curveLength = 40;
	var curve1 = new Float32Array(curveLength);
	var curve2 = new Float32Array(curveLength);
	for (var i = 0; i < curveLength; i++) {
	    curve1[i] = Math.max(1-(i/5), 0);
	}
	 
	var waveTable = context.createPeriodicWave(curve1, curve1);
	
	for (var i = 0; i < sound.length; i++) {
		sound[i].osc.setPeriodicWave(waveTable);
	}
	
	
	// SEQUENCE OF MAJOR CONNECTIONS
	
	prefxbus.connect(context.destination);
	//tremolo.connect(context.destination);

	prefxbus.connect(toDelay);
	toDelay.connect(delay);
	delay.connect(delayGain);
	delayGain.connect(context.destination);
	delayGain.connect(delay);

	setTimbre();
	
		
});

var timbretype = 4;
var waveTable;

function setTimbre() {
	/*
	var curveLength = 40;
	var curve1 = new Float32Array(curveLength);
	var curve2 = new Float32Array(curveLength);
	for (var i = 0; i < curveLength; i++) {
	    curve1[i] = Math.max(1-(i/timbretype), 0);
	}
	 
	var waveTable = context.createPeriodicWave(curve1, curve1);
	
	for (var i = 0; i < sound.length; i++) {
		sound[i].osc.setPeriodicWave(waveTable);
	}
 	*/

	var curveLength = 40; //40
	var curve1 = new Float32Array(curveLength);
	var curve2 = new Float32Array(curveLength);
	for (var i = 0; i < curveLength; i++) {
	    curve1[i] = Math.max(1-(i/timbretype), 0);
	}
	 
	waveTable = context.createPeriodicWave(curve1, curve1);

}


/* UI via Net */

function selectUser(key) {
	if (target!=key) {
		target = key;
	} else {
		target = null;
	}
	
	addMyOwnConnection(myName, target);
	
}


//FIX: UPDATE this list for new value categories



 
function editDaisy(e, val) {
	console.log(val);
	if (event.which==13) {
		val=val.split(" ");
		if (val[0]=="sample") {
		//	eval("daisyVals."+val[0]+" = '"+val[1]+"';");
		} else {
			eval("daisyVals."+val[0]+" = "+val[1]);
			delay.feedback = limitRange(daisyVals.delay,0,0.99); 
			verb.roomSize = daisyVals.verb;
		}
		$("#daisyeditor").val("");
		
	}
}

			
function setParam(type,val) {
}

function limitRange(val,low,high) {
	if (val<low) {
		val = low;
	} else if (val>high) {
		val = high;
	}
	return val;
}

function startPulse() {
	
	//sendDaisy(daisyVals.pattern);
	
}


function sendDaisy(pattLen) {
	if (!pattLen) {
		pattLen = daisyVals.pattern;
	}
	var daisy = {
					"target": target,
					"pattern": pattLen
	}
	socket.emit('sendchat', "daisy", daisy);
}

var allBuffers = new Array();
var samplersUsed = 0;
var volumes = new Array();

/***********************************************************
*
* DAISIES
* BLOOM
* HERE
*
***********************************************************/

var myenv = [0, 1, 0.5, 0.5, 0.5, 0.4, 0.3, 0.2, 0.1, 0];
var myenv_r = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 1, 0];
var chosenenv = myenv;
var envname = "ping";


function daisyBloom(patternLen) {
	
	console.log(daisyVals);
	
	patternLen-=0.1;
	currDur = daisyVals.dur;

	$("#user"+myName).stop().css("background-color", "#49f").animate({backgroundColor: "#FFF"}, 500);
	
	// play sound code here

	if (sound[samplersUsed%10].volume.gain.value==0) {

		// set timbre
		
		sound[samplersUsed%10].osc.setPeriodicWave(waveTable);
	
		sound[samplersUsed%10].osc.frequency.setValueAtTime(daisyVals.freq,context.currentTime);
		
		var now = context.currentTime;

		for (var i=0; i<chosenenv.length; i++) {
			if (i==chosenenv.length) {
				sound[samplersUsed%10].volume.gain.linearRampToValueAtTime(0, now + ((currDur/1000)/chosenenv.length)*i + 0.1);
			} else {
				sound[samplersUsed%10].volume.gain.linearRampToValueAtTime(chosenenv[i], now + ((currDur/1000)/chosenenv.length)*i + 0.1);
			}
			
		}
	}
	
	
	samplersUsed++;
	/*
	if (patternLen > 0) {
		setTimeout("sendDaisy("+patternLen+")", 70);	
	} */

	setTimeout("sendDaisy("+patternLen+")", daisyVals.dur/2);	


}

function eraseSamplers() {
//	allBuffers = new Array();
//	console.log("samples cleared");
}


function sendMySound() {
	var profile = {
		specs: daisyVals,
		direction: target 
	} 
	
	socket.emit('sendchat', "soundProfile", profile);
}





/* UI Front-end */
var userNames = new Array();


function defineUserPaths() {
	userNames = new Array();
	for (i=0;i<Users.length;i++) {
		var thisUser = Users[i];
		Users[i] = new Object();
		Users[i].name = thisUser;
		var radius = 200;
		var center = 200;
		//$("#user"+Users[i].name).html(Users.length);
		var pipos = ((Math.PI*2)/Users.length)*i;
		//var pipos = ((Math.PI*2)/3)*1;
		Users[i].xPos = Math.sin(pipos)*radius+center-40;
		Users[i].yPos = Math.cos(pipos)*radius+center-40;
		$("#user"+Users[i].name).css("left", Users[i].xPos+"px");
		$("#user"+Users[i].name).css("top", Users[i].yPos+"px");
		userNames.push(Users[i].name);
	}
}

var connections = new Array();
var fromPoint = new Array();
var toPoint = new Array();

function addMyOwnConnection(person1,person2) {
	socket.emit('sendchat', "connection", [person1,person2]);
	addConnection(person1,person2);
}

function addConnection(person1, person2) {
	if (fromPoint.indexOf(person1)==-1) {
		fromPoint.push(person1);
		toPoint.push(person2);
	} else {
		toPoint[fromPoint.indexOf(person1)] = person2;
	}
	makeAllConnections();
}

//connections
function makeAllConnections() {
	canvas.width = canvas.width;
	pathControl = new Array();
	for (i=0;i<fromPoint.length;i++) {
		var fromI, toI;
		for (j=0;j<Users.length;j++) {
			if (Users[j].name==fromPoint[i]) {
				fromI = j;
			}
			if (Users[j].name==toPoint[i]) {
				toI = j;
			}
		}
		if (fromI>-1 && toI >-1) {
			drawConnection(fromI, toI);
		} else {
			fromPoint.splice(i,1);
			toPoint.splice(i,1);
		}
	}	
} 

var pathControl = new Array();

function drawConnection(fromI, toI) {
	var pathCheck = fromI+"to"+toI;
	var pathCheck2 = toI+"to"+fromI;
	if (pathControl.indexOf(pathCheck)==-1) {
		visctx.strokeStyle = "#bbb";
		pathControl.push(pathCheck);
		pathControl.push(pathCheck2);
	} else {
		visctx.strokeStyle = "#333";
	}
	with (visctx) {
		lineWidth = 3;
		beginPath();
		moveTo(Users[fromI].xPos+40,Users[fromI].yPos+40);
		lineTo(Users[toI].xPos+40,Users[toI].yPos+40);
		stroke();
		closePath();
	}
}


function submitChat(e) {
	if (e.which==13) {
		var newChat = {
			user: myName,
			text: $("#chatinput").val()
		}
		socket.emit('sendchat', "chat", newChat);
		$("#chatinput").val("");
	}
	
}

function postToChat(data) {
	
	var htmlstr = data.user
				+ ": "
				+ data.text
				+ "<br>";
	
	$("#chatmessages").prepend(htmlstr);
	
}



var daisyVals = {
	buffer: "audio/piano-allonefile.wav",
	sample: 0,
	ratio: 1,
	amp: 0.1,
	dur: 50,
	wait: 500,
	pattern: 5,
	verb: 0,
	delay: 0,
	pos:0,
	freq: 220*(6/5)
	
}

var durations = [ 100, 300, 800];
var durIndex = 0;
var tremolos = [ 0, 1, 2, 3, 4, 5, 10, 15];
var tremIndex = 0;
var modIndex = 0;
var delayIndex = 0;


var someratios = [ (1/1), (9/8), (6/5), (4/3), (3/2), (8/5), (9/5) ];
var somenotes = ["A", "B", "C", "D", "E", "F", "G"];
var myoct = 1;
var octstring = "medium"


/* HANDLE KEYS */

function handleKeys(e) {

	console.log(e.which);
	
	if (!$("#chatinput").is(":focus") && !$("#nameinput").is(":focus")) {

		if (e.which==50) {
			if (envname=="ping") {
				envname = "verp";
				chosenenv = myenv_r;
			} else {
				envname = "ping";
				chosenenv = myenv;
			}
			$("#envinfo").html(envname);
		}
		if (e.which==49) {
			if (timbretype==4) {
				timbretype = 7;
				setTimbre();
				$("#timbreinfo").html("bright");
			} else {
				timbretype = 4;
				setTimbre();
				$("#timbreinfo").html("dull");
			}
		}
		if (e.which==51) {
			durIndex++;
			if (durIndex>=durations.length) {
				durIndex = 0;
			}
			daisyVals.dur = durations[durIndex];
			$("#durinfo").html(durations[durIndex]);
		}
		if (e.which==52) {
			if (myoct==1) {
				myoct = 0.5;
				octstring = "low";
			} else {
				myoct = 1;
				octstring = "medium";
			}
			$("#octinfo").html(octstring);
		}

		/*
		
		if (e.which==192) {
			//tremolo or AM rate
			tremIndex++;
			if (tremIndex>=tremolos.length) {
				tremIndex = 0;
			}
			tremolo.rate =  tremolos[tremIndex];
			$("#treminfo").html(tremolos[tremIndex]);
		} else if (e.which==16) {
			//duration 
			durIndex++;
			if (durIndex>=durations.length) {
				durIndex = 0;
			}
			daisyVals.dur = durations[durIndex];
			$("#durinfo").html(durations[durIndex]);
		} else if (e.which>47 && e.which<58) {
			// pattern length
			daisyVals.pattern = e.which-48;
			$("#pattinfo").html(e.which-48);
		} else if (e.which==18) {
			//delay rate
			delayIndex++;
			if (delayIndex>=10) {
				delayIndex = 0;
			}
			delayGain.gain.value = delayIndex/10;
		//	$("#delayinfo").html(delayIndex/10);
		}
		 */
		if (e.which>=65 && e.which <= 71) {
			
			daisyVals.freq = 220*someratios[(e.which-65)]*myoct;
		//	daisyVals.dur = (e.which-64)*30;
		
			$("#pitchinfo").html(somenotes[(e.which-65)]);
		//	daisyBloom(0);
		//	startPulse();
			if (e.which==67) {
				toDelay.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);
			} else {
				toDelay.gain.linearRampToValueAtTime(1, context.currentTime + 0.5);
			}



			console.log(e.which-64);
		
			
			//	daisyVals.wait = (e.which-64)*50;
			//	console.log('audio/piano/piano-0'+(e.which-65)+'.mp3');

		
			
		} else {
			
			switch(e.which) {
				case 39:
					if (target==null) {
						target = Users[0].name;
					}
					var tI = userNames.indexOf(target);
					tI = tI - 1;
					if (tI<0) {
						tI = Users.length-1;
					}
					var nextTarget = userNames[tI]; 
					selectUser(nextTarget);
					break;
				case 37:
					if (target==null) {
						target = Users[0].name;
					}
					var tI = userNames.indexOf(target);
					tI++;
					if (tI>Users.length-1) {
						tI = 0;
					}
					var nextTarget = userNames[tI]; 
					selectUser(nextTarget);
					break;
				case 16:
					//daisyVals.pos = Math.floor(Math.random()*100)+2;
					//delay.delayTime.value = Math.floor(Math.random()*10)/10+0.05;
					break;
				case 65:
				//	eraseSamplers();
					break;
			//	case 32:
			//		sendMySound();
			//		break;
				case 32:
					startPulse();
					break;
			}
		}
	}
}





/* Helpful funcs */

function dream(scaleNum) {
	var randNum = Math.floor(Math.random()*scaleNum);
	return randNum;
}

