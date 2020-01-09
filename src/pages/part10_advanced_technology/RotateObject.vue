<template>
  <div>
      <canvas ref="myCanvas" width="300" height="300"></canvas>
  </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4, Vector3 } from '@/utils/cuon-matrix'
import beforeRouteLeave from '@/mixins/beforeRouteLeave'
import fGlsl from './rotateF.glsl';
import vGlsl from './rotateV.glsl';

export default {
  name: 'RotateObject',
  data() {
      return {
          gl: null,
          n: -1,
          texture: null,
          img: null,
          u_mvpMatrix: null,
          u_sampler: null,
          viewProjMatrix: new Matrix4(),
          mvpMatrix: new Matrix4(),
          // 缓存角度值
          currentAngle: [0.0, 0.0],
          baseAngle: 200,
      }
  },
  mounted(){
      if(!this.registryVars()) {
          return false
      }
      // 事件注册
      this.initEventHandles()
      // 导入纹理
      if(!this.initTextures()) {
        return false
      }
      // 开始绘制
      this.animate()
  },
  mixins: [beforeRouteLeave],
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
          if(!u_mvpMatrix) {
              console.log('获取“u_mvpMatrix”的存储位置失败')
              return false
          }

          this.viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
          this.viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

          gl.clearColor(0.0, 0.0, 0.0, 1.0)
          gl.enable(gl.DEPTH_TEST)

          this.gl = gl
          this.n = n
          this.u_mvpMatrix = u_mvpMatrix

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
          // 纹理坐标
          const texCoords = new Float32Array([
            1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
            0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
            1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
            1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
            0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
            0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
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
          if(!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_texCoord')) {
              return -1
          }
          const indexBuffer = gl.createBuffer()
          if(!indexBuffer) {
              console.log('创建缓冲区对象失败')
              return false
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
        const { currentAngle, baseAngle } = this;
        const { myCanvas: canvas } = this.$refs;

        let dragging = false;
        let lastX = -1;
        let lastY = -1;

        canvas.onmousedown = function(ev){
          // 防止触发拖拽事件
          ev.preventDefault();
          lastX = ev.clientX;
          lastY= ev.clientY;

          dragging = true;
        };
        canvas.onmouseup = canvas.onmouseleave = function() { dragging = false };
        canvas.onmousemove = function(ev) {
          if(dragging) {
            const x = ev.clientX;
            const y = ev.clientY;

            // the rotation ratio
            const factor = baseAngle / canvas.height;
            const dx = factor * (x - lastX);
            const dy = factor * (y - lastY);
            // 现在x-轴旋转角度，[-90, 90]
            currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90), -90)
            currentAngle[1] += dx;

            lastX = x;
            lastY = y;
          }
        }
      },
      initTextures(){
        const { gl } = this;
        // 创建纹理对象
        const texture = gl.createTexture();
        if(!texture) {
          console.log('创建纹理对象失败')
          return false
        }

        // 获取“u_sampler”的存储位置
        const u_sampler = gl.getUniformLocation(gl.program, 'u_sampler')
        if(!u_sampler) {
          console.log('获取“u_sampler”的存储位置失败')
          return false
        }
        // 创建Image对象
        const img = new Image()
        if(!img) {
          console.log('创建Image对象失败')
          return false
        }
        img.onload = () => {
          this.loadeTexture()
        }
        img.src = '/images/sky.jpg'
        
        this.texture = texture
        this.u_sampler = u_sampler
        this.img = img

        return true
      },
      loadeTexture() {
        const { gl, texture, img } = this
        // Y轴翻转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
        // 激活纹理单元（0）
        gl.activeTexture(gl.TEXTURE0)
        // texture指定的纹理对象，绑定到target上
        gl.bindTexture(gl.TEXTURE_2D, texture)

        // 设置纹理配置参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        // 将image指定的图像，分配给绑定到target（ TEXTURE_2D ）上的对象（ TEXTURE0 ）
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      },
      draw() {
          const { gl, n, currentAngle, viewProjMatrix, mvpMatrix, u_mvpMatrix } = this
          mvpMatrix.set(viewProjMatrix)
          // 绕X轴旋转
          mvpMatrix.rotate(currentAngle[0], 1, 0, 0)
          // 绕Y轴旋转
          mvpMatrix.rotate(currentAngle[1], 0, 1, 0)
          gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)


          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
      },
      animate() {
        const { animate } = this
        if(this.animateID) {
          cancelAnimationFrame(this.animateID);
        }

        this.draw()
        this.animateID = requestAnimationFrame(animate)
      }
  }
}
</script>
