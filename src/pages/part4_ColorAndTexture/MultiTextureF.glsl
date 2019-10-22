precision mediump float;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
varying vec2 v_TexCoord;

void main() {
    vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
    vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
    float r = color1.w * color1.x + (1.0 - color1.w) * color0.x;
    float g = color1.w * color1.y + (1.0 - color1.w) * color0.y;
    float b = color1.w * color1.z + (1.0 - color1.w) * color0.z;
    gl_FragColor = vec4(r, g, b ,1.0);//color0 * color1;
}