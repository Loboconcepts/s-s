var FPS = 60;
var canvas = document.getElementById("game");
var state_EXPLORE = 0;
var state_CONVERSATION = 1;
var state_PAUSED = 2;
var gameState = state_EXPLORE;




var run = setInterval(function() {
	logic();

}, 1000/FPS);



function logic() {
	if (gameState == state_EXPLORE) logic_EXPLORE();
}

function logic_EXPLORE() {
	player.update(controls.states)
	camera.render(player,mansion)
	

}



// ############ RENDER

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
		new Bitmap('./assets/wallpaper.jpg',1280,720),          // 0
		new Bitmap('./assets/right-bottom-stair.jpg',1280,720), // 1
		new Bitmap('./assets/right-top-stair.jpg',1280,720),    // 2
		new Bitmap('./assets/left-bottom-stair.jpg',1280,720),  // 3
		new Bitmap('./assets/left-top-stair.jpg',1280,720),     // 4
		new Bitmap('./assets/floor-sprites.jpg',1280,93)        // 5
		]
};

function Player (x,y,direction) {
	this.x = x;
    this.y = y;
    this.direction = direction;
    this.texture = new Bitmap('./assets/walking-guy.png',2000,800);
    this.sprite = [0,200,400,600,800,1000,1200,1400,1600,1800];
    this.seg = 0;
}


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

// ################ CAMERA ################## //

function Camera(ctx) {
	this.ctx = canvas.getContext("2d");
	this.width = canvas.width = window.innerWidth/2;
    this.height = canvas.height = canvas.width/(16/9);
    this.viewHeight = 0; //controls height of scene in viewport

}

Camera.prototype.render = function(player, map) { 
    this.drawRoom(player.x,player.y, map.grid);
    this.drawPlayer(player.x,player.direction,player.sprite,Math.floor(player.seg),map.grid);
};

Camera.prototype.drawPlayer = function (x,direction,sprite,seg,location) {
	var pos = function(horizontal, vertical) {
		return location[(Math.floor(x)+(1*horizontal))+((y+vertical)*mansion.length)];
	}
	var decimal = x%1;
	var texture = player.texture;
	if (direction==1) {
		this.ctx.drawImage(texture.image,sprite[seg],0,200,400,(canvas.width/2)-40,canvas.height/3+20,80,160)
	}
	else {
		this.ctx.drawImage(texture.image,sprite[seg],400,200,400,(canvas.width/2)-40,canvas.height/3+20,80,160)	
	}



}

Camera.prototype.drawRoom = function(x,y,location) {
	this.ctx.fillStyle = "#000000";
	this.ctx.fillRect(0,0,this.width,this.height)

	
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



}

var mansion = new Map (7,4, [0,
	0,0,0,0,0,0,2,
	4,0,0,0,0,0,1,
	3,0,0,0,0,0,2,
	0,0,0,0,0,0,1
	]);
var player = new Player(5,3,1);
var camera = new Camera(canvas);
var controls = new Controls();