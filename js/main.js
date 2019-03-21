var FPS = 60;
var canvas = document.getElementById("game");
var state_EXPLORE = 0;
var state_CONVERSATION = 1;
var state_PAUSED = 2;
var state_GAMEOVER = 3;
var gameState = state_EXPLORE;
var time = [0,0,0];
function time_keeper() {
	time[0]++;
	if (time[0]>=FPS) time[1]++,time[0]=0;
	if (time[1]>=60) time[2]++,time[1]=0;
};
var counter = 0;
var go; // this is temporary for dev purposes. Gamer will use pause to pause game. 


// var run = setInterval(function() {
// 	logic();

// }, 1000/FPS);



function init() {
	if (gameState == state_EXPLORE) logic_EXPLORE();
	if (gameState == state_CONVERSATION) logic_CONVERSATION();
	if (gameState == state_PAUSED) logic_PAUSED();
	if (gameState == state_GAMEOVER) logic_GAMEOVER();

	show_characters_logic();

	go = window.setTimeout(init, 1000/FPS); // this does not need variable attached. Go is strictly for dev purposes.

}

function logic_EXPLORE() {
	time_keeper();
	TIME_EVENTS(player, camera, AI_array);
	for (var i=0;i<AI_array.length;i++) AI_array[i].update(AI_array[i].logic, i);
	player.update(controls.states);
	camera.render_EXPLORE(player,mansion);

};

function logic_PAUSED() {
	camera.ctx.font = camera.width/12 + 'px Monaco';
	camera.ctx.fillStyle = "#ff0000";
	camera.ctx.fillText('PAUSE',camera.width/2-camera.width/6,camera.height/2);
	FPS = 1;
};

function logic_CONVERSATION() {
	player.update(controls.states, camera.text_speed);
	
	camera.render_CONVERSATION();
};

function logic_GAMEOVER() {
	if (FPS != 10) FPS--;
	camera.ctx.globalCompositeOperation = 'source-over';
	camera.ctx.save();
	
	camera.ctx.fillStyle = "rgba(0,0,0,.05)"
	camera.ctx.fillRect(0,0,camera.width,camera.height);
	camera.ctx.restore();
	camera.ctx.save();
	camera.ctx.font = camera.width/12 + 'px Monaco';
	camera.ctx.textAlign = "center"
	camera.ctx.fillStyle = "rgba(255,150,150,.05)"
	camera.ctx.fillText('GAME OVER',camera.width/2,camera.height/2);
	camera.ctx.restore();
	
}

function TIME_EVENTS(player, camera, AI_array) {
    if (time[2]==1 && time[1]==30 && time[0]==0) {
    	camera.darkness = true;
    	player.being_spoken_to = false;
		player.AI_focus = false;
    };
    if (time[2]==1 && time[1]==40) {
    	camera.darkness = false;
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
    this.texture = new Bitmap('./assets/player-char.png',2000,800);
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
    this.converse = false;
    this.hold = false;
    this.player_lock = false;
    this.talk = talk;
    this.reply_select = 0;
    this.chosen_reply = false;
    this.AI_focus = false;
    this.time_conversation = "greeting";
    this.conversation_point = "greeting";
    this.walk_speed = .006;
    this.engaged_by_AI = false;
    this.alive = true;
};

Player.prototype.update = function(con, word_speed) {
	if (!this.alive) gameState = state_GAMEOVER;

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
			this.seg+=Math.abs(distance*25);
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
			this.seg+=Math.abs(distance*25);
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
		if (!AI_array[i].engaged && AI_array[i].y==this.y && (AI_array[i].x-this.x)*this.direction<=.1 && (AI_array[i].x-this.x)*this.direction > .05) {
			this.seg=0;
			this.AI_focus = AI_array[i];
			this.AI_focus.direction = this.direction*-1;
			this.AI_focus.seg = 0;
			if (gameState != state_CONVERSATION) this.interact(this.conversation_point, 0);
		}
		else if (AI_array[i].engaged && AI_array[i].my_target == this) {
			this.AI_focus = AI_array[i];
			this.AI_focus.speech_bubble = false;
			this.AI_focus.direction = this.direction*-1;
			this.AI_focus.seg = 0;
			// reset for after convo exits back to explore mode
			this.AI_focus.logic.act = "think";
			this.AI_focus.my_target = false;
			this.engaged_by_AI = false;
			this.AI_focus.spoken_with_already.push(this);
			// change player's conversation point to AI's
			this.conversation_point = this.AI_focus.persona.conversation.topic;
			// move to interact
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
	if (this.talk[whatConvo] && !camera.select && !this.chosen_reply && !this.AI_focus.persona.conversation[whatConvo][2]) {
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
	else if (this.talk[whatConvo] && camera.select && !this.chosen_reply) {
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
		camera.dialogueBox = false;
		if (this.conversation_point != this.time_conversation) this.conversation_point = this.time_conversation;
		gameState = state_EXPLORE;
	}
	else {
		controls.holding = false;
		camera.dialogueBox = false;
		if (this.conversation_point != this.time_conversation) this.conversation_point = this.time_conversation;
		this.reply_select = 0;
		gameState = state_EXPLORE;
	}
};

// ################ AI ################# //
// ################ AI ################# //
// ################ AI ################# //
// ################ AI ################# //
// ################ AI ################# //
// ################ AI ################# //
// ################ AI ################# //

function AI (x,y,direction,texture,persona,logic,suspicion) {
	this.x = x;
    this.y = y;
    this.direction = direction;
    this.texture = texture;
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
    this.persona = persona;
    this.logic = logic;
    this.suspicion = suspicion;
    this.spoken_with_already = [];
    this.my_target=false; // who is this person targeting
    this.engaged = false; // in position to interact with someone
    this.time_count = 0;
    this.speech_bubble = false;
    this.alive = true;
    this.fleeing = false;
    this.random = Math.floor(Math.random()*10);
    this.moveSeg = false; //if true because actioning, go to second sprite row
}

// ######### PHYSICAL ACTIONS ##############

AI.prototype.walk = function(x_distance,UPorDOWN) {
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
		this.seg+=Math.abs(distance*30);
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

AI.prototype.fall = function() {
	this.moveSeg = true;
	this.sprite = [0,800];
	if(time[0]==0) this.seg++;
	if(this.seg > 1) this.alive = false;
	
}


// ############ ACTIONS ###############

AI.prototype.approach_target = function() {
	// cinematically freeze camera
	// if (this.my_target == player && Math.abs(this.x-this.my_target.x)%1<.3 && !camera.camera_lock && this.y == player.y) camera.camera_lock = true, player.walk_speed = 0;
	if (this.y < this.my_target.y) this.walk(.005,"DOWN");
	if (this.y > this.my_target.y) this.walk(.005,"UP");
	if (this.y == this.my_target.y) {
		if (this.x<this.my_target.x-.1) {
			if (this.engaged) this.engaged = false;
			this.walk(.005)
		}
		else if (this.x>this.my_target.x+.1) {
			if (this.engaged) this.engaged = false;
			this.walk(-.005)
		}
		else if (this.x>=this.my_target.x && this.x<this.my_target.x+.05) {
			if (this.engaged) this.engaged = false;
			this.walk(.005)
		}
		else if (this.x<this.my_target.x && this.x>this.my_target.x-.05) {
			if (this.engaged) this.engaged = false;
			this.walk(-.005)
		}
		else {
			if (this.x<this.my_target.x) this.direction = 1;
			if (this.x>this.my_target.x) this.direction = -1;
			this.seg = 0;
			this.engaged = true;
		};
	};
};


AI.prototype.shout = function(array_position) {
	if ((time[1]/2)%AI_array.length==array_position) this.speech_bubble = this.persona.conversation[this.persona.conversation.topic][0];
	else this.speech_bubble = false;
};

AI.prototype.target_closest = function() {
	// loop through all AI
	for (var i=0;i<everyone_array.length; i++) {
		// make sure AI isn't finding himself and make sure other AIs are on the same floor and they've never spoken
		if (everyone_array[i] != this && everyone_array[i].y==this.y && ((this.spoken_with_already.indexOf(everyone_array[i]) == -1 && this.logic.purpose == "socialize") || this.logic.purpose != "socialize")) {
			if (!this.my_target) {
				return this.my_target = everyone_array[i];
			}
			else if (Math.abs(this.x - this.my_target.x)>(Math.abs(this.x - everyone_array[i].x))+.2) {
				return this.my_target = everyone_array[i];
			}
		}
	}
	if (!this.my_target) {
		for (var i=0;i<everyone_array.length; i++) {
			if (everyone_array[i] != this && (everyone_array[i].y==this.y+1 || everyone_array[i].y==this.y-1) && ((this.spoken_with_already.indexOf(everyone_array[i]) == -1 && this.logic.purpose == "socialize") || this.logic.purpose != "socialize")) {
				if (!this.my_target) {
					return this.my_target = everyone_array[i];
				}
				else if (this.my_target.y != this.y && Math.abs(this.x - this.my_target.x)>(Math.abs(this.x - everyone_array[i].x))+.2) {
					return this.my_target = everyone_array[i];
				}
			}
			else {
				this.logic.act = "nothing";
				this.logic.purpose = "think";
			}
		}
	}
};

AI.prototype.target_suspicion = function() {
	if (this.suspicion < 2) {
		for (var i = 0;i<AI_array.length;i++) {
			if (AI_array[i].persona.genre == "GUEST") return this.my_target = AI_array[i];
		}
	}
	else {
		let target_with_highest_suspicion;
		for (var i = 0;i<AI_array.length;i++) {
			if (!target_with_highest_suspicion) {
				target_with_highest_suspicion = AI_array[i];
			}
			else if (AI_array[i].suspicion > target_with_highest_suspicion.suspicion) {
				target_with_highest_suspicion = AI_array[i];
			}
		}
		if (target_with_highest_suspicion == this) {
			return this.my_target = player;
		}
		else {
			if (target_with_highest_suspicion.persona.genre != "GUEST") {
				for (var i = 0;i<AI_array.length;i++) {
					return this.my_target = AI_array[i];
				}
			}
			else {
				return this.my_target = target_with_highest_suspicion;	
			}
		}
	};
};


AI.prototype.no_witnesses = function(target) {
	if (camera.darkness) return true;
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
};

AI.prototype.kill_2 = function() {
	var target = this.my_target;
		// see if any other AIs are nearby
	if (camera.darkness == false) {
		if (this.no_witnesses == true) {
			// if the player is being murdered
			if (target == player && Math.abs(this.x-target.x)%1<.3 && !camera.camera_lock) camera.camera_lock = true, player.walk_speed = 0;
			//MURDER
			target.alive = false;
			this.fleeing = true;
			this.logic.purpose = "think";
		}
		else {
			target.logic.purpose = "die";
			camera.camera_lock = false;
			camera.darkness = false;
			target.walk_speed = player.walk_speed;
			this.logic.purpose = "think";
		}		
	}
	else {
		if (target == player && Math.abs(this.x-target.x)%1<.3 && !camera.camera_lock) camera.camera_lock = true, player.walk_speed = 0;
		target.alive = false;
		this.my_target = false;
		this.fleeing = true;
		this.logic.purpose = "think";
	}
}

AI.prototype.kill = function() {
	this.my_target.logic.purpose = "die";
	if (camera.camera_lock) camera.camera_lock = false;
	if (camera.darkness) camera.darkness = false;
	this.fleeing = true;
	this.logic.purpose = "think";
};

// AI.prototype.hunt = function() {
// 	if (this.my_target.alive) {
// 		this.approach_target();
// 	}	
// };

AI.prototype.nothing = function() {
	// find out if this AI is standing on top of another AI
	this.time_count = 0;
	this.seg = 0;
	this.speech_bubble = false;
	this.engaged = false;
	this.my_target = false;
	// for (i=0;i<AI_array.length;i++) {
	// 	if (this.y == AI_array[i].y) {
	// 		if (Math.floor(this.x*100) == Math.floor(AI_array[i].x*100)) {
				
	// 		}
	// 	}
	// }

	// first get x locations of all AI on the same y floor

	// if this.x is greater than AI.x - canvas.width/6 or less than AI.x + canvas.width/6
	// it needs to move until it is not
};

AI.prototype.being_spoken_to = function() {
	if(time[0]==0) this.time_count++;
	this.seg = 0;
	if (this.time_count <=2) {

	}
	else if (this.time_count>2 && this.time_count<=4) {
		if (this.my_target) this.speech_bubble = this.persona.conversation[this.my_target.persona.conversation.topic][0];
	}
	else if (this.time_count > 4) {

		if (this.my_target) if (this.my_target.persona.genre != "GUEST") this.suspicion += 1;
		if (this.persona.conversation.topic == this.my_target.persona.conversation.topic) this.spoken_with_already.push(this.my_target);
		this.engaged = false;
		this.my_target = false;
		this.logic.act = "nothing";
		this.logic.purpose = "think";

	}
};


// Need to make player conversation_point switch temporarily to AI's when player is engaged by AI.
AI.prototype.speak = function() {
	if (!this.my_target.alive) {
		this.my_target = false;
	}
	else {
		if (this.my_target!=player && this.my_target.my_target != this) this.my_target.my_target = this;
		if (this.my_target!=player && this.my_target.logic.act != "being_spoken_to" && this.time_count == 0) this.my_target.time_count = 0, this.my_target.logic.act = "being_spoken_to";
		if (this.my_target==player && Math.abs(this.x-player.x)>.1) this.my_target.engaged_by_AI = false;
		if (this.x<this.my_target.x) this.my_target.direction = -1;
		if (this.x>this.my_target.x) this.my_target.direction = 1;
		

		if(time[0]==0) this.time_count++;
		// whoever initiates talks first for two seconds
		if (this.time_count<=2) {
			if(!this.speech_bubble) this.speech_bubble = this.persona.conversation[this.persona.conversation.topic][0];
		}
		else if (this.time_count>2 && this.time_count<=4) {
			this.speech_bubble = false;
		}
		else {
			if (this.my_target==player) this.my_target.engaged_by_AI = false;
			// resets socialize
			this.spoken_with_already.push(this.my_target);
			
			if (this.my_target != player && this.my_target.persona.genre != "GUEST") this.suspicion += 1;
			this.engaged = false;
			this.my_target = false;
			this.logic.act = "nothing";
			this.logic.purpose = "think";

		}
		if (this.my_target == player && player.AI_focus == this) this.speech_bubble = false;
	}
	
};

// Take player.reply_select after player.chosen_reply = true and perform an action with it.
AI.prototype.react = function(whatConvo) {
	console.log(this.persona.full_name + " reacts with " + player.reply_select);
	this.persona.conversation[whatConvo][2] = true;
	this.suspicion+=player.reply_select;
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

AI.prototype.what_is_nearby = function() {
	console.log("nearby") // add all items here too.
}

AI.prototype.pace = function() {
	if ((time[1]+this.random)%6==0) {
		this.walk(.003);
	}
	else if ((time[1]+this.random)%10==0 || (time[1]+this.random)%11==0) {
		this.walk(-.003);
	}
	else {
		this.seg = 0;
	}
};

AI.prototype.waiting_to_talk = function() {
	if (this.my_target.x < this.x) this.walk(.003),direction = 1;
	if (this.my_target.x > this.x) this.walk(-.003),direction = -1;
};

AI.prototype.available_conversation_partners = function() {
	// this function takes up a decent amount of memory. Is there a more memory-efficient way to pull this off?
	// Maybe run this once after leaving a conversation.
	for (var i=0;i<everyone_array.length;i++) {
		if (everyone_array[i] != this && this.spoken_with_already.indexOf(everyone_array[i]) == -1) return true;
	}
	return false;
};

// ####### PURPOSES ########
AI.prototype.socialize_old = function() {
	if (this.available_conversation_partners() == false && this.logic.act != "being_spoken_to") this.my_target=false, this.logic.act = "nothing";
	if (this.suspicion > 2 && this.logic.act != "being_spoken_to") this.my_target=false, this.logic.purpose = "think";
	if (!this.my_target) this.logic.act = "target_closest";
	if (this.my_target && Math.abs(this.x - this.my_target.x) > .1) this.engaged = false;
	if (this.my_target && this.my_target != player) {
		if (!this.my_target.being_spoken_to) this.logic.act = "approach_target";
		if ((this.my_target.logic.act != "speak" && this.my_target.logic.act != "being_spoken_to") && !this.engaged) this.logic.act = "approach_target";
		if (this.my_target.engaged && this.logic.act != "being_spoken_to") this.logic.act = "waiting_to_talk";
		if (this.engaged && (this.my_target.logic.act != "speak" && this.my_target.logic.act != "being_spoken_to")) this.logic.act = "speak";
	}
	else if (this.my_target == player) {
		if (!this.my_target.engaged_by_AI) this.logic.act = "approach_target";
		if (this.my_target.engaged_by_AI) this.logic.act = "waiting_to_talk";
		if (this.engaged) this.logic.act = "speak";
	};
};

AI.prototype.socialize = function() {
	if (this.logic.act != "being_spoken_to") { //not being spoken to
		if (this.available_conversation_partners()) { // I have people left to talk to
			if (!this.my_target) { // I do not have a target
				this.logic.act = "target_closest";
			}
			else { // I have a target
				if (!this.engaged && this.my_target.my_target != this && this.my_target.logic.act != "being_spoken_to" && this.my_target.logic.act != "speak") this.logic.act = "approach_target";
				if (Math.abs(this.x - this.my_target.x) > .1) { // my target is too far away
					if (this.engaged) this.engaged = false;
					if (this.my_target.engaged_by_AI == this) this.my_target.engaged_by_AI = false;
				}
				else { // I am close enough to talk to my target
					if (this.my_target == player) { // my target is the player
						if (!this.my_target.engaged_by_AI) { // 
							this.my_target.engaged_by_AI = this;
							if(this.engaged) this.logic.act = "speak";
						}
						else if (this.my_target.engaged_by_AI != this) { // player is being spoken to by AI that is not current AI
							this.logic.act = "waiting_to_talk";
						}
					}
					else { // my target is an AI
						if (this.my_target.my_target != this && (this.my_target.logic.act == "being_spoken_to" || this.my_target.logic.act == "speak")) { // my target is in a conversation
							this.logic.act = "waiting_to_talk";
						}
						else { // my target is NOT in a conversation
							if(this.engaged && this.my_target) this.logic.act = "speak";
						}

					}
				}
			}
		}
		else { // I have no one to talk to
			this.my_target=false;
			this.logic.act = "nothing";
		}
	}
}

AI.prototype.think = function() {
	// standard think items
	if(this.engaged) this.engaged = false;
	if(time[0]==0) this.time_count++;
	if (this.logic.act == "being_spoken_to") this.time_count = 0, this.logic.purpose = "socialize";
	// overrides from other characters
	// if (this.logic.act == "being_spoken_to") this.time_count = 0, this.logic.purpose = "socialize";
	
	// THINK TREE
	if (!camera.darkness) { // lights are on
		if (this.suspicion < 3) { // character is less than catalyst level of suspicion
			if (this.time_count >= 3+this.random) { // character has waited 3+ seconds, to slow down action
				if (this.available_conversation_partners()==true) { // character has available conversation partners
					this.time_count=0;
					if (this.logic.act != "being_spoken_to") this.logic.act = "pace";
					this.logic.purpose = "socialize";
				}
				else { //character does NOT have available conversation partners
					switch (this.persona.conversation.topic) {
						case "greeting" :
						this.persona.conversation.topic = "introduce";
						break;
						case "introduce" :
						this.persona.conversation.topic = "work";
						break;
						case "work" :
						this.persona.conversation.topic = "leisure";
						break;
						case "leisure" :
						this.persona.conversation.topic = "history";
						break;
						default:
						if (this.logic.act != "being_spoken_to") this.logic.act = "pace";
						break;
					}
					this.spoken_with_already = [];
					this.time_count=0;
					this.logic.purpose = "socialize";
				} 
			}
			else { // character has NOT yet waited 3+ seconds
				if (this.logic.act != "being_spoken_to") this.logic.act = "pace";
			}
		}
		else { // character's suspicion level is higher than catalyst level
			if (this.logic.act != "being_spoken_to") this.logic.act = "pace";
		}
	}
	else { // lights are off
		this.engaged = false;
    	this.my_target = false;
    	this.time_count = 0;
		if (this.persona.genre == "MURDERER") this.logic.purpose = "murder";
		else this.logic.purpose = "survival";
	}
};

AI.prototype.murder = function() {
	if(time[0]==0) this.time_count++;
	if (this.time_count<10) {
		if (this.y == this.my_target.y && this.x > this.my_target.x-.1 && this.x < this.my_target.x+.1 && camera.viewHeight == 0 && this.no_witnesses) {
			this.logic.act = "kill";	
		} 
		else if (this.y == this.my_target.y && this.x > this.my_target.x-.1 && this.x < this.my_target.x+.1 && camera.viewHeight == 0 && !this.no_witnesses) {
			this.logic.act = "nothing";
		}
		if (this.my_target.alive) this.logic.act = "approach_target";
		if (!this.my_target) this.logic.act = "target_suspicion";	
	}
	else {
		this.logic.act = "nothing";
	};
};

AI.prototype.survival = function() {
	if(time[0]==0) this.time_count++;
	if(this.time_count > 9) {
		this.logic.act = "nothing";
	}
	else {
		this.fleeing = true;
		this.logic.act = "pace";	
	}
}

AI.prototype.investigate = function() {

}

AI.prototype.die = function() {
	this.my_target = false;
	this.speech_bubble = false;
	this.logic.act = "fall";
}

// ######### UPDATE ##########

AI.prototype.update = function(logic, pos_in_array) {
	if (!this.alive) console.log(this.persona.full_name + " is dead!"), AI_array.splice(pos_in_array,1),corpse_array.push(this),everyone_array.splice(pos_in_array,1);
	if (time[0]==0) this.speech_bubble = false; // Reset function to make sure previous time activities don't overlap to next minute.
	this[logic.act]();
	this[logic.purpose]();
};


// ################ CAMERA ################## //
// ################ CAMERA ################## //
// ################ CAMERA ################## //
// ################ CAMERA ################## //
// ################ CAMERA ################## //
// ################ CAMERA ################## //
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
	if (this.AI_talk) this.drawLetters(player.converse.split(''),player.AI_focus.texture.image,time);
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

Camera.prototype.drawLetters = function(dialogue,face,time) {
	this.ctx.drawImage(face,1800,600,200,200,4,4,canvas.width/5.1,canvas.width/5.1)
	this.text_speed_counter++;
	this.ctx.font = this.width/22 + 'px Monaco';
	this.ctx.fillStyle = "#ffffff";
	function countAhead(d,w) {
		var i=1;
		var y = w.cursor+(canvas.width/5.1);
		while (d[i+w.letter] != " " && d[i+w.letter]) {
			y=y+canvas.width/30;
			if (y > canvas.width-(canvas.width/10)) return true;
			i++;
		};
		return false;
	};

	if (this.words_counter.letter<dialogue.length && this.text_speed_counter >= this.text_speed) {
		this.ctx.fillText(dialogue[this.words_counter.letter],this.words_counter.cursor+(canvas.width/5.1),(this.words_counter.line*this.height/9))
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
	if (this.dialogueBox) this.dialogueBox = false;
	if (this.darkness) this.ctx.clearRect(0,0,canvas.width,canvas.height);

	if (!this.darkness) this.drawBackground(player.y,time);


	if (!this.camera_lock) {
		this.drawRoom(player.x,player.y, map.grid);
	    this.drawAI(player.x,player.y, AI_array, map.grid);
	    this.drawPlayer(player.x,player.direction,player.sprite,Math.floor(player.seg),map.grid);
	    this.drawCorpses(player.x,player.y, corpse_array, map.grid);
	    this.drawFrontObjects(player.x,player.y,map.grid);
	}
	else {
		this.drawRoom(player.player_lock,player.y, map.grid);
	    this.drawAI(player.player_lock,player.y, AI_array, map.grid);
	    this.drawPlayer(player.player_lock,player.direction,player.sprite,Math.floor(player.seg),map.grid);
	    this.drawCorpses(player.player_lock,player.y, corpse_array, map.grid)
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
			this.ctx.drawImage(texture.image,sprite[seg],0,200,400,canvas.width/2.5,canvas.height/3,canvas.width/5,canvas.height/1.6)
		}
		else {
			this.ctx.drawImage(texture.image,sprite[seg],400,200,400,canvas.width/2.5,canvas.height/3,canvas.width/5,canvas.height/1.6)	
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
			var spriteRow = (array[i].moveSeg) ? 400 : 0;
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
			if(array[i].direction==1) {
				this.ctx.drawImage(texture.image,array[i].sprite[Math.floor(array[i].seg)],spriteRow,200,400,(canvas.width/2.5)+((array[i].x-x)*(canvas.width)),canvas.height/3+this.viewHeight+AI_height(array[i]),canvas.width/5,canvas.height/1.6);
			}
			else {
				this.ctx.save();
				this.ctx.scale(-1,1);
				this.ctx.drawImage(texture.image,array[i].sprite[Math.floor(array[i].seg)],spriteRow,200,400,-((canvas.width/2.5)+((array[i].x-x)*(canvas.width)))-(canvas.width/5),canvas.height/3+this.viewHeight+AI_height(array[i]),canvas.width/5,canvas.height/1.6);
				this.ctx.restore();
			}
			
			if (array[i].speech_bubble && array[i].y == player.y) this.speech_bubble((canvas.width/2.5)+((array[i].x-x)*(canvas.width)),array[i].speech_bubble,array[i].persona.inches,AI_height(array[i]));
		};
	};
};

Camera.prototype.drawCorpses = function(x,y,array,location) {
	var pos = function(horizontal, vertical) {
		return location[(Math.floor(array[i].x)+(1*horizontal))+((array[i].y+vertical)*mansion.length)];
	};
	for (var i=0;i<array.length;i++) {
		if (array[i].x < x+1 && array[i].x > x-1 && array[i].y <= y+1 && array[i].y >= y-1) {
			var texture = array[i].texture;
			var spriteRow = 400;
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
			if(array[i].direction==1) {
				this.ctx.drawImage(texture.image,1000,400,400,400,(canvas.width/2.5)+((array[i].x-x)*(canvas.width)),(canvas.height/2.7)+this.viewHeight+AI_height(array[i]),canvas.width/2.5,canvas.height/1.6);
			}
			else {
				this.ctx.save();
				this.ctx.scale(-1,1);
				this.ctx.drawImage(texture.image,1000,400,400,400,-((canvas.width/2.5)+((array[i].x-x)*(canvas.width)))-(canvas.width/5),(canvas.height/2.7)+this.viewHeight+AI_height(array[i]),canvas.width/2.5,canvas.height/1.6);
				this.ctx.restore();
			}
			
			if (array[i].speech_bubble && array[i].y == player.y) this.speech_bubble((canvas.width/2.5)+((array[i].x-x)*(canvas.width)),array[i].speech_bubble,array[i].persona.inches,AI_height(array[i]));
		};
	};
}

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

Camera.prototype.speech_bubble = function(x,speech,inches,worldHeight) {
	let center = x+canvas.width/12;

	function split_large_sentences(speech) {
		

	}

	this.ctx.save();
	this.ctx.strokeStyle = "#000000";
	this.ctx.lineWidth = 2;
	this.ctx.strokeRect(center,canvas.height-((canvas.height/2.6)*((inches*.01)*2))+this.viewHeight+worldHeight,2,canvas.height/14);
	this.ctx.restore();

	this.ctx.save();
	this.ctx.textAlign = "center";
	this.ctx.font = this.width/25 + 'px Monaco';
	this.ctx.lineWidth = 4;
	this.ctx.strokeStyle = "#000000";
	this.ctx.strokeText(speech,center,canvas.height-((canvas.height/2.5)*((inches*.01)*2))+this.viewHeight+worldHeight);
	this.ctx.fillStyle = "#ffffff";
	this.ctx.fillText(speech,center,canvas.height-((canvas.height/2.5)*((inches*.01)*2))+this.viewHeight+worldHeight);
	this.ctx.restore();
};

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





