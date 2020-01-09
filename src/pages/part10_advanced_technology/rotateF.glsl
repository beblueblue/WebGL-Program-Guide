// 检查OpenGL ES 2.0的支持
#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D u_sampler;
varying vec2 v_texCoord;

void main(){
  gl_FragColor = texture2D(u_sampler, v_texCoord);
}