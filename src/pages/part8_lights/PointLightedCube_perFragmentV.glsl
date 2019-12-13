attribute vec4 a_position;
attribute vec4 a_normal;
attribute vec4 a_color;
// 模型矩阵
uniform mat4 u_modelMatrix;
uniform mat4 u_mvpMatrix;
// 法向量变换矩阵
uniform mat4 u_normalMatrix;

varying vec3 v_normal;
varying vec3 v_position;
varying vec4 v_color;

void main() {
    gl_Position = u_mvpMatrix * a_position;
    // 计算顶点世界坐标和法向量
    v_position = vec3(u_modelMatrix * a_position);
    v_normal = normalize(vec3(u_normalMatrix * a_normal));
    v_color = a_color;
}