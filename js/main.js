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
	time_keeper();
	if (gameState == state_EXPLORE) logic_EXPLORE();
	

}

function logic_EXPLORE() {

	player.update(controls.states);
	for (var i=0;i<AI_array.length;i++) AI_array[i].update();
	
	camera.render(player,mansion);

	
	

}



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
		new Bitmap('./assets/floor-sprites.jpg',1280,93)        // 5
		];
};


//############## PLAYER #################//

function Player (x,y,direction) {
	this.x = x;
    this.y = y;
    this.direction = direction;
    this.texture = new Bitmap('./assets/walking-guy.png',2000,800);
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
};

var hold=false;
Player.prototype.walk = function(distance) {
	
	var pos = function(x,y,horizontal, vertical) {
		return mansion.grid[(Math.floor(x)+(1*horizontal))+((y+vertical)*mansion.length)];
	}

	if (this.x > 1.5 && this.x < (mansion.length+.5)) {
		this.x+=distance;
		this.seg+=Math.abs(distance*20);
		if (this.seg >= 10) this.seg = 0;
		if (hold) hold=false;
	}
	else if (this.x <= 1.5 && distance > 0) {
		this.x+=distance;
	}
	else if (this.x >= mansion.length-.1 && distance < 0) {
		this.x+=distance;	
	}
	if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 1 && !hold) this.y = this.y-1, hold=true;
	if (this.x<1.5 && pos(this.x,this.y,0,0) == 3 && !hold) this.y = this.y-1, hold=true;

	if (this.x>(mansion.length+.5) && pos(this.x,this.y,0,0) == 2 && !hold) this.y = this.y+1, hold=true;
	if (this.x<1.5 && pos(this.x,this.y,0,0) == 4 && !hold) this.y = this.y+1, hold=true;
		
};

Player.prototype.update = function(controls) {
    if (controls.right) this.walk(.01),this.direction=1;
    if (controls.left) this.walk(-.01),this.direction=-1;
    if (!controls.left && !controls.right) this.seg=0;
};

//################ AI #################//

function AI (x,y,direction,texture) {
	this.x = x;
	this.x = x;
    this.y = y;
    this.direction = direction;
    this.texture = texture;
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
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


// ################# CONTROLS #################### //

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


// ################ CAMERA ################## //

function Camera(ctx) {
	this.ctx = canvas.getContext("2d");
	this.width = canvas.width = window.innerWidth/2;
    this.height = canvas.height = canvas.width/(16/9);
    this.viewHeight = 0; //controls height of scene in viewport
    this.rgb = [180,180,255];
}

Camera.prototype.render = function(player, map) { 
	this.drawBackground(player.y,time);
    this.drawRoom(player.x,player.y, map.grid);
    this.drawAI(player.x,player.y, AI_array);
    this.drawPlayer(player.x,player.direction,player.sprite,Math.floor(player.seg),map.grid);
};

Camera.prototype.drawPlayer = function (x,direction,sprite,seg,location) {
	var pos = function(horizontal, vertical) {
		return location[(Math.floor(x)+(1*horizontal))+((y+vertical)*mansion.length)];
	}
	var decimal = x%1;
	var texture = player.texture;
	if (direction==1) {
		this.ctx.drawImage(texture.image,sprite[seg],0,200,400,canvas.width/2.5,canvas.height/2.3,canvas.width/6,canvas.height/1.9)
	}
	else {
		this.ctx.drawImage(texture.image,sprite[seg],400,200,400,canvas.width/2.5,canvas.height/2.3,canvas.width/6,canvas.height/1.9)	
	}
};

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


	this.ctx.fillStyle = "rgba("+this.rgb[0]+","+this.rgb[1]+","+this.rgb[2]+",1)";
	this.ctx.fillRect(0,0,this.width,this.height);

	if (time[2]<3) {
		this.ctx.fillStyle = "rgba(255,255,200,1)";
		this.ctx.fillRect(this.width/2,(time[2]*60)+time[1],50,50)	
	}
	else if (time[2]<5) {
		this.ctx.fillStyle = "rgba(230,230,230,1)";
		this.ctx.fillRect(this.width/2,this.height/5,50,50)
	}

	
	// this.ctx.arc(30,30,30,0,6.28);
	// this.ctx.fill();


	
		this.ctx.fillStyle = "rgba(100,200,100,1)";
		this.ctx.fillRect(0,this.height/1.7,this.width,this.height);

	
};


//############# STARTING VARIABLES ################//

var mansion = new Map (5,4, [0,
	0,0,0,0,2,
	4,0,0,0,1,
	3,0,0,0,2,
	0,0,0,0,1
	]);
var player = new Player(5,3,1);
var camera = new Camera(canvas);
var controls = new Controls();

var cornelia_cornhowser = new AI(3.3,3,1,new Bitmap('./assets/walking-guy.png',2000,800));

var sunuel_sunflower = new AI(2.7,3,1,new Bitmap('./assets/walking-guy.png',2000,800));


var AI_array = [cornelia_cornhowser,sunuel_sunflower];


