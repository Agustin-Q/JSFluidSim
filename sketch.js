
var res = 8;
var fluidCube;
var fpsText;

function setup() {
  let canvas = createCanvas(512, 512);
  canvas.parent('container')
  fluidCube = new FluidCube(512 / res, 0.00001, 0.000000001, 0.2, 4); //0.0000001
  let radio = createRadio();
  radio.parent('renderType')
  radio.option('Default');
  radio.option('Dots');
  radio.value('Default');
  radio.changed(renderRadioChanged);
  let computeRadio = createRadio();
  computeRadio.parent('computeType')
  computeRadio.option('CPU');
  computeRadio.option('GPU');
  computeRadio.value('CPU');
  computeRadio.changed(computeRadioChanged);

  ellipseMode(CORNER);
}

var t = 0;
var renderDefalut = true;
var renderDots = false;


function draw() {
  background(0);

  fluidCube.AddDensity(floor(512 / res / 2), floor(512 / res / 2), 30);

  var vel = p5.Vector.fromAngle(map(noise(t), 0, 1, 0, TWO_PI));
  t += 0.01;
  vel.setMag(noise(t + 1000));
  fluidCube.AddVelocity(floor(512 / res /2),floor(512 / res /2),vel.x,vel.y);
  // codigo para que se mueva con el mouse, no anda
  // let mx = mouseX;
  // let my = mouseY;
  // let padding = 8*4;
  // if (mx > padding && mx < (512-padding) && my > padding && my<(512-padding)) {
  //   let mouseVel = createVector(movedX, movedY);
  //   mouseVel.mult(0.5);
  //   mouseVel.limit(0.5);
  //   fluidCube.AddVelocity(floor(mx / res),floor(my / res),0,-0.7);
  //   console.log(`mx: ${mx}, my: ${my}, vx: ${mouseVel.x}, vy:${mouseVel.y}`)
  // }

  // if (isNaN(fluidCube.Vx[2080])){
  //   console.log('falla');
  //   noLoop();
  // }
	//console.time("step");
  fluidCube.Step();
	//console.timeEnd("step");


  //-----------
 
  

  // render code.
  fill(0);

  for (var j = 0; j < height / res; j++) {
    for (var i = 0; i < width / res; i++) {
      var dens = fluidCube.density[fluidCube.IX(i, j)];
      //default render
      if (renderDefalut) {
        noStroke();
        dens = map(dens, 0, 10, 0, 255);
        fill(dens);
        rect(i * res, j * res, res, res);
      }

      //render as dots
      if (renderDots) {
        fill(255);
        var r = map(dens, 0, 10, 0, res);
        r = constrain(r, 0, res);
        ellipse(i * res, j * res, r, r);
      }
      //render vel vectors
      // stroke(220,0,150);
      // var hoff = res/2;
      // var voff = res/2;
      // var fluidVel = new p5.Vector(fluidCube.Vx[fluidCube.IX(i,j)],fluidCube.Vy[fluidCube.IX(i,j)])
      // var len = 2000;
      // var x = i*res+hoff;
      // var y = j*res+voff;
      // line(x,y,x+fluidVel.x*len,y+fluidVel.y*len);
    }
  }


  if (frameCount % 6 == 0) { //update every 6 frames
    let fpsText = document.getElementById("fps");
    fpsText.innerHTML = (nf(frameRate(),1,1));
  }
}

function renderRadioChanged(event){
  let value = event.target.value;
  if (value == "Default") {
    renderDefalut = true;
    renderDots = false;
  } else if (value == "Dots"){
    renderDefalut = false;
    renderDots = true;
  }
}

function computeRadioChanged(event){
  let value = event.target.value;
  fluidCube.setSolverType(value);
}