attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_mvpMatrix;
uniform bool u_clicked;

varying vec4 v_color;

void main() {
    gl_Position = u_mvpMatrix * a_position;
    if(u_clicked) {
      v_color = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
      v_color = a_color;
    }
}