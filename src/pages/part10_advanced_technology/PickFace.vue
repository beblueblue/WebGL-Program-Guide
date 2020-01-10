<template>
  <div>
      <canvas ref="myCanvas" width="300" height="300"></canvas>
      <div class="mt10 f14">canvas点击事件：<span :class="faceName ? 'blue' : 'red'">{{ faceName || '未点中物体表面' }}</span></div>
  </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4, Vector3 } from '@/utils/cuon-matrix'
import beforeRouteLeave from '@/mixins/beforeRouteLeave'
import fGlsl from './PickFaceF.glsl';
import vGlsl from './PickFaceV.glsl';
export default {
  name: 'PickFace',
  data() {
      return {
          gl: null,
          n: -1,
          u_mvpMatrix: null,
          u_pickedFace: null,
          viewProjMatrix: new Matrix4(),
          mvpMatrix: new Matrix4(),
          // 缓存角度值
          currentAngle: 0,
          ANGLE_STEP: 20,
          // 点击到的物体表面
          currentFace: 255,
          // 时间缓存
          lastTime: performance.now(),
      }
  },
  mounted(){
    const { registryVars, initEventHandles, animate } = this
      if(!registryVars()) {
          return false
      }
      // 事件注册
      initEventHandles()
      // 开始绘制
      animate()
  },
  mixins: [beforeRouteLeave],
  computed: {
    faceName() {
      const { currentFace } = this
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3
      const faceNameMap = {
        1: '前表面',
        2: '右表面',
        3: '上表面',
        4: '左表面',
        5: '下表面',
        6: '后表面',
      }
      return faceNameMap[currentFace]
    }
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

          // 获取uniform变量的存储位置
          const u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix')
          const u_pickedFace = gl.getUniformLocation(gl.program, 'u_pickedFace')
          if(!u_mvpMatrix) {
              console.log('获取“u_mvpMatrix”的存储位置失败')
              return false
          }
          if(!u_pickedFace) {
              console.log('获取“u_pickedFace”的存储位置失败')
              return false
          }

          this.viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
          this.viewProjMatrix.lookAt(0, 0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

          // u_pickedFace 初始传入-1
          gl.uniform1i(u_pickedFace, -1)

          gl.clearColor(0.0, 0.0, 0.0, 1.0)
          gl.enable(gl.DEPTH_TEST)

          this.gl = gl
          this.n = n
          this.u_mvpMatrix = u_mvpMatrix
          this.u_pickedFace = u_pickedFace

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
          const colors = new Float32Array([
            0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
            0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
            0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
            0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
            0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
            0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
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
          // 面索引
          const faces = new Uint8Array([
            1, 1, 1, 1,     // v0-v1-v2-v3 front
            2, 2, 2, 2,     // v0-v3-v4-v5 right
            3, 3, 3, 3,     // v0-v5-v6-v1 up
            4, 4, 4, 4,     // v1-v6-v7-v2 left
            5, 5, 5, 5,     // v7-v4-v3-v2 down
            6, 6, 6, 6,     // v4-v7-v6-v5 back
          ])

          if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_position')) {
              return -1
          }
          if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_color')) {
              return -1
          }
          // gl.UNSIGNED_BYTE 
          if(!initArrayBuffer(gl, faces, 1, gl.UNSIGNED_BYTE, 'a_face')) {
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
        const { gl, u_pickedFace, checkFace, draw } = this;
        const { myCanvas: canvas } = this.$refs;

        canvas.onmousedown = (ev) => {
          // 防止触发拖拽事件
          ev.preventDefault()
          const x = ev.clientX
          const y = ev.clientY
          const rect = ev.target.getBoundingClientRect()

          // 以canvas左下角为原点，竖直向上为Y轴正方向？
          // 投影矩阵做了Y轴的翻转和平移吗？
          const xInCanvas = x - rect.left
          const yInCanvas = rect.bottom - y
          // 检查是否点到了物体的哪个表面
          let currentFace = checkFace(xInCanvas, yInCanvas)

          gl.uniform1i(u_pickedFace, currentFace)
          draw()
          this.currentFace = currentFace
        }
      },
      checkFace(x, y) {
        const { gl, u_pickedFace, draw } = this
        // 缓存像素值
        const pixels = new Uint8Array(4)
        // 将顶点面信息，绘制到a通道里
        gl.uniform1i(u_pickedFace, 0)
        draw()
        // 读取点击位置的像素
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        
        return pixels[3]
      },
      draw() {
          const { gl, n, currentAngle, viewProjMatrix, mvpMatrix, u_mvpMatrix } = this
          mvpMatrix.set(viewProjMatrix)
          // 绕X轴旋转
          mvpMatrix.rotate(currentAngle, 1, 0, 0)
          // 绕Y轴旋转
          mvpMatrix.rotate(currentAngle, 0, 1, 0)
          // 绕Z轴翻转
          mvpMatrix.rotate(currentAngle, 0, 0, 1)
          gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)

          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
      },
      animate() {
        const { animate, lastTime, currentAngle, ANGLE_STEP, draw } = this
        if(this.animateID) {
          cancelAnimationFrame(this.animateID);
        }
        const currentTime = performance.now()
        const elaped = currentTime -lastTime
        const newAngle = currentAngle + (ANGLE_STEP * elaped) / 1000

        this.lastTime = currentTime
        this.currentAngle = newAngle
        draw()
        this.animateID = requestAnimationFrame(animate)
      }
  }
}
</script>
