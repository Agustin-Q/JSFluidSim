var res = 8;


var fluidCube;
var fpsText;

function setup() {
	createCanvas(512, 512);
	fluidCube = new FluidCube(512/res,0.00001,0.0000001,0.2);//0.0000001
	fpsText = createP('fps');
}

var t =0;
function draw() {
	background(0);
	fluidCube.FluidCubeAddDensity(floor(512 / res /2),floor(512 / res /2),30);
	var vel = p5.Vector.fromAngle(map(noise(t),0,1,0,TWO_PI));
	t+=0.01;
	vel.setMag(noise(t+1000));
	fluidCube.FluidCubeAddVelocity(floor(512 / res /2),floor(512 / res /2),vel.x,vel.y);
	fluidCube.FluidCubeStep();

	for (var j = 0; j < height/res; j++){
		for (var i = 0; i< width/res; i++){
			if (fluidCube.density[fluidCube.IX(i,j)]>0){
				//fluidCube.FluidCubeAddDensity(i,j,-0.01); // remove density only if >0
			}
		}
	}



	fill(0);
	for (var j = 0; j < height/res; j++){
		for (var i = 0; i< width/res; i++){
			var dens = fluidCube.density[fluidCube.IX(i,j)];
			//default render
			noStroke();
			fill(map(dens,0,10,0,255));
			rect(i*res,j*res,res,res);

			//render as dots
			//fill(255);
			// var r = map(dens,0,10,0,res);
			// r = constrain(r,0,res);
			// ellipse(i*res,j*res,r,r);

			//render vel vectors
			//stroke(220,0,150);
			//var fluidVel = new p5.Vector(fluidCube.Vx[fluidCube.IX(i,j)],fluidCube.Vy[fluidCube.IX(i,j)])
			//var len = 20;
			//line(i*res,j*res,i*res+fluidVel.x*len,j*res+fluidVel.y*len);
		}
	}

	if (frameCount%6 == 0){ //update every 6 frames
	 fpsText.html(frameRate());
	}
}
