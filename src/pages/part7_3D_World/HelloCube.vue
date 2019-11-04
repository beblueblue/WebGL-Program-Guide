<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4 } from '@/utils/cuon-matrix'
import fGlsl from './LookAtTrianglesF.glsl';
import vGlsl from './perspectiveView_mvpMatrixV.glsl';

export default {
    name: 'HelloCube',
    mounted(){
        this.draw()
    },
    updated() {
        this.draw()
    },
    methods: {
        initVertexBuffers(gl) {
            // 顶点坐标
            const verticsAndColors = new Float32Array([
                 1.0,  1.0,  1.0, 1.0, 1.0, 1.0, // v0 白色
                -1.0,  1.0,  1.0, 1.0, 0.0, 1.0, // v1 品红色
                -1.0, -1.0,  1.0, 1.0, 0.0, 0.0, // v2 红色
                 1.0, -1.0,  1.0, 0.0, 1.0, 0.0, // v3 绿色
                 1.0, -1.0, -1.0, 0.0, 1.0, 1.0, // v4 棕色
                 1.0,  1.0, -1.0, 0.0, 0.0, 1.0, // v5 蓝色
                -1.0,  1.0, -1.0, 1.0, 1.0, 0.0, // v6 黄色
                -1.0, -1.0, -1.0, 0.0, 0.0, 0.0, // v7 黑色
            ])
            // 顶点索引
            const indices = new Uint8Array([
                0, 1, 2, 0, 2, 3, // 前
                0, 3, 4, 0, 4, 5, // 右
                0, 5, 6, 0, 6, 1, // 上
                1, 6, 7, 1, 7, 2, // 左
                7, 3, 2, 7, 4, 3, // 下
                4, 7, 6, 4, 6, 5, // 后
            ])
            // TypedArray数据BYTES_PER_ELEMENT属性，表示这种数据类型占据的字节数。
            const FSIZE = verticsAndColors.BYTES_PER_ELEMENT

            // 创建缓冲区对象
            const vertextColorBuffer = gl.createBuffer()
            const indexBuffer = gl.createBuffer()
            if(!vertextColorBuffer || !indexBuffer) {
                console.log('创建缓冲区对象失败')
                return -1
            }
            
            const a_position = gl.getAttribLocation(gl.program, 'a_position')
            if(a_position < 0) {
                console.log('获取“a_position”的存储位置失败')
                return false
            }
            const a_color = gl.getAttribLocation(gl.program, 'a_color')
            if(a_color < 0) {
                console.log('获取“a_color”的存储位置失败')
                return false
            }
            // 将顶点坐标和尺寸同时写入缓冲区对象并开启
            gl.bindBuffer(gl.ARRAY_BUFFER, vertextColorBuffer)
            // 想缓冲区对象写入数据
            // gl.STATIC_DRAW: 写入一次，绘制多次
            gl.bufferData(gl.ARRAY_BUFFER, verticsAndColors, gl.STATIC_DRAW)

            // 将顶点索引数据写入缓冲区对象
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

            // 将缓存区对象分配给attribute变量（a_position）
            gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 6, 0)
            // 连接a_position变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_position)
            // 将缓存区对象分配给attribute变量（a_color）
            gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
            // 连接a_color变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_color)

            return indices.length
        },
        draw() {
            const canvas = this.$refs.myCanvas
            const gl = getWebGLContext(canvas)

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

            // 获取u_mvpMatrix变量的存储位置
            const u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix')
            if(!u_mvpMatrix) {
                console.log('获取“u_mvpMatrix”的存储位置失败')
                return false
            }

            // 设置视点、视线和上方向
            const mvpMatrix = new Matrix4()
            mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
            mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)

            // 将视图矩阵传给u_mvpMatrix变量
            gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)

            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.enable(gl.DEPTH_TEST)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            // 绘制立方体
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
        },
    }
}
</script>
    