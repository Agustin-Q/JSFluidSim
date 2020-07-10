var res = 16;


var fluidCube;
var fpsText;

function setup() {
	createCanvas(512, 512);
	fluidCube = new FluidCube(512/res,0.0001,0.0000001,0.2,4);//0.0000001
	fpsText = createP('fps');
	radio = createRadio();
  radio.option('Default');
  radio.option('Dots');
  radio.style('width', '120px');
	radio.value('Default');
	//frameRate(0.5);
	ellipseMode(CORNER);
}

var t =0;
function draw() {
	background(0);
	fluidCube.AddDensity(floor(512 / res /2),floor(512 / res /2),30);
	var vel = p5.Vector.fromAngle(map(noise(t),0,1,0,TWO_PI));
	t+=0.01;
	vel.setMag(noise(t+1000));
	fluidCube.AddVelocity(floor(512 / res /2),floor(512 / res /2),vel.x,vel.y);
	fluidCube.Step();

	for (var j = 0; j < height/res; j++){
		for (var i = 0; i< width/res; i++){
			if (fluidCube.density[fluidCube.IX(i,j)]>0){
				//fluidCube.FluidCubeAddDensity(i,j,-0.01); // remove density only if >0
			}
		}
	}

	var renderDefalut = false;
	var renderDots = false;
	if(radio.value() == "Default"){
		renderDefalut = true;
	} else{
		renderDefalut = false;
	}

	if(radio.value() == "Dots"){
		renderDots = true;
	} else{
		renderDots = false;
	}

	fill(0);
	for (var j = 0; j < height/res; j++){
		for (var i = 0; i< width/res; i++){
			var dens = fluidCube.density[fluidCube.IX(i,j)];
			//default render
			if(renderDefalut){
				noStroke();
				fill(map(dens,0,10,0,255));
				rect(i*res,j*res,res,res);
			}

			//render as dots
			if(renderDots){
				fill(255);
				var r = map(dens,0,10,0,res);
				r = constrain(r,0,res);
				ellipse(i*res,j*res,r,r);
			}
			//render vel vectors
			stroke(220,0,150);
			var hoff = res/2;
			var voff = res/2;
			var fluidVel = new p5.Vector(fluidCube.Vx[fluidCube.IX(i,j)],fluidCube.Vy[fluidCube.IX(i,j)])
			var len = 20;
			var x = i*res+hoff;
			var y = j*res+voff;
			line(x,y,x+fluidVel.x*len,y+fluidVel.y*len);
		}
	}


	if (frameCount%6 == 0){ //update every 6 frames
	 fpsText.html(frameRate());
	}
}
