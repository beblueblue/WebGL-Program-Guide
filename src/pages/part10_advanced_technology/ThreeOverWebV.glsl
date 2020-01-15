attribute vec4 a_position;
attribute vec4 a_color;

// 表面编号（不可使用ini类型）, 已经与定点索引绑定
attribute float a_face;

// 被选中表面的编号
uniform int u_pickedFace;

uniform mat4 u_mvpMatrix;

varying vec4 v_color;

void main() {
  gl_Position = u_mvpMatrix * a_position;
  // 类型转换
  int face = int(a_face);
  vec3 color = (face == u_pickedFace) ? vec3(1.0, 0, 0) : a_color.rgb;

  // 将表面编号信息写入a分量
  if(u_pickedFace == 0) {
    // gl.readPixels会将color归一化值，乘255，
    // 所以这里要做一个倍数转化
    v_color = vec4(color, a_face / 255.0);
  } else {
    v_color = vec4(color, a_color.a / 1.5);
  }
}