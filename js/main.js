var FPS = 60;
var canvas = document.getElementById("game");
var state_EXPLORE = 0;
var state_CONVERSATION = 1;
var state_PAUSED = 2;
var gameState = state_EXPLORE;
var time = [0,0,1];
function time_keeper() {
	time[0]++;
	if (time[0]>=FPS) time[1]++,time[0]=0;
	if (time[1]>=60) time[2]++,time[1]=0;
};


var run = setInterval(function() {
	logic();

}, 1000/FPS);



function logic() {
	if (gameState == state_EXPLORE) logic_EXPLORE();
	if (gameState == state_CONVERSATION) logic_CONVERSATION();
	if (gameState == state_PAUSED) logic_PAUSED();


}

function logic_EXPLORE() {
	time_keeper();
	TIME_EVENTS(player, camera, AI_array);
	for (var i=0;i<AI_array.length;i++) AI_array[i].update(i);
	player.update(controls.states);
	camera.render_EXPLORE(player,mansion);
	

	

};

function logic_PAUSED() {
	camera.ctx.font = camera.width/12 + 'px Monaco';
	camera.ctx.fillStyle = "#ff0000";
	camera.ctx.fillText('PAUSE',camera.width/2-camera.width/6,camera.height/2);
};

function logic_CONVERSATION() {
	player.update(controls.states, camera.text_speed);
	
	camera.render_CONVERSATION();
}

function TIME_EVENTS(player, camera, AI_array) {
    if (time[2]==0) player.conversation_point = "greeting";
    if (time[2]==1) player.conversation_point = "introduce";
    if (time[2]==1 && time[1]>30) {
    	camera.darkness = true;
    	for (var i=0;i<AI_array.length;i++) {
    		AI_array[i].engaged = false;
    		if (AI_array[i].persona.genre == "MURDERER" && !AI_array[i].fleeing) AI_array[i].logic.time[time[2]] = "murder" 
    	}
    }
    if (time[2]==1 && time[1]>40) {
    	camera.darkness = false;
    	player.conversation_point = "blackout";
    	if (AI_array[AI_array.length-1].logic.time[time[2]] != "shout") {
    		for (var i=0;i<AI_array.length;i++) {
    			AI_array[i].logic.time[time[2]] = "pace_shout";
	    	}	
    	}
    	
    	
    };

    // ############## LIGHTNING HERE ################ //

	// if (time[0]>31 && time[0]<35 && !camera.darkness) {
	// 	if (Math.floor(Math.random()*8) == 0)camera.darkness=true;
		
	// }
	// else if (time[0]<31 || time[0]>35 && camera.darkness) {
	// 	camera.darkness=false;	
	// }

}

function Controls () {
	this.codes = {
		37: 'left',
		39: 'right',
        38: 'up',
        40: 'down'
	};
	this.states = {
        'left': false,
        'right': false,
        'up': false,
        'down': false
    };
    this.holding = false;
    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);

    document.addEventListener('touchstart', this.onTouch.bind(this,true), false);
    document.addEventListener('touchend', this.onTouch.bind(this,false), false);
};

Controls.prototype.onKey = function(val, e) {
    var state = this.codes[e.keyCode];
    if (typeof state === 'undefined') return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
};

Controls.prototype.onTouch = function(val, e) {
	var state;
	if (e.changedTouches[0].clientX < window.innerWidth*.25) {
		var state = 'left';
	}
	else if (e.changedTouches[0].clientX > window.innerWidth*.75) {
		var state = 'right';
	}
	else {
		var state = 'up';
	}
	
	this.states[state] = val;
	// e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
};




//############ RENDER ##############//

function Bitmap(src, width, height) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
}

function Map(length, floors, grid) {
	this.floors = floors;
	this.length = length;
	this.grid = grid;
	this.texture = [
		new Bitmap('./assets/wallpaper.png',1280,720),          // 0
		new Bitmap('./assets/right-bottom-stair.png',1280,720), // 1
		new Bitmap('./assets/right-top-stair.png',1280,720),    // 2
		new Bitmap('./assets/left-bottom-stair.png',1280,720),  // 3
		new Bitmap('./assets/left-top-stair.png',1280,720),     // 4
		new Bitmap('./assets/end-left-wall.png',1280,720),      // 5
		new Bitmap('./assets/end-right-wall.png',1280,720),     // 6
		new Bitmap('./assets/wallpaper.png',1280,720),          // 7
		];
	this.objects = [
		new Bitmap('./assets/table.png',1280,221)          // 0
	];
};


//############## PLAYER #################//

function Player (x,y,direction,talk) {
	this.x = x;
    this.y = y;
    this.direction = direction;
    this.texture = new Bitmap('./assets/walking-guy.png',2000,800);
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
    this.converse = false;
    this.hold = false;
    this.player_lock = false;
    this.talk = talk;
    this.reply_select = 0;
    this.chosen_reply = false;
    this.AI_focus = false;
    this.conversation_point = "greeting";
    this.walk_speed = .006;
};

Player.prototype.update = function(con, word_speed) {
	// ################# PLAYER CONTROLS #################### //
	// ################# PLAYER CONTROLS #################### //
	// ################# PLAYER CONTROLS #################### //
	// ################# PLAYER CONTROLS #################### //
	// ################# PLAYER CONTROLS #################### //
	// ################# PLAYER CONTROLS #################### //
	if (gameState == state_EXPLORE) {
		if (con.right) this.walk(this.walk_speed),this.direction=1;
	    if (con.left) this.walk(-this.walk_speed),this.direction=-1;
	    if (!con.left && !con.right) this.seg=0;
	    if (con.up) this.engage(), con.up=false;
	    if (!con.up) controls.holding = false;
	}
	if (camera.camera_lock && !this.player_lock) {
		this.player_lock = this.x;
	}
	if (!camera.camera_lock && this.player_lock) {
		this.player_lock = false;
	}
    if (gameState == state_CONVERSATION) {
    	if (con.up && camera.text_speed != 1 && !camera.continue) camera.text_speed=1, controls.holding = true;
	    if (!con.up) camera.text_speed=5, controls.holding = false;
	    if (con.up && camera.continue) this.reset(this.conversation_point), con.up=false, controls.holding = true;	
	    if (con.right && camera.select && !this.chosen_reply) this.chosen_reply=true, this.interact(this.conversation_point,1,this.reply_select);
		if (con.left && camera.select && !this.chosen_reply) this.chosen_reply=true, this.interact(this.conversation_point,1,this.reply_select);
    }
};

Player.prototype.walk = function(distance) {
	
	var pos = function(x,y,horizontal, vertical) {
		return mansion.grid[(Math.floor(x)+(1*horizontal))+((y+vertical)*mansion.length)];
	}

	if (this.player_lock) {
		if (canvas.width/2.5 + (canvas.width)*(this.x-this.player_lock) > 1 && canvas.width/2.5 + (canvas.width)*(this.x-this.player_lock)< (canvas.width)-(canvas.width/6)) {
			this.x+=distance;
			this.seg+=Math.abs(distance*20);
			if (this.seg >= 10) this.seg = 0;
			if (this.hold) this.hold=false;
		}
		else if (canvas.width/2.5 + (canvas.width)*(this.x-this.player_lock)<=1 && distance>0) {
			this.x+=distance;
		}
		else if (canvas.width/2.5 + (canvas.width)*(this.x-this.player_lock)>=canvas.width-(canvas.width/6) && distance<0) {
			this.x+=distance;
		}
	}
	else {
		if (this.x > 1.5 && this.x < (mansion.length+.5)) {
			this.x+=distance;
			this.seg+=Math.abs(distance*20);
			if (this.seg >= 10) this.seg = 0;
			if (this.hold) this.hold=false;
		}
		else if (this.x <= 1.5 && distance > 0) {
			this.x+=distance;
		}
		else if (this.x >= mansion.length-.1 && distance < 0) {
			this.x+=distance;	
		}

	}


	if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 1 && !this.hold) this.y = this.y-1, this.hold=true;
	if (this.x<1.5 && pos(this.x,this.y,0,0) == 3 && !this.hold) this.y = this.y-1, this.hold=true;

	if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 2 && !this.hold) this.y = this.y+1, this.hold=true;
	if (this.x<1.5 && pos(this.x,this.y,0,0) == 4 && !this.hold) this.y = this.y+1, this.hold=true;	
};

Player.prototype.engage = function() {
	for (var i=0;i<AI_array.length;i++) {
		if (!AI_array[i].engaged && AI_array[i].y==this.y && (AI_array[i].x-this.x)*this.direction<=.2 && (AI_array[i].x-this.x)*this.direction > 0) {
			this.seg=0;
			this.AI_focus = AI_array[i];
			this.AI_focus.direction = this.direction*-1;
			this.AI_focus.seg = 0;
			if (gameState != state_CONVERSATION) this.interact(this.conversation_point, 0);
		}
	}
}

Player.prototype.interact = function(whatConvo, point_of_convo, x_reply) {
	this.converse = (point_of_convo == 0) ? this.AI_focus.persona.conversation[whatConvo][0] : this.AI_focus.persona.conversation[whatConvo][1][x_reply]; // This should assign based on time dynamically
	camera.AI_talk = true;
	camera.dialogueBox = false;
    camera.words_counter = {
    	letter:0,
    	line:1,
    	word:1,
    	cursor:canvas.width/30
    };
    camera.text_speed_counter = 0;
    camera.text_speed = 5;
    camera.continue = false;

	if (gameState != state_CONVERSATION) gameState = state_CONVERSATION;		
}

Player.prototype.reset = function(whatConvo) {
	camera.AI_talk = false;
	// This is checking if there is a reply and if the replies havent been printed yet.
	if (this.talk[whatConvo] && !camera.select && !this.chosen_reply && !this.AI_focus.persona.conversation[whatConvo][2]) { //GREETING IS JUST A PLACEHOLDER. MAKE THIS FIND WHAT THE AI KEY WAS. 
		camera.dialogueBox = false;
	    camera.words_counter = {
	    	letter:0,
	    	line:1,
	    	word:1,
	    	cursor:canvas.width/30
	    };
	    camera.text_speed_counter = 0;
	    camera.text_speed = 5;
		camera.reply = this.talk[whatConvo]; // SAME HERE
		camera.select = this.reply_select;
	}
	// if there is a reply and the replies have already been printed.
	else if (this.talk[whatConvo] && camera.select && !this.chosen_reply) {//GREETING IS JUST A PLACEHOLDER. MAKE THIS FIND WHAT THE AI KEY WAS
		this.reply_select++;
		if (this.reply_select >= this.talk[whatConvo].length) this.reply_select = 0;
		camera.dialogueBox = false;
	    camera.words_counter = {
	    	letter:0,
	    	line:1,
	    	word:1,
	    	cursor:canvas.width/30
	    };
	    camera.text_speed_counter = 0;
	    camera.text_speed = 5;
		camera.reply = this.talk[whatConvo]; // SAME HERE
		camera.select = this.reply_select;
	}
	else if (!this.AI_focus.persona.conversation[whatConvo][2]) {
		this.AI_focus.react(whatConvo);
		controls.holding = false;
		gameState = state_EXPLORE;
	}
	else {
		controls.holding = false;
		gameState = state_EXPLORE;
		this.reply_select = 0;
	}
};

// ################ AI ################# //

function AI (x,y,direction,texture,persona,logic,dispositionTowardsPlayer) {
	this.x = x;
	this.x = x;
    this.y = y;
    this.direction = direction;
    this.texture = texture;
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
    this.persona = persona;
    this.logic = logic;
    this.dispositionTowardsPlayer = dispositionTowardsPlayer;
    this.closest_to_me=[];
    this.spoken_with_already = [];
    this.my_target=false;
    this.engaged = false;
    this.time_count = 0;
    this.speech_bubble = false;
    this.walking = true;
    this.alive = true;
    this.fleeing = false;
}

AI.prototype.walk = function(x_distance,UPorDOWN) {
	if (this.walking) {
		if (UPorDOWN) {
			if (UPorDOWN=="UP") var distance = (mansion.grid[(1+this.y)*mansion.length]==1) ? .005 : -.005;
			if (UPorDOWN=="DOWN") var distance = (mansion.grid[(1+this.y)*mansion.length]==1) ? -.005 : .005
		}
		else {
			var distance = x_distance;
		}
		this.direction = (distance<0) ? -1:1;
		var pos = function(x,y,horizontal, vertical) {
			return mansion.grid[(Math.floor(x)+(1*horizontal))+((y+vertical)*mansion.length)];
		}

		if (this.x > 1.5 && this.x < (mansion.length+.5)) {
			this.x+=distance;
			this.seg+=Math.abs(distance*20);
			if (this.seg >= 10) this.seg = 0;
		}
		else if (this.x <= 1.5 && distance > 0) {
			this.x+=distance;
		}
		else if (this.x >= mansion.length-.1 && distance < 0) {
			this.x+=distance;
		}
		if (UPorDOWN == "UP") {
			if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 1) this.y+=-1;
			if (this.x<1.5 && pos(this.x,this.y,0,0) == 3) this.y +=-1;	
		}
		else {
			if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 2) this.y+=1;
			if (this.x<1.5 && pos(this.x,this.y,0,0) == 4) this.y+=1;	
		}
	}
	else {
		this.seg = 0;
	}
}

AI.prototype.find_target = function(target) {
	if (!target) this.pace();


	if (this.y < target.y) this.walk(.005,"DOWN");
	if (this.y > target.y) this.walk(.005,"UP");
	if (this.y == target.y) {
		if (this.x<target.x-.1) {
			this.walk(.005)
		}
		else if (this.x>target.x+.1) {
			this.walk(-.005)
		}
		else {
			this.seg = 0;
			this.engaged = true;
		}
	};
};

AI.prototype.murder = function() {
	if (this.persona.genre == "MURDERER") {
		// find guest to murder
		

		if (!this.my_target) {
			for (var i = 0;i<AI_array.length;i++) {
				if (AI_array[i].persona.genre == "GUEST") return this.my_target = AI_array[i];
			}
			console.log(this.persona.full_name + " is finding a target!")
		};
		if (this.my_target.alive) console.log(this.persona.full_name + " is murdering " + this.my_target.persona.full_name), this.hunt(this.my_target); 
	}
	// rank AI based on proximity and murderability. 

	// make most murderable AI = this.my_target.
}

AI.prototype.catalyst = function(disposition) {
	// loop through all AIs and player

	// get this.personality

	// make choice of action based on personality and disposition towards other characters based on other character personas

}

AI.prototype.shout = function(array_position) {
	if ((time[1]/2)%AI_array.length==array_position) {
		this.speech_bubble = this.persona.conversation[player.conversation_point][0];
	}
	else {
		this.speech_bubble = false;
	}
}

AI.prototype.find_closest_AI = function() {
	for (var i=0;i<AI_array.length; i++) {
		// make sure AI isn't finding himself and make sure other AIs are on the same floor and they've never spoken
		if (AI_array[i] != this && AI_array[i].y==this.y && this.spoken_with_already.indexOf(AI_array[i]) == -1) {
			//check if is already in array
			if (this.closest_to_me.indexOf(AI_array[i]) == -1) {
				// if here, the AI is not in the array and needs to be added.
				// first check if there's anyone in the array, and if not, add the other AI
				if (!this.closest_to_me[0]) {
					this.closest_to_me.push(AI_array[i]);
				}
				// If the array is not empty, position the AI from closest to furthest away.
				else {
					// if the abs value of my location minus closest location is less than abs val of next AI
					if (Math.abs(this.x-this.closest_to_me[0].x)<=Math.abs(this.x - AI_array[i].x)) {
						this.closest_to_me.push(AI_array[i]);
					}
					else {
						this.closest_to_me.unshift(AI_array[i]);
					}
				}		
			}
			// if here, that means that the closest to me array has every possible AI
		}
		//if here, that means that the AI is by himself or has spoken to everyone.
	}
}

AI.prototype.make_closest_AI_target = function(social_visit) {
	// loop through all AI
	for (var i=0;i<AI_array.length; i++) {
		// make sure AI isn't finding himself
		if (AI_array[i] != this) {
			// make sure other AIs are on the same floor and they've never spoken
			if (AI_array[i].y==this.y && ((this.spoken_with_already.indexOf(AI_array[i]) == -1 && social_visit) || !social_visit)) {
				if (!this.my_target) {
					this.my_target = AI_array[i];
				}
				else {
					if (Math.abs(this.x - this.my_target.x)>(Math.abs(this.x - AI_array[i].x))+.2) this.my_target = AI_array[i];
				}
			}
			else {
				this.my_target = false;
			}
		}
		
	}
}

AI.prototype.approach_closest_AI = function(closestAI) {
	// approach if they are the closest and not talking
	if (closestAI.y!=this.y) {
		this.closest_to_me.splice(0,1);
		this.seg=0;
	}
	else if (Math.abs(this.x-closestAI.x) >.1 && !closestAI.engaged) {
		if (closestAI.x<this.x) {
			this.walk(-.005),this.direction=-1;
		}
		else {
			this.walk(.005),this.direction=1;
		}
	}
	// walk away slowly if they are the closest but they're talking
	else if (closestAI.engaged) {
		if (closestAI.x<this.x) {
			this.walk(.002),this.direction=1;
		}
		else {
			this.walk(-.002),this.direction=-1;
		}
	}
	else {
		if (this.x<closestAI.x) {this.direction=1;}
		else {this.direction=-1;};
		this.seg=0;
		this.my_target = closestAI;
	}
}

AI.prototype.socialize_dnu = function() {
	if (this.persona.full_name == "Cornelia Cornhowser") console.log("1");
	if (!this.engaged) this.find_closest_AI();
	if (!this.engaged && this.closest_to_me[0]) this.approach_closest_AI(this.closest_to_me[0]);
	if (this.my_target) this.speak(this.my_target), this.my_target.walking = false;
};

AI.prototype.socialize = function() {
	if (!this.engaged) this.make_closest_AI_target(true);
	if (this.my_target && !this.my_target.engaged && !this.engaged) this.find_target(this.my_target)
	if (this.engaged && !this.my_target.speech_bubble) this.my_target.walking = false, this.speak(this.my_target);
	
};

AI.prototype.no_witnesses = function(target) {
	// loop through array
	for (i=0;i<AI_array.length;i++) {
		// make sure that the current AI being checked is not the target
		if (AI_array[i] != this) {
			// Check if current AI being checked that is not the target is on the same floor
			if (AI_array[i].y == target.y) {
				// if current AI being checked is on the same floor, make sure that it's not nearby.
				if (AI_array[i].x > target.x+.7 || AI_array[i].x < target.x-.7) {
					//the current AI being checked is not nearby
				}
				else {
					return false;
				}
			}
		}
	}
	return true;
}

AI.prototype.murder_target = function(target) {
		// see if any other AIs are nearby
	if (camera.darkness == false) {
		if (this.no_witnesses == true) {
			// if the player is being murdered
			if (target == player && target.x < mansion.length-.5 && target.x > mansion.length-.5) camera.camera_lock = true;
			//MURDER
			console.log(target.full_name);
			if (this.x > target.x && target.x%1 > .45 && target.x%1 < .46) target.walk_speed = 0;
			if (this.x < target.x && target.x%1 > .55 && target.x%1 < .56) target.walk_speed = 0;
			target.alive = false;
		}
		else {
			camera.camera_lock = false;
			camera.darkness = false;
			target.walk_speed = player.walk_speed;
		}		
	}
	else {
		if (this.x > target.x && target.x%1 > .45 && target.x%1 < .46) target.walk_speed = 0;
		if (this.x < target.x && target.x%1 > .55 && target.x%1 < .56) target.walk_speed = 0;
		console.log(target.persona.full_name + " has been murdered by " + this.persona.full_name);
		target.alive = false;
		this.my_target = false;
		this.fleeing = true;
		this.logic.time[time[2]] = "pace";
		
		

	}
		
}

AI.prototype.hunt = function(target) {
	if (this.my_target.alive) {
		this.find_target(this.my_target);
		if (this.y == target.y && this.x > target.x-.1 && this.x < target.x+.1 && camera.viewHeight == 0) console.log("MURDER!"), this.murder_target(this.my_target);
	}
		
}

AI.prototype.stand = function() {
	// find out if this AI is standing on top of another AI
	for (i=0;i<AI_array.length;i++) {
		if (this.y == AI_array[i].y) {
			if (Math.floor(this.x*100) == Math.floor(AI_array[i].x*100)) {
				
			}
		}
	}

	// first get x locations of all AI on the same y floor

	// if this.x is greater than AI.x - canvas.width/6 or less than AI.x + canvas.width/6
	// it needs to move until it is not
}

AI.prototype.speak = function(conversation_partner) {
	conversation_partner.engaged = true;
	conversation_partner.seg=0;
	if(time[0]==0) this.time_count++;
	// whoever initiates talks first for two seconds
	if (this.time_count<=2) {
		this.speech_bubble = this.persona.conversation[player.conversation_point][0];
	}
	else if (this.time_count>2 && this.time_count<=4) {
		this.speech_bubble = false;
		conversation_partner.speech_bubble = conversation_partner.persona.conversation[player.conversation_point][0];
	}
	else {
		// ends above if else
		conversation_partner.speech_bubble = false;
		// allows conversation partner to continue whatever they were doing
		conversation_partner.walking = true;
		// resets socialize
		conversation_partner.my_target=false;
		this.my_target = false;
		this.engaged = false;
		conversation_partner.engaged = false;
		this.spoken_with_already.push(conversation_partner);
		conversation_partner.spoken_with_already.push(this);
		this.closest_to_me.splice(0,1);
		conversation_partner.closest_to_me.splice(0,1);
		this.time_count = 0;
		conversation_partner.time_count = 0;
	}
}

// Take player.reply_select after player.chosen_reply = true and perform an action with it.
AI.prototype.react = function(whatConvo) {
	console.log(this.persona.full_name + " reacts with " + player.reply_select);
	this.persona.conversation[whatConvo][2] = true;
	this.dispositionTowardsPlayer+=player.reply_select;
	player.chosen_reply=false;
	player.reply_select = 0;
	camera.select = 0;
};

AI.prototype.go_to_location = function(dest_x,dest_y,endFacing) {
	// find self position
		// this.x, this.y
	// then find desired position
		// destination.x destination.y
	// if not on the same floor, find if desired position is above or below self position
	if (this.y != dest_y) {
		if (this.y > dest_y) {
			this.walk(.005,"UP");
		}
		else {
			this.walk(.005,"DOWN");
		}
	}
	// if on the same floor, find if desired position is left or right of self position
	if (this.y == dest_y) {
		if (Math.floor(this.x*100) == Math.floor(dest_x*100)) {
			this.seg = 0;
			if(endFacing) this.direction = endFacing;
		}
		else if (this.x > dest_x) {
			this.walk(-.005);
			this.direction=-1;
		}
		else if (this.x < dest_x) {
			this.walk(.005);
			this.direction=1;
		}
	}
	// ensure AI does not stand on top of other AI
}

AI.prototype.pace = function() {
	if (!this.walking) this.walking;
	if (time[1]%2==0) {
		this.walk(.003),this.direction=1;
	}
	else {
		this.walk(-.003),this.direction=-1;
	}
}

AI.prototype.update = function(pos_in_array) {

	if (!this.alive) console.log(this.persona.full_name + " is dead!"), AI_array.splice(pos_in_array,1);
	
	if (time[0]==0) this.speech_bubble = false; // Reset function to make sure previous time activities don't overlap to next minute.
	if (this.logic.time[time[2]] == "shout") this.shout(pos_in_array);
	if (this.logic.time[time[2]] == "murder") this.murder();

	if (this.logic.time[time[2]] == "socialize") this.socialize();
	if (this.logic.time[time[2]] == "pace") this.pace();
	if (this.logic.time[time[2]] == "find player") this.my_target = player,this.find_target(this.my_target);
	if (this.logic.time[time[2]] == "find target") this.find_target(this.my_target);
	if (this.logic.time[time[2]] == "murder player") this.my_target = player,this.hunt(this.my_target);
	if (this.logic.time[time[2]] == "pace_shout") this.pace(), this.shout(pos_in_array);

	// to add - get map position number so specific coordinates don't have to be entered for specific locations
	if (this.logic.time[time[2]] == "dinner table") {
		if (Math.floor(this.x*100) == (3+(pos_in_array/10))*100 && this.y == 2) {
			if (pos_in_array < 4) {this.direction = 1;this.seg=0;}
			else {this.direction = -1;this.seg=0;};
			this.shout(pos_in_array);
		}
		else {
			this.go_to_location(3+(pos_in_array/10),2);
		}
	}
	if (this.logic.time[time[2]] == "front door") this.go_to_location(3+(pos_in_array/10),3);
};




// ################ CAMERA ################## //

function Camera(ctx) {
	this.ctx = canvas.getContext("2d");
	this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = canvas.width/(16/9);
    this.viewHeight = 0; // controls height of scene in viewport
    this.rgb = [180,180,255];
    this.camera_lock = false;
    this.darkness = false;
    //
    // Dialogue variables
    //
    this.dialogueBox = false;
    this.words_counter = {
    	letter:0,
    	line:1,
    	word:1,
    	cursor:canvas.width/30
    };
    this.text_speed_counter = 0;
    this.text_speed = 5;
    this.continue = false;
    this.AI_talk = false
    this.reply = false;
    this.select = 0;
}

// ################ CAMERA CONVERSATION ############### //
// ################ CAMERA CONVERSATION ############### //
// ################ CAMERA CONVERSATION ############### //
// ################ CAMERA CONVERSATION ############### //
// ################ CAMERA CONVERSATION ############### //
// ################ CAMERA CONVERSATION ############### //


Camera.prototype.render_CONVERSATION = function() {
	if (!this.dialogueBox) this.drawDialogueBox(), this.dialogueBox=true;
	if (this.AI_talk) this.drawLetters(player.converse.split(''),time);
	if (this.reply) {this.drawPlayerTalk(this.reply), this.dialogueBox=true};
	
}

Camera.prototype.drawDialogueBox = function() {
	this.ctx.save()
	this.ctx.fillStyle = "#000000";
	this.ctx.strokeStyle = "#ffffff";
	this.ctx.rect(2,2,this.width-4,this.height/2.8);
	this.ctx.fill();
	this.ctx.stroke();
	this.ctx.restore();
}

Camera.prototype.drawLetters = function(dialogue, time) {
	this.text_speed_counter++;
	this.ctx.font = this.width/22 + 'px Monaco';
	this.ctx.fillStyle = "#ffffff";
	function countAhead(d,w) {
		var i=1;
		var y = w.cursor;
		while (d[i+w.letter] != " " && d[i+w.letter]) {
			y=y+canvas.width/30;
			if (y > canvas.width-(canvas.width/10)) return true;
			i++;
		};
		return false;
	};

	if (this.words_counter.letter<dialogue.length && this.text_speed_counter >= this.text_speed) {
		this.ctx.fillText(dialogue[this.words_counter.letter],this.words_counter.cursor,(this.words_counter.line*this.height/9))
		this.words_counter.letter++;
		this.text_speed_counter = 0;
		this.words_counter.word++;
		if (dialogue[this.words_counter.letter] == " ") {
			this.words_counter.word=0;
			if (countAhead(dialogue,this.words_counter)) {
				this.words_counter.letter=this.words_counter.letter+1
				this.words_counter.cursor=0;
				this.words_counter.line++
			};
		};
		this.words_counter.cursor+=this.width/30;
	}
	else if (this.words_counter.letter==dialogue.length) {
		if (!controls.holding) {
			this.continue = true;
		}
	}
};

Camera.prototype.drawPlayerTalk = function(reply) {
	this.ctx.font = this.width/22 + 'px Monaco';
	if (reply[0]) {
		this.ctx.fillStyle = (this.select == 0) ? "#ffffaa" : "#666666";
		this.ctx.fillText(reply[0],canvas.width/30,1*this.height/9);
	}
	if (reply[1]) {
		this.ctx.fillStyle = (this.select == 1) ? "#ffffaa" : "#666666";
		this.ctx.fillText(reply[1],canvas.width/30,2*this.height/9);
	}
	if (reply[2]) {
		this.ctx.fillStyle = (this.select == 2) ? "#ffffaa" : "#666666";
		this.ctx.fillText(reply[2],canvas.width/30,2*this.height/9);
	}
	this.reply = false; // to prevent the word from repeating	
	this.select = true;	
}

// ################ CAMERA EXPLORE ############### //
// ################ CAMERA EXPLORE ############### //
// ################ CAMERA EXPLORE ############### //
// ################ CAMERA EXPLORE ############### //
// ################ CAMERA EXPLORE ############### //
// ################ CAMERA EXPLORE ############### //

Camera.prototype.render_EXPLORE = function(player, map) { 
	if (this.darkness) this.ctx.clearRect(0,0,canvas.width,canvas.height);

	if (!this.darkness) this.drawBackground(player.y,time);


	if (!this.camera_lock) {
		this.drawRoom(player.x,player.y, map.grid);
	    this.drawAI(player.x,player.y, AI_array, map.grid);
	    this.drawPlayer(player.x,player.direction,player.sprite,Math.floor(player.seg),map.grid);
	    this.drawFrontObjects(player.x,player.y,map.grid);
	}
	else {
		this.drawRoom(player.player_lock,player.y, map.grid);
	    this.drawAI(player.player_lock,player.y, AI_array, map.grid);
	    this.drawPlayer(player.player_lock,player.direction,player.sprite,Math.floor(player.seg),map.grid);
	    this.drawFrontObjects(player.x,player.y,map.grid);
	}

	if (this.darkness) this.drawDarkness();
};

Camera.prototype.drawPlayer = function (x,direction,sprite,seg,location) {
	var pos = function(horizontal, vertical) {
		return location[(Math.floor(x)+(1*horizontal))+((y+vertical)*mansion.length)];
	}
	var decimal = x%1;
	var texture = player.texture;
	if (!this.camera_lock) {
		if (direction==1) {
			this.ctx.drawImage(texture.image,sprite[seg],0,200,400,canvas.width/2.5,canvas.height/2.3,canvas.width/6,canvas.height/1.9)
		}
		else {
			this.ctx.drawImage(texture.image,sprite[seg],400,200,400,canvas.width/2.5,canvas.height/2.3,canvas.width/6,canvas.height/1.9)	
		}
	}
	else {
		var _x = function() {
			var temp = canvas.width/2.5 + (canvas.width)*(player.x - x);
			if (temp<0) {
				return 0
			}
			else if (temp > canvas.width){
				return canvas.width
			}
			else {
				return temp
			}
		}
		if (direction==1) {
			this.ctx.drawImage(texture.image,sprite[seg],0,200,400,_x(),canvas.height/2.3,canvas.width/6,canvas.height/1.9)
		}
		else {
			this.ctx.drawImage(texture.image,sprite[seg],400,200,400,_x(),canvas.height/2.3,canvas.width/6,canvas.height/1.9)	
		}
	}
		
};

Camera.prototype.drawDarkness = function() {
	this.ctx.save();
	this.ctx.globalCompositeOperation = 'source-atop';
	this.ctx.fillStyle="rgba(0,0,0,1)";
	this.ctx.fillRect(0,0,canvas.width,canvas.height);
	this.ctx.restore();
}

Camera.prototype.drawAI = function (x,y,array,location) {
	var pos = function(horizontal, vertical) {
		return location[(Math.floor(array[i].x)+(1*horizontal))+((array[i].y+vertical)*mansion.length)];
	};
	for (var i=0;i<array.length;i++) {
		if (array[i].x < x+1 && array[i].x > x-1 && array[i].y <= y+1 && array[i].y >= y-1) {
			var texture = array[i].texture;
			var direction = (array[i].direction == 1) ? 0 : 400;
			var AI_height = function(vAI) {
				var ch = 0;
				if (vAI.y==y-1) ch = -canvas.height;
				if (vAI.y==y+1) ch = canvas.height;
				if (vAI.y==y) ch = 0;
				if (pos(0,0)!=1 && pos(0,0)!=2 && pos(0,0)!=3 && pos(0,0)!=4) return 0+ch;		
				var negpos = 1;
				var hundred = 0; // makes character ascend but also lowers their starting point
				if (pos(0,0)==1 || pos(0,0)==3) negpos = -1;
				if (pos(0,0)==3 || pos(0,0)==4) hundred = -100
				return ((canvas.height*((Math.abs(hundred + vAI.x))%1))*negpos) + ch;
			}			
			this.ctx.drawImage(texture.image,array[i].sprite[Math.floor(array[i].seg)],direction,200,400,(canvas.width/2.5)+((array[i].x-x)*(canvas.width)),canvas.height/2.3+this.viewHeight+AI_height(array[i]),canvas.width/6,canvas.height/1.9);
			if (array[i].speech_bubble && array[i].y == player.y) this.speech_bubble((canvas.width/2.5)+((array[i].x-x)*(canvas.width)),array[i].speech_bubble);
		};
	};
};

Camera.prototype.drawFrontObjects = function (x,y,location) {
	var pos = function(horizontal, vertical) {
		return location[(Math.floor(player.x)+(1*horizontal))+((player.y+vertical)*mansion.length)];
	};
	// table
	if (pos(0,0)==7 || pos(-1,0)==7 || pos(1,0)==7) {
		var object = mansion.objects[0];
		this.ctx.drawImage(object.image,0,0,object.width,object.height,(canvas.width/2.5)+((3-x)*(canvas.width)),(canvas.height-canvas.height/4)+this.viewHeight,canvas.width,canvas.height/4);	
	}
	

};

Camera.prototype.speech_bubble = function(x,speech) {
	this.ctx.save();
	this.ctx.textAlign = "center"
	this.ctx.font = this.width/25 + 'px Monaco';
	this.ctx.lineWidth = 4;
	this.ctx.strokeStyle = "000000"
	this.ctx.strokeText(speech,x,canvas.height/(3))
	this.ctx.fillStyle = "#ffffff"
	this.ctx.fillText(speech,x,canvas.height/(3))
	this.ctx.restore();

	// this.ctx.moveTo(x,canvas.height/3+10)
	// this.ctx.lineTo(x,(canvas.height/3)+10)
	// this.ctx.stroke();

}

Camera.prototype.drawRoom = function(x,y,location) {	
	var texture = mansion.texture;
	var pos = function(horizontal, vertical) {
		return location[(Math.floor(x)+(1*horizontal))+((y+vertical)*mansion.length)];
	}
	var decimal = x%1;
	var starting_point = canvas.width/2;
	var leftImagePosition = (starting_point-canvas.width)-(canvas.width*decimal);
	var rightImagePosition = (starting_point+canvas.width)-(canvas.width*decimal);
	var centerImagePosition = starting_point-(canvas.width*decimal);

	if (x>=mansion.length && (pos(0,0) == 1 || pos(1,0) == 1)) this.viewHeight = (x-mansion.length)*(this.height);
	if (x>=mansion.length && (pos(0,0) == 2 || pos(1,0) == 2)) this.viewHeight = -(x-mansion.length)*(this.height);
	if (x<=2 && (pos(0,0) == 3 || pos(-1,0) == 3)) this.viewHeight = -(x-2)*(this.height);
	if (x<=2 && (pos(0,0) == 4 || pos(-1,0) == 4)) this.viewHeight = (x-2)*(this.height);
	if (x<mansion.length && x>2 && this.viewHeight !=0) this.viewHeight = 0;

	// Draw Left
	if (texture[pos(-1,0)]) this.ctx.drawImage(texture[pos(-1,0)].image,0,0,texture[pos(-1,0)].width,texture[pos(-1,0)].height,leftImagePosition,0+this.viewHeight,this.width,this.height);
	// Draw Center
	if (texture[pos(0,0)]) this.ctx.drawImage(texture[pos(0,0)].image,0,0,texture[pos(0,0)].width,texture[pos(0,0)].height,centerImagePosition,0+this.viewHeight,this.width,this.height);
	// Draw Right
	if (texture[pos(1,0)]) this.ctx.drawImage(texture[pos(1,0)].image,0,0,texture[pos(1,0)].width,texture[pos(1,0)].height,rightImagePosition,0+this.viewHeight,this.width,this.height);

	// Draw Top Left
	if (texture[pos(-1,-1)]) this.ctx.drawImage(texture[pos(-1,-1)].image,0,0,texture[pos(-1,-1)].width,texture[pos(-1,-1)].height,leftImagePosition,-this.height+this.viewHeight,this.width,this.height);
	// Draw Top Center
	if (texture[pos(0,-1)]) this.ctx.drawImage(texture[pos(0,-1)].image,0,0,texture[pos(0,-1)].width,texture[pos(0,-1)].height,centerImagePosition,-this.height+this.viewHeight,this.width,this.height);
	// Draw Top Right
	if (texture[pos(1,-1)]) this.ctx.drawImage(texture[pos(1,-1)].image,0,0,texture[pos(1,-1)].width,texture[pos(1,-1)].height,rightImagePosition,-this.height+this.viewHeight,this.width,this.height);

	// Draw Bottom Left
	if (texture[pos(-1, 1)]) this.ctx.drawImage(texture[pos(-1, 1)].image,0,0,texture[pos(-1, 1)].width,texture[pos(-1, 1)].height,leftImagePosition,this.height+this.viewHeight,this.width,this.height);
	// Draw Bottom Center
	if (texture[pos(0, 1)]) this.ctx.drawImage(texture[pos(0, 1)].image,0,0,texture[pos(0, 1)].width,texture[pos(0, 1)].height,centerImagePosition,this.height+this.viewHeight,this.width,this.height);
	// Draw Bottom Right
	if (texture[pos(1, 1)]) this.ctx.drawImage(texture[pos(1, 1)].image,0,0,texture[pos(1, 1)].width,texture[pos(1, 1)].height,rightImagePosition,this.height+this.viewHeight,this.width,this.height);

};

// var rgb = [180,180,255];
Camera.prototype.drawBackground = function() {
	if (time[2]<2 && time[0]==0) {
		this.rgb[1]-=1;
		this.rgb[2]-=1;
		
	}
	else if (time[2]<3 && time[0]==0) {
		this.rgb[0]-=3;
		this.rgb[1]-=1;
		this.rgb[2]-=2;
	}

	// Sky
	this.ctx.fillStyle = "rgba("+this.rgb[0]+","+this.rgb[1]+","+this.rgb[2]+",1)";
	this.ctx.fillRect(0,0,this.width,this.height);

	// Sun / Moon
	if (time[2]<3) {
		this.ctx.fillStyle = "rgba(255,255,200,1)";
		this.ctx.fillRect(this.width/2,((time[2]*60)+time[1])*this.height/180,this.width/10,this.width/10)	
	}
	else if (time[2]<5) {
		this.ctx.fillStyle = "rgba(230,230,230,1)";
		this.ctx.fillRect(this.width/2,this.height/5,this.width/10,this.width/10)
	}

	
	


	// Ground
	this.ctx.fillStyle = "rgba(100,200,100,1)";
	this.ctx.fillRect(0,this.height/1.7,this.width,this.height);

	
};





