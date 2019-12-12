attribute vec4 a_position;
attribute vec4 a_color;
// 法向量
attribute vec4 a_normal;
// 模型矩阵
uniform mat4 u_modelMatrix;
uniform mat4 u_mvpMatrix;
// 法向量变换矩阵
uniform mat4 u_normalMatrix;

// 光线颜色
uniform vec3 u_lightColor;
// 点光源位置
uniform vec3 u_lightPosition;
// 环境光颜色
uniform vec3 u_ambientLight;
// 归一化的世界坐标
varying vec4 v_color;

void main() {
    gl_Position = u_mvpMatrix * a_position;
    // 法向量归一化
    vec3 normal = normalize(vec3(u_normalMatrix * a_normal));
    // 计算顶点世界坐标
    vec4 vertexPosition = u_modelMatrix * a_position;
    // 计算点光源方向并归一化
    vec3 lightDirection = normalize(u_lightPosition - vec3(vertexPosition));
    // 计算光线方向和法向量的点积, 正面灯光与法线永远小于Pi/2，将背面灯光置为0.0
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // 计算漫反射光的颜色: <漫反射光颜色> = <入射光颜色> x <表面基地色> x (<光线方向>·<法线法线>)
    vec3 diffuse = u_lightColor * a_color.rgb * nDotL;
    // 计算环境光的颜色：<入射光颜色> x <表面基地色>
    vec3 ambient = u_ambientLight * a_color.rgb;
    v_color = vec4(diffuse + ambient, a_color.a);
}