attribute vec4 a_position;
attribute vec4 a_color;
uniform mat4 u_modelViewMatrix;
varying vec4 v_color;

void main() {
    gl_Position = u_modelViewMatrix * a_position;
    v_color = a_color;
}