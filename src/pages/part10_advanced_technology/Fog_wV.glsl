attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_mvpMatrix;

varying float v_dist;
varying vec4 v_color;

void main() {
  gl_Position = u_mvpMatrix * a_position;
  v_color = a_color;
  // 视点到顶点的距离：就是视图坐标系的负Z值
  v_dist = gl_Position.w;
}