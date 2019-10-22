attribute vec4 a_Position;
attribute vec2 a_TexCoord;
 
uniform mat4 u_Matrix;
uniform mat4 u_TextureMatrix;
 
varying vec2 v_Texcoord;
 
void main() {
   gl_Position = u_Matrix * a_Position;
   v_Texcoord = (u_TextureMatrix * vec4(a_TexCoord, 0, 1)).xy;
}