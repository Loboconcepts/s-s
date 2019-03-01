function generateSprite(c) {
	var spriteCanvas = document.createElement("canvas");
	spriteCanvas.setAttribute("id","spriteCanvas");

	function Hair(x,y,backWave) {
		ctx2.fillStyle = "rgba("+c.hair.color[0]+","+c.hair.color[1]+","+c.hair.color[2]+")";
		// hair back
		ctx2.save();
		ctx2.translate(x,y);

		if (c.hair.back > 50) {
			ctx2.beginPath(80,40);
			ctx2.fillStyle = "rgba("+c.hair.color[0]+","+c.hair.color[1]+","+c.hair.color[2]+")";
			ctx2.quadraticCurveTo(85,45-(backWave/2),65+backWave,30+c.hair.back+backWave);
			ctx2.quadraticCurveTo(100+backWave,c.hair.back,75,25+c.hair.back);
			ctx2.fill();
			ctx2.closePath();
		}
		for (var i=0;i<42;i++) {
			//back
			if (i<15) ctx2.fillRect(75+i,25-i,5,Math.max(0,c.hair.back-i));
			//sideburns
			else if (i<20) ctx2.fillRect(75+i,10,5,Math.max(0,c.hair.sideburns-i));
			//middle
			else ctx2.fillRect(75+i,10,5,Math.max(c.hair.max,c.hair.middle-(i-20)));
			
			
		}

		ctx2.restore();
	}

	function Beard(x,y) {
		ctx2.fillStyle = "rgba("+c.hair.color[0]+","+c.hair.color[1]+","+c.hair.color[2]+")";
		// hair back
		ctx2.save();
		ctx2.translate(x,y);
		for (var i=0;i<40;i++) {
			//back
			//sideburns
			if (i<5) ctx2.fillRect(90+i,40,5,c.beard.sideburns);
			//middle
			else if (i<20) ctx2.fillRect(85+i,40+i,5,Math.max(0,c.beard.chops-i));
			//front
			else ctx2.fillRect(140-i,60,-5,Math.max(0,c.beard.chin-(i-20)));
		}

		ctx2.restore();
	}

	function Face(x,y) {
		ctx2.save();
		ctx2.translate(x,y);
		ctx2.fillStyle = "rgba("+c.skin[0]+","+c.skin[1]+","+c.skin[2]+")";
		//head
		ctx2.beginPath();
		ctx2.moveTo(80,35);
		ctx2.bezierCurveTo(75,5,115,10,120,25);
		ctx2.lineTo(120,65);
		ctx2.lineTo(80,65);
		ctx2.fill();
		ctx2.closePath();
		//neck
		ctx2.beginPath();
		ctx2.fillRect(80,64,30,20)
		//neck shadow
		ctx2.fillStyle = "rgba(0, 0, 0,.1)";
		ctx2.fillRect(95,64,15,20)
		ctx2.closePath();

		ctx2.restore();
	}

	function Body(x,y) {
		ctx2.save();
		ctx2.translate(x,y);
		ctx2.fillStyle = "rgba("+c.clothes.shirt[0]+","+c.clothes.shirt[1]+","+c.clothes.shirt[2]+")";
		ctx2.beginPath();
		ctx2.moveTo(80,70);
		ctx2.quadraticCurveTo(105,80,110,70);
		ctx2.bezierCurveTo(110+c.torso.chest,100+c.torso.build,120+c.torso.stomach,110+c.torso.posture,120,200);
		ctx2.quadraticCurveTo(70,215,60,195);
		ctx2.bezierCurveTo(65+c.torso.waist,130,45+c.torso.back,110,75,75);
		ctx2.fill();
		ctx2.closePath();
		ctx2.restore();

	}

	function Arm(x,y,rotation,extension,darker) {
		ctx2.save();
		ctx2.translate(x,y);
		ctx2.rotate(rotation * Math.PI / 180);
		//upper arm
		if (darker) ctx2.fillStyle = "rgba("+(c.clothes.sleeves[0]-20)+","+(c.clothes.sleeves[1]-20)+","+(c.clothes.sleeves[2]-20)+")";
		else ctx2.fillStyle = "rgba("+c.clothes.sleeves[0]+","+c.clothes.sleeves[1]+","+c.clothes.sleeves[2]+")";
		ctx2.beginPath();
		ctx2.moveTo(65-c.torso.arms+extension,90-extension);
		ctx2.lineTo(55-c.torso.arms+extension,141+extension);
		ctx2.lineTo(75+c.torso.arms+extension,141+extension);
		ctx2.lineTo(85+c.torso.arms,95);
		ctx2.bezierCurveTo(90,65,70,65,65-c.torso.arms+extension,90-extension)
		ctx2.fill();
		ctx2.closePath();
		//lower arm
		ctx2.beginPath();
		ctx2.moveTo(55-c.torso.arms+extension,139+extension);
		ctx2.lineTo(65-c.torso.arms,206+extension);
		ctx2.lineTo(85+c.torso.arms,206+extension);
		ctx2.lineTo(75+c.torso.arms+extension,139+extension);
		ctx2.fill();
		ctx2.closePath();
		//hand
		ctx2.fillStyle = "rgba("+c.skin[0]+","+c.skin[1]+","+c.skin[2]+")";
		ctx2.beginPath();
		ctx2.moveTo(65,205+extension);
		ctx2.lineTo(70,225+extension);
		ctx2.quadraticCurveTo(80,227+extension,90,223+extension);
		ctx2.quadraticCurveTo(92,210+extension,87,205+extension);
		ctx2.fill();
		ctx2.fillStyle = "rgba(0, 0, 0,.1)";
		ctx2.fillRect(65,205,20,2)
		ctx2.closePath();
		ctx2.restore();
	}

	function Leg(x,y,knee,ankle,darker,pantHem) {
		ctx2.save();
		ctx2.translate(x,y);
		if (darker) ctx2.fillStyle = "rgba("+(c.clothes.pants[0]-20)+","+(c.clothes.pants[1]-20)+","+(c.clothes.pants[2]-20)+")";
		else ctx2.fillStyle = "rgba("+c.clothes.pants[0]+","+c.clothes.pants[1]+","+c.clothes.pants[2]+")";
		//upper leg
		ctx2.beginPath();
		ctx2.moveTo(60,200);
		ctx2.lineTo(90+knee,281);
		ctx2.lineTo(120+knee,281);
		ctx2.lineTo(120,200);
		ctx2.fill();
		ctx2.closePath();
		//lower leg
		ctx2.beginPath();
		ctx2.moveTo(90+knee,280);
		ctx2.lineTo(90+knee+ankle,380+pantHem[0]);
		ctx2.lineTo(120+knee+ankle,380+pantHem[1]);
		ctx2.lineTo(120+knee,280);
		ctx2.fill();
		ctx2.closePath();
		ctx2.restore();

	}

	function Foot(x,y,heel,toe,rotation) {
		ctx2.save();
		ctx2.translate(x,y);
		ctx2.rotate(rotation * Math.PI / 180);
		ctx2.fillStyle = "rgba("+c.clothes.shoes[0]+","+c.clothes.shoes[1]+","+c.clothes.shoes[2]+")";
		ctx2.beginPath();
		//back foot
		ctx2.moveTo(95,375+heel);
		ctx2.quadraticCurveTo(87,390,90,397+heel);
		ctx2.lineTo(125,397);
		ctx2.lineTo(125,390);
		ctx2.quadraticCurveTo(115,385+heel,110,375+heel);
		ctx2.fill();
		ctx2.closePath();
		//front foot
		
		ctx2.beginPath();
		ctx2.moveTo(124,390);
		ctx2.lineTo(135,393+toe);
		ctx2.lineTo(135,397+toe);
		ctx2.lineTo(124,397);

		ctx2.fill();
		ctx2.closePath();

		ctx2.restore();
	}

	var step_1 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,100-c.size,(100-c.size)*4),
		back_arm   : Arm(0,5,0,0,true),
		back_foot  : Foot(-7,-3,0,0,0),
		back_leg   : Leg(0,-2,-10,0,true,[0,0]),
		face       : Face(0,0),
		front_foot : Foot(0,0,0,0,0),
		front_leg  : Leg(0,0,0,0,false,[0,0]),
		body       : Body(0,0),
		front_arm  : Arm(0,5,0,0,false),
		hair       : Hair(0,0,-2),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var step_2 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,300-c.size,(100-c.size)*4),
		back_arm   : Arm(0,25,-12,0,true),
		back_foot  : Foot(-50,0,-8,0,0),
		back_leg   : Leg(0,-2,-30,-20,true,[0,0]),
		face       : Face(0,0),
		front_foot : Foot(35,-4,0,0,0),
		front_leg  : Leg(0,0,20,10,false,[-5,-5]),
		body       : Body(0,0),
		front_arm  : Arm(15,-5,10,0,false),
		hair       : Hair(0,0,-4),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}
	var step_3 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,500-c.size,(100-c.size)*4),
		back_arm   : Arm(0,30,-17,0,true),
		back_foot  : Foot(170,0,0,-7,35),
		back_leg   : Leg(0,-8,-35,-30,true,[-10,10]),
		face       : Face(0,0),
		front_foot : Foot(-100,75,0,0,-25),
		front_leg  : Leg(0,0,20,30,false,[10,-10]),
		body       : Body(0,0),
		front_arm  : Arm(25,-10,15,0,false),
		hair       : Hair(0,0,-6),
		beard      : Beard(0,0),
		restore    : ctx2.restore()

	}

	var step_4 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,700-c.size,(100-c.size)*4),
		back_arm   : Arm(0,30,-17,0,true),
		back_foot  : Foot(170,-10,0,0,35),
		back_leg   : Leg(0,0,-25,-50,true,[-30,-10]),
		face       : Face(0,5),
		front_foot : Foot(15,0,0,0,0),
		front_leg  : Leg(0,0,10,5,false,[0,0]),
		body       : Body(0,5),
		front_arm  : Arm(35,-10,20,0,false),
		hair       : Hair(0,5,-8),
		beard      : Beard(0,5),
		restore    : ctx2.restore()

	}

	var step_5 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,900-c.size,(100-c.size)*4),
		back_arm   : Arm(-15,30,-15,0,true),
		back_foot  : Foot(180,-5,0,0,35),
		back_leg   : Leg(0,0,-15,-50,true,[-30,-10]),
		face       : Face(0,5),
		front_foot : Foot(0,0,0,0,0),
		front_leg  : Leg(0,0,0,0,false,[0,0]),
		body       : Body(0,5),
		front_arm  : Arm(15,0,10,0,false),
		hair       : Hair(0,5,-4),
		beard      : Beard(0,5),
		restore    : ctx2.restore()

	}

	var step_6 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,1100-c.size,(100-c.size)*4),
		back_arm   : Arm(5,0,0,0,true),
		back_foot  : Foot(15,-3,0,0,0),
		back_leg   : Leg(0,-2,10,0,true,[0,0]),
		face       : Face(0,0),
		front_foot : Foot(-20,0,0,0,0),
		front_leg  : Leg(0,0,-10,-10,false,[0,0]),
		body       : Body(0,0),
		front_arm  : Arm(0,5,0,0,false),
		hair       : Hair(0,0,0),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var step_7 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,1300-c.size,(100-c.size)*4),
		back_arm   : Arm(20,-5,7,0,true),
		back_foot  : Foot(35,-4,0,0,0),
		back_leg   : Leg(0,0,20,10,true,[-5,-5]),
		face       : Face(0,0),
		front_foot : Foot(-50,0,-8,0,0),
		front_leg  : Leg(0,0,-30,-20,false,[0,0]),
		body       : Body(0,0),
		front_arm  : Arm(-15,30,-15,0,false),
		hair       : Hair(0,0,0),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var step_8 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,1500-c.size,(100-c.size)*4),
		back_arm   : Arm(25,-10,10,0,true),
		back_foot  : Foot(-100,75,0,0,-25),
		back_leg   : Leg(0,0,20,30,true,[10,-10]),
		face       : Face(0,0),
		front_foot : Foot(170,0,0,-7,35),
		front_leg  : Leg(0,-8,-35,-30,false,[-10,10]),
		body       : Body(0,0),
		front_arm  : Arm(-20,47,-25,0,false),
		hair       : Hair(0,0,0),
		beard      : Beard(0,0),
		

		restore      : ctx2.restore()
	}

	var step_9 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,1700-c.size,(100-c.size)*4),
		back_arm   : Arm(35,-10,15,0,true),
		back_foot  : Foot(15,0,0,0,0),
		back_leg   : Leg(0,0,10,5,true,[0,0]),
		face       : Face(0,5),
		front_foot : Foot(170,-10,0,0,35),
		front_leg  : Leg(0,0,-25,-50,false,[-30,-10]),
		body       : Body(0,5),
		front_arm  : Arm(-20,51,-25,0,false),
		hair       : Hair(0,5,0),
		beard      : Beard(0,5),
		restore    : ctx2.restore()
	}

	var step_10 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,1900-c.size,(100-c.size)*4),
		back_arm   : Arm(25,-5,10,0,true),
		back_foot  : Foot(0,0,0,0,0),
		back_leg   : Leg(0,0,0,0,true,[0,0]),
		face       : Face(0,5),
		front_foot : Foot(180,-5,0,0,35),
		front_leg  : Leg(0,0,-15,-50,false,[-30,-10]),
		body       : Body(0,5),
		front_arm  : Arm(-15,35,-15,0,false),
		hair       : Hair(0,5,0),
		beard      : Beard(0,5),
		restore    : ctx2.restore()
	}




	var rev_step_1 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,100+c.size,(200-c.size)*4),
		back_arm   : Arm(0,5,0,0,true),
		back_foot  : Foot(-7,-3,0,0,0),
		back_leg   : Leg(0,-2,-10,0,true,[0,0]),
		face       : Face(0,0),
		front_foot : Foot(0,0,0,0,0),
		front_leg  : Leg(0,0,0,0,false,[0,0]),
		body       : Body(0,0),
		front_arm  : Arm(0,5,0,0,false),
		hair       : Hair(0,0,-2),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var rev_step_2 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,300+c.size,(200-c.size)*4),
		back_arm   : Arm(0,25,-12,0,true),
		back_foot  : Foot(-50,0,-8,0,0),
		back_leg   : Leg(0,-2,-30,-20,true,[0,0]),
		face       : Face(0,0),
		front_foot : Foot(35,-4,0,0,0),
		front_leg  : Leg(0,0,20,10,false,[-5,-5]),
		body       : Body(0,0),
		front_arm  : Arm(15,-5,10,0,false),
		hair       : Hair(0,0,-4),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var rev_step_3 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,500+c.size,(200-c.size)*4),
		back_arm   : Arm(0,30,-17,0,true),
		back_foot  : Foot(170,0,0,-7,35),
		back_leg   : Leg(0,-8,-35,-30,true,[-10,10]),
		face       : Face(0,0),
		front_foot : Foot(-100,75,0,0,-25),
		front_leg  : Leg(0,0,20,30,false,[10,-10]),
		body       : Body(0,0),
		front_arm  : Arm(25,-10,15,0,false),
		hair       : Hair(0,0,-6),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var rev_step_4 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,700+c.size,(200-c.size)*4),
		back_arm   : Arm(0,30,-17,0,true),
		back_foot  : Foot(170,-10,0,0,35),
		back_leg   : Leg(0,0,-25,-50,true,[-30,-10]),
		face       : Face(0,5),
		front_foot : Foot(15,0,0,0,0),
		front_leg  : Leg(0,0,10,5,false,[0,0]),
		body       : Body(0,5),
		front_arm  : Arm(35,-10,20,0,false),
		hair       : Hair(0,5,-8),
		beard      : Beard(0,5),
		restore    : ctx2.restore()

	}

	var rev_step_5 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,900+c.size,(200-c.size)*4),
		back_arm   : Arm(-15,30,-15,0,true),
		back_foot  : Foot(180,-5,0,0,35),
		back_leg   : Leg(0,0,-15,-50,true,[-30,-10]),
		face       : Face(0,5),
		front_foot : Foot(0,0,0,0,0),
		front_leg  : Leg(0,0,0,0,false,[0,0]),
		body       : Body(0,5),
		front_arm  : Arm(15,0,10,0,false),
		hair       : Hair(0,5,-4),
		beard      : Beard(0,5),
		restore    : ctx2.restore()

	}

	var rev_step_6 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,1100+c.size,(200-c.size)*4),
		back_arm   : Arm(5,0,0,0,true),
		back_foot  : Foot(15,-3,0,0,0),
		back_leg   : Leg(0,-2,10,0,true,[0,0]),
		face       : Face(0,0),
		front_foot : Foot(-20,0,0,0,0),
		front_leg  : Leg(0,0,-10,-10,false,[0,0]),
		body       : Body(0,0),
		front_arm  : Arm(0,5,0,0,false),
		hair       : Hair(0,0,0),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var rev_step_7 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,1300+c.size,(200-c.size)*4),
		back_arm   : Arm(20,-5,7,0,true),
		back_foot  : Foot(35,-4,0,0,0),
		back_leg   : Leg(0,0,20,10,true,[-5,-5]),
		face       : Face(0,0),
		front_foot : Foot(-50,0,-8,0,0),
		front_leg  : Leg(0,0,-30,-20,false,[0,0]),
		body       : Body(0,0),
		front_arm  : Arm(-15,30,-15,0,false),
		hair       : Hair(0,0,0),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var rev_step_8 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,1500+c.size,(200-c.size)*4),
		back_arm   : Arm(25,-10,10,0,true),
		back_foot  : Foot(-100,75,0,0,-25),
		back_leg   : Leg(0,0,20,30,true,[10,-10]),
		face       : Face(0,0),
		front_foot : Foot(170,0,0,-7,35),
		front_leg  : Leg(0,-8,-35,-30,false,[-10,10]),
		body       : Body(0,0),
		front_arm  : Arm(-20,47,-25,0,false),
		hair       : Hair(0,0,0),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}

	var rev_step_9 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,1700+c.size,(200-c.size)*4),
		back_arm   : Arm(35,-10,15,0,true),
		back_foot  : Foot(15,0,0,0,0),
		back_leg   : Leg(0,0,10,5,true,[0,0]),
		face       : Face(0,5),
		front_foot : Foot(170,-10,0,0,35),
		front_leg  : Leg(0,0,-25,-50,false,[-30,-10]),
		body       : Body(0,5),
		front_arm  : Arm(-20,51,-25,0,false),
		hair       : Hair(0,5,0),
		beard      : Beard(0,5),
		restore    : ctx2.restore()
	}

	var rev_step_10 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(-c.size/100,0,0,c.size/100,1900+c.size,(200-c.size)*4),
		back_arm   : Arm(25,-5,10,0,true),
		back_foot  : Foot(0,0,0,0,0),
		back_leg   : Leg(0,0,0,0,true,[0,0]),
		face       : Face(0,5),
		front_foot : Foot(180,-5,0,0,35),
		front_leg  : Leg(0,0,-15,-50,false,[-30,-10]),
		body       : Body(0,5),
		front_arm  : Arm(-15,35,-15,0,false),
		hair       : Hair(0,5,0),
		beard      : Beard(0,5),
		restore    : ctx2.restore()
	}

	var arm_1 = {
		save       : ctx2.save(),
		size       : ctx2.setTransform(c.size/100,0,0,c.size/100,100-c.size,(300-c.size)*4),
		back_arm   : Arm(0,5,0,0,true),
		back_foot  : Foot(-7,-3,0,0,0),
		back_leg   : Leg(0,-2,-10,0,true,[0,0]),
		face       : Face(0,0),
		front_foot : Foot(0,0,0,0,0),
		front_leg  : Leg(0,0,0,0,false,[0,0]),
		body       : Body(0,0),
		front_arm  : Arm(-25,50,-25,-10,false),
		hair       : Hair(0,0,-2),
		beard      : Beard(0,0),
		restore    : ctx2.restore()
	}
}