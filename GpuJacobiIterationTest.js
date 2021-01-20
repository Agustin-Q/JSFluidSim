
function JacobiIteration(gpgpUtility_)
{
  "use strict";

  /** WebGLRenderingContext */
  var gl;
  var gpgpUtility;
  var positionHandle;
  var program;
  var textureCoordHandle;
  var textureHandle;

  /**
   * Compile shaders and link them into a program, then retrieve references to the
   * attributes and uniforms. The standard vertex shader, which simply passes on the
   * physical and texture coordinates, is used.
   *
   * @returns {WebGLProgram} The created program object.
   * @see {https://www.khronos.org/registry/webgl/specs/1.0/#5.6|WebGLProgram}
   */
  this.createProgram = function (gl)
  {
    var fragmentShaderSource;
    var program;

    fragmentShaderSource = getSourcefromURL("http://127.0.0.1:5500/myTextFile.frag");
    program            = gpgpUtility.createProgram(null, fragmentShaderSource); //crea el programa y lo linquea con std vertex shader y el fragment shader
    positionHandle     = gpgpUtility.getAttribLocation(program,  "position");
    gl.enableVertexAttribArray(positionHandle);
    textureCoordHandle = gpgpUtility.getAttribLocation(program,  "textureCoord");
    gl.enableVertexAttribArray(textureCoordHandle);
    textureHandle      = gl.getUniformLocation(program, "texture");

    return program;
  };

//aca van las cosas que se pueden hacer una sola vez
  this.init = function(){
    console.log("Init Jacobi GPU Solver...")
    //gl.useProgram(program);
    //var outputTexture = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT,null);
    //var addFrameBuffer;
    //addFrameBuffer = gpgpUtility.attachFrameBuffer(outputTexture);
    //gpgpUtility.getStandardVertices();

    //gl.vertexAttribPointer(positionHandle,     3, gl.FLOAT, gl.FALSE, 20, 0);
    //gl.vertexAttribPointer(textureCoordHandle, 2, gl.FLOAT, gl.FALSE, 20, 12);
    //gl.activeTexture(gl.TEXTURE0);
    //gl.uniform1i(textureHandle, 0);

  }


  //intextur, en el canel r va a estar x0, en el canal b x
  //x0 -> .r
  //x -> .g
  //a -> [0,0].b
  //cRecip -> [1,0].b
  this.JacobiIter = function(inTexture, outTexture){
    var addFrameBuffer;
    addFrameBuffer = gpgpUtility.attachFrameBuffer(outTexture);
    gl.useProgram(program);

    gpgpUtility.getStandardVertices();
    //
    gl.vertexAttribPointer(positionHandle,     3, gl.FLOAT, gl.FALSE, 20, 0);
    gl.vertexAttribPointer(textureCoordHandle, 2, gl.FLOAT, gl.FALSE, 20, 12);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inTexture);
    gl.uniform1i(textureHandle, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
    gl.finish();
  }

    this.JacobiIterWrapper = function(x, x0,a,cRecip,size, outArray){
      //generar la inputMatrix
     var inputMatrix = new Float32Array(size*size*4);
     for(var j = 0; j < size; j++){
       for (var i = 0; i< size; i++){
         inputMatrix[(i + j * size)*4] = x[i + j * size];
         inputMatrix[(i + j * size)*4+1] = x0[i + j * size];
       }
     }
     inputMatrix[2] = a; //a
     inputMatrix[6] = cRecip; //cRecip
      //console.log(inputMatrix);
      var inputTexture = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT,inputMatrix);
      var outputTexture = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT,null);
      this.JacobiIter(inputTexture,outputTexture);
      var outBuffer = new Float32Array(size*size*4);
      gl.readPixels(0,                // x-coord of lower left corner
                    0,                // y-coord of lower left corner
                    size,                // width of the block
                    size,                // height of the block
                    gl.RGBA,          // Format of pixel data.
                    gl.FLOAT,         // Data type of the pixel data, must match makeTexture
                    outBuffer);          // Load pixel data into buffer
      //console.log(outBuffer);

      for(var j = 0; j < size; j++){
        for (var i = 0; i< size; i++){
          outArray[i + j*size] = outBuffer[(i + j*size)*4];
        }
      }
    }

  /**
   * Invoke to clean up resources specific to this program. We leave the texture
   * and frame buffer intact as they are used in followon calculations.
   */
  this.done = function ()
  {
    gl.deleteProgram(program);
  };

  gpgpUtility = gpgpUtility_;
  gl          = gpgpUtility.getGLContext();
  program     = this.createProgram(gl);
};


//helper function
var getSourcefromURL = function(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return (req.status == 200) ? req.responseText : null;
};
