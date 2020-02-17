// 检查OpenGL ES 2.0的支持
#ifdef GL_ES
  precision mediump float;
#endif

// 雾的颜色
uniform vec3 u_fogColor;
// 雾的起止点
uniform vec2 u_fogDist;

varying vec4 v_color;
varying float v_dist;

void main(){
  // 计算雾化因子
  // <雾化因子> = （<终点> - <当前点与视点间的距离>）/（<终点> - <起点>）
  float fogFactor = clamp((u_fogDist.y - v_dist) / (u_fogDist.y - u_fogDist.x), 0.0, 1.0);
  // 计算片元颜色
  // <片元颜色> = <物体表面颜色> x <雾化因子> + <雾的颜色> x （1 - <雾化因子>）
  // T mix(T x, T y, T a) 或 T mix(T x, T y, foat a) 
  // 返回x和y的线性混合: x * (1-a) + y * a
  vec3 color = mix(u_fogColor, vec3(v_color), fogFactor);
  gl_FragColor = vec4(color, v_color.a);
}