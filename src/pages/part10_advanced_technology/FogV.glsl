attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelMatrix;
// 眼睛的世界坐标
uniform vec4 u_eye;

varying float v_dist;
varying vec4 v_color;

void main() {
  gl_Position = u_mvpMatrix * a_position;
  v_color = a_color;
  // distance两点的距离
  v_dist = distance(u_modelMatrix * a_position, u_eye);
}