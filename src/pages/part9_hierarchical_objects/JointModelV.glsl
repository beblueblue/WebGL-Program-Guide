attribute vec4 a_position;
attribute vec4 a_color;
// 法向量
attribute vec4 a_normal;

uniform mat4 u_mvpMatrix;
// 法向量变换矩阵
uniform mat4 u_normalMatrix;

// 归一化的世界坐标
varying vec4 v_color;

void main() {
    gl_Position = u_mvpMatrix * a_position;
    // 法向量归一化
    vec3 normal = normalize(vec3(u_normalMatrix * a_normal));
    // 静态定义平行光源方向并归一化
    vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));
    // 静态定义光源颜色
    vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
    // 计算光线方向和法向量的点积, 正面灯光与法线永远小于Pi/2，将背面灯光置为0.0
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // 计算漫反射光的颜色: <漫反射光颜色> = <入射光颜色> x <表面基地色> x (<光线方向>·<法线法线>)
    // 模型底色定义为(1.0, 1.0, 1.0)
    vec3 diffuse = color.rgb * nDotL;
    // 静态定义环境光的颜色
    vec3 ambient = vec3(0.1);
    v_color = vec4(diffuse + ambient, color.a);
}