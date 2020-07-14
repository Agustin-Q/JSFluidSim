#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  uniform highp sampler2D m;
#else
  precision mediump float;
  uniform  mediump sampler2D m;
#endif
#define SIZE 64.0

varying vec2 vTextureCoord;
  void main()
  {
  float i, j;
  float value = 0.0;
  float a = texture2D(m,vec2(0.0,0.0)).b;
  float cRecip = texture2D(m,vec2(1.0/SIZE,0.0)).b;

  i = vTextureCoord.s;
  j = vTextureCoord.t;
  float indexDiff = 1.0/SIZE;


  value = texture2D(m, vec2(i+indexDiff, j)).r
        + texture2D(m, vec2(i-indexDiff, j)).r
        + texture2D(m, vec2(i, j+indexDiff)).r
        + texture2D(m, vec2(i, j-indexDiff)).r ;
  value = (texture2D(m, vec2(i, j)).g + a*value)*cRecip;



  gl_FragColor.r = value;
 }
