<template>
  <div>
    <canvas ref="myCanvas" width="400" height="400"></canvas>
    <div class="mt10 f14">（↑↓）：增加/减少雾化距离</div>
  </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4, Vector3, Vector4 } from '@/utils/cuon-matrix'
import beforeRouteLeave from '@/mixins/beforeRouteLeave'
import fGlsl from './FogF.glsl';
import vGlsl from './FogV.glsl';
export default {
  name: 'Fog',
  data() {
      return {
          gl: null,
          n: -1,
          u_mvpMatrix: null,
          u_modelMatrix: null,
          u_fogDist: null,
          fogDist: null,
      }
  },
  mounted(){
    const { registryVars, initEventHandles, draw } = this
      if(!registryVars()) {
          return false
      }
      // 事件注册
      initEventHandles()
      // 开始绘制
      draw()
  },
  mixins: [beforeRouteLeave],
  beforeRouteLeave(to, from, next) {
      document.onkeydown = null;
      next()
  },
  methods: {
      registryVars() {
          const canvas = this.$refs.myCanvas
          const gl = getWebGLContext(canvas)
          const _this = this

          if(!gl) {
              console.log('获取webGL对象失败')
              return false
          }

          if(!initShaders(gl, vGlsl, fGlsl)) {
              console.log('初始化着色器失败')
              return false
          }

          const n = this.initVertexBuffers(gl)
          if(n < 0){
              console.log('设置顶点位置失败')
              return false
          }

          // 获取 uniform 变量的存储位置
          const u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix')
          const u_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix')
          const u_fogColor = gl.getUniformLocation(gl.program, 'u_fogColor')
          const u_fogDist = gl.getUniformLocation(gl.program, 'u_fogDist')
          const u_eye = gl.getUniformLocation(gl.program, 'u_eye')
          // 定义雾的颜色、起点距离和终点距离、视点的世界坐标
          const fogColor = new Float32Array([0.137, 0.231, 0.423])
          const fogDist = new Float32Array([55, 80])
          const eye = new Float32Array([25, 65, 35, 1])
          if(!u_mvpMatrix || 
            !u_modelMatrix || 
            !u_fogColor || 
            !u_fogDist || 
            !u_eye) {
              console.log('获取 uniform 变量的存储位置失败')
              return false
          }

          // 将雾相关信息传入着色器中， uniform 变量
          gl.uniform3fv(u_fogColor, fogColor)
          gl.uniform2fv(u_fogDist, fogDist)
          gl.uniform4fv(u_eye, eye)

          gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0)
          // 开启隐藏面消除功能
          gl.enable(gl.DEPTH_TEST)

          // 构建模型矩阵
          var modelMatrix = new Matrix4()
          modelMatrix.setScale(10, 10, 10)
          gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements)

          // 构建 mvp 矩阵
          const mvpMatrix = new Matrix4()
          mvpMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 1000.0)
          mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0.0, 2, 0.0, 0.0, 1.0, 0.0)
          mvpMatrix.multiply(modelMatrix)
          gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)

          this.gl = gl
          this.n = n
          this.u_fogDist = u_fogDist
          this.fogDist = fogDist

          return true
      },
      initVertexBuffers(gl) {
          const { initArrayBuffer } = this

          // Create a cube
          //    v6----- v5
          //   /|      /|
          //  v1------v0|
          //  | |     | |
          //  | |v7---|-|v4
          //  |/      |/
          //  v2------v3
          // 顶点坐标
          const vertices = new Float32Array([
            1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
            1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
            1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
            -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
            -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
            1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
          ]);
          // 颜色索引
          var colors = new Float32Array([     // Colors
            0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front
            0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right
            1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up
            1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
            1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
            0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
          ]);
          // 顶点索引
          const indices = new Uint8Array([
            0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // up
            12,13,14,  12,14,15,    // left
            16,17,18,  16,18,19,    // down
            20,21,22,  20,22,23     // back
          ])

          if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_position')) {
              return -1
          }
          if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_color')) {
              return -1
          }
          const indexBuffer = gl.createBuffer()
          if(!indexBuffer) {
              console.log('创建缓冲区对象失败')
              return -1
          }
          // 解绑buffer对象
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          // 将顶点索引数据写入缓冲区对象
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

          return indices.length
      },
      /**
       * 封装缓冲区操作
       * @params: gl -- Object, WebGL对象
       * @params: data -- DataBuffer, 需要填入的数据
       * @params: num -- Number, 每个顶点所需的数据个数
       * @params: type -- String, 数据格式
       * @params: attribute -- String, attribute变量名称
       * @return false -- 操作出错
       *         true -- 操作成功
       */ 
      initArrayBuffer(gl, data, num, type, attribute) {
          const buffer = gl.createBuffer()
          if(!buffer) {
              console.log('创建缓冲区对象失败')
              return false
          }
          const a_attribute = gl.getAttribLocation(gl.program, attribute)
          if(a_attribute < 0) {
              console.log(`获取“${attribute}”的存储位置失败`)
              return false
          }
          // 将顶点索引数据写入缓冲区对象
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
          // 将缓存区对象分配给attribute变量
          gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
          // 连接a_color变量和分配给它的缓冲区对象
          gl.enableVertexAttribArray(a_attribute)

          return true
      },
      initEventHandles() {
        const { draw, gl, u_fogDist, fogDist } = this;

        document.onkeydown = (ev) => {
          switch (ev.keyCode) {
            case 38: // Up arrow key -> Increase the maximum distance of fog
              fogDist[1]  += 1;
              break;
            case 40: // Down arrow key -> Decrease the maximum distance of fog
              if (fogDist[1] > fogDist[0]) {
                fogDist[1] -= 1;
              }
              break;
            default: return;
          }
          // 传递 u_fogDist 变量到着实器
          gl.uniform2fv(u_fogDist, fogDist);
          draw();
        }
      },
      draw() {
        const { n, gl } = this
        // 清空颜色和深度缓冲
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
      }
  }
}
</script>
  