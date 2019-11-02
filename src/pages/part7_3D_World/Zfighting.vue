<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
        <div class="mt10"><a class="blue" @click="openPolygonOffset = !openPolygonOffset">{{ openPolygonOffset ? '关闭' : '开启'}}多边形偏移</a></div>
        <div class="mt10">
            顶点数组：
<pre>
    [
         0.0,  2.5, -5.0, 0.0, 1.0, 0.0, // 绿色三角形
        -2.5, -2.5, -5.0, 0.0, 1.0, 0.0,
         2.5, -2.5, -5.0, 1.0, 0.0, 0.0,

         0.0,  3.0, -5.0, 1.0, 0.0, 0.0, // 黄色三角形
        -3.0, -3.0, -5.0, 1.0, 1.0, 0.0,
         3.0, -3.0, -5.0, 1.0, 1.0, 0.0,
    ]
</pre>
        </div>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4 } from '@/utils/cuon-matrix'
import fGlsl from './LookAtTrianglesF.glsl';
import vGlsl from './perspectiveView_mvpMatrixV.glsl';

export default {
    name: 'Zfighting',
    data(){
        return {
            openPolygonOffset: true,
        }
    },
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
                 0.0,  2.5, -5.0, 0.0, 1.0, 0.0, // 绿色三角形
                -2.5, -2.5, -5.0, 0.0, 1.0, 0.0,
                 2.5, -2.5, -5.0, 1.0, 0.0, 0.0,

                 0.0,  3.0, -5.0, 1.0, 0.0, 0.0, // 黄色三角形
                -3.0, -3.0, -5.0, 1.0, 1.0, 0.0,
                 3.0, -3.0, -5.0, 1.0, 1.0, 0.0,

            ])
            // TypedArray数据BYTES_PER_ELEMENT属性，表示这种数据类型占据的字节数。
            const FSIZE = verticsAndColors.BYTES_PER_ELEMENT
            // 点的个数， 共2个三角形
            const n = 6

            // 创建缓冲区对象
            const vertextColorBuffer = gl.createBuffer()
            if(!vertextColorBuffer) {
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

            // 将缓存区对象分配给attribute变量（a_position）
            gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 6, 0)
            // 连接a_position变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_position)
            // 将缓存区对象分配给attribute变量（a_color）
            gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
            // 连接a_color变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_color)
            return n
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

            // 设置顶点位置 （蓝色三角形置前）
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
            const viewMatrix = new Matrix4()
            viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0)

            // 计算投影矩阵
            const projMatrix = new Matrix4()
            projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)

            // 计算模型矩阵
            const modelMatrix = new Matrix4()
            // 平移0.75单位
            // modelMatrix.setTranslate(0.75, 0, 0)

            const mvpMatrix = new Matrix4()

            mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix)
            // 将视图矩阵传给u_mvpMatrix变量
            gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)

            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT)
            if(this.openPolygonOffset) {
                // 开启多边形偏移
                gl.enable(gl.POLYGON_OFFSET_FILL)
                // 绘制绿色三角形
                gl.drawArrays(gl.TRIANGLES, 0, n/2)
                // 设置多边形偏移量
                gl.polygonOffset(1.0, 1.0);
                gl.drawArrays(gl.TRIANGLES, n/2, n/2)
            } else {
                gl.disable(gl.POLYGON_OFFSET_FILL)
                gl.drawArrays(gl.TRIANGLES, 0, n)
            }
        },
    }
}
</script>
    