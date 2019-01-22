var FPS = 60;
var canvas = document.getElementById("game");
var state_EXPLORE = 0;
var state_CONVERSATION = 1;
var state_PAUSED = 2;
var gameState = state_EXPLORE;
var time = [0,0,0];
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
	for (var i=0;i<AI_array.length;i++) AI_array[i].update();
	player.update(controls.states);
	
	camera.render_EXPLORE(player,mansion);
	

	// ############## LIGHTNING HERE ################ //

	// if (time[0]>31 && time[0]<35 && !camera.darkness) {
	// 	if (Math.floor(Math.random()*8) == 0)camera.darkness=true;
		
	// }
	// else if (time[0]<31 || time[0]>35 && camera.darkness) {
	// 	camera.darkness=false;	
	// }

};

function logic_PAUSED() {
	camera.ctx.fillStyle = "#ff0000";
	camera.ctx.fillText('PAUSED',camera.width/2.3,camera.height/2);
};

function logic_CONVERSATION() {
	player.update(controls.states, camera.text_speed);
	
	camera.render_CONVERSATION();
	

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
};

Controls.prototype.onKey = function(val, e) {
    var state = this.codes[e.keyCode];
    if (typeof state === 'undefined') return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
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
		new Bitmap('./assets/end-right-wall.png',1280,720)      // 6
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
};

// ################# PLAYER CONTROLS #################### //
// ################# PLAYER CONTROLS #################### //
// ################# PLAYER CONTROLS #################### //
// ################# PLAYER CONTROLS #################### //
// ################# PLAYER CONTROLS #################### //
// ################# PLAYER CONTROLS #################### //

Player.prototype.update = function(con, word_speed) {
	// explore controls
	if (gameState == state_EXPLORE) {
		if (con.right) this.walk(.01),this.direction=1;
	    if (con.left) this.walk(-.01),this.direction=-1;
	    if (!con.left && !con.right) this.seg=0;
	    if (con.up) this.interact(0), con.up=false;
	    if (!con.up) controls.holding = false;
	}


	if (camera.camera_lock && !this.player_lock) {
		this.player_lock = this.x;
	}

	if (!camera.camera_lock && this.player_lock) {
		this.player_lock = false;
	}
    

    // conversation controls
    if (gameState == state_CONVERSATION) {
    	if (con.up && camera.text_speed != 1 && !camera.continue) camera.text_speed=1, controls.holding = true;
	    if (!con.up) camera.text_speed=5, controls.holding = false;
	    if (con.up && camera.continue) this.reset(), con.up=false, controls.holding = true;	
	    if (con.right && camera.select && !this.chosen_reply) this.chosen_reply=true, this.interact(1,this.reply_select);
		if (con.left && camera.select && !this.chosen_reply) this.chosen_reply=true, this.interact(1,this.reply_select);
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

Player.prototype.interact = function(point, x_reply) {
	for (var i=0;i<AI_array.length;i++) {
		if (AI_array[i].y==this.y && (AI_array[i].x-this.x)*this.direction<=.2 && (AI_array[i].x-this.x)*this.direction > 0) {
			this.seg=0;
			AI_array[i].direction = this.direction*-1;
			AI_array[i].seg = 0;
			this.converse = (point == 0) ? AI_array[i].dialogue.greeting[0] : AI_array[i].dialogue.greeting[1][x_reply]; // This should assign based on time dynamically
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

			gameState = state_CONVERSATION;
			
		}
	}
}

Player.prototype.reset = function() {
	camera.AI_talk = false;
	// This is checking if there is a reply and if the replies havent been printed yet.
	if (this.talk.greeting && !camera.select && !this.chosen_reply) { //GREETING IS JUST A PLACEHOLDER. MAKE THIS FIND WHAT THE AI KEY WAS. 
		camera.dialogueBox = false;
	    camera.words_counter = {
	    	letter:0,
	    	line:1,
	    	word:1,
	    	cursor:canvas.width/30
	    };
	    camera.text_speed_counter = 0;
	    camera.text_speed = 5;
		camera.reply = this.talk.greeting; // SAME HERE
		camera.select = this.reply_select;
	}
	// if there is a reply and the replies have already been printed.
	else if (this.talk.greeting && camera.select && !this.chosen_reply) {//GREETING IS JUST A PLACEHOLDER. MAKE THIS FIND WHAT THE AI KEY WAS
		this.reply_select++;
		if (this.reply_select >= this.talk.greeting.length) this.reply_select = 0;
		camera.dialogueBox = false;
	    camera.words_counter = {
	    	letter:0,
	    	line:1,
	    	word:1,
	    	cursor:canvas.width/30
	    };
	    camera.text_speed_counter = 0;
	    camera.text_speed = 5;
		camera.reply = this.talk.greeting; // SAME HERE
		camera.select = this.reply_select;
	}
	else {
		controls.holding = false;
		gameState = state_EXPLORE;
	}
	
	
};

// ################ AI ################# //

function AI (x,y,direction,texture,dialogue,logic,dispositionTowardsPlayer) {
	this.x = x;
	this.x = x;
    this.y = y;
    this.direction = direction;
    this.texture = texture;
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
    this.dialogue = dialogue;
    this.logic = logic;
    this.dispositionTowardsPlayer = dispositionTowardsPlayer;
}

AI.prototype.walk = function(distance) {
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

	if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 1 && !hold) this.y = this.y-1;
	if (this.x<1.5 && pos(this.x,this.y,0,0) == 3 && !hold) this.y = this.y-1;

	if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 2 && !hold) this.y = this.y+1;
	if (this.x<1.5 && pos(this.x,this.y,0,0) == 4 && !hold) this.y = this.y+1;

}

AI.prototype.update = function() {
    if (time[1]%2==0) {
    	this.walk(.005),this.direction=1;
    }
    else {
		this.walk(-.005),this.direction=-1;
    }
};

// Take player.reply_select after player.chosen_reply = true and perform an action with it.
AI.prototype.react = function() {

}




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
	this.ctx.fillStyle = "#000000";
	this.ctx.strokeStyle = "#ffffff";
	this.ctx.rect(2,2,this.width-4,this.height/2.8);
	this.ctx.fill();
	this.ctx.stroke();
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
	    this.drawAI(player.x,player.y, AI_array);
	    this.drawPlayer(player.x,player.direction,player.sprite,Math.floor(player.seg),map.grid);
	}
	else {
		this.drawRoom(player.player_lock,player.y, map.grid);
	    this.drawAI(player.player_lock,player.y, AI_array);
	    this.drawPlayer(player.player_lock,player.direction,player.sprite,Math.floor(player.seg),map.grid);
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
	this.ctx.fillStyle="#000000";
	this.ctx.fillRect(0,0,canvas.width,canvas.height);
	this.ctx.restore();
}

Camera.prototype.drawAI = function (x,y,array) {

	for (var i=0;i<array.length;i++) {
		if (array[i].y==y && array[i].x < x+1 && array[i].x > x-1) {
			var texture = array[i].texture;
			var direction = (array[i].direction == 1) ? 0 : 400;
			this.ctx.drawImage(texture.image,array[i].sprite[Math.floor(array[i].seg)],direction,200,400,(canvas.width/2.5)+((array[i].x-x)*(canvas.width)),canvas.height/2.3,canvas.width/6,canvas.height/1.9)
		}
	}
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





