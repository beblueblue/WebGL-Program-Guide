precision mediump float;
// 光线颜色
uniform vec3 u_lightColor;
// 点光源位置
uniform vec3 u_lightPosition;
// 环境光颜色
uniform vec3 u_ambientLight;

varying vec3 v_normal;
varying vec3 v_position;
varying vec4 v_color;

void main() {
    // 对法线归一化，因为其内插之后长度不一定是1.0
    vec3 normal = normalize(v_normal);
    // 计算点光源方向并归一化
    vec3 lightDirection = normalize(u_lightPosition - v_position);
    // 计算光线方向和法向量的点积, 正面灯光与法线永远小于Pi/2，将背面灯光置为0.0
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // 计算漫反射光的颜色: <漫反射光颜色> = <入射光颜色> x <表面基地色> x (<光线方向>·<法线法线>)
    vec3 diffuse = u_lightColor * v_color.rgb * nDotL;
    // 计算环境光的颜色：<入射光颜色> x <表面基地色>
    vec3 ambient = u_ambientLight * v_color.rgb;
    gl_FragColor = vec4(diffuse + ambient,v_color.a);
}