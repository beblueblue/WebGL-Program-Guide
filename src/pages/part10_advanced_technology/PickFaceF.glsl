// 检查OpenGL ES 2.0的支持
#ifdef GL_ES
  precision mediump float;
#endif

varying vec4 v_color;

void main(){
  gl_FragColor = v_color;
}