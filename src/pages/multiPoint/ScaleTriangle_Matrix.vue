<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './MultiPointF.glsl';
import vGlsl from './MatrixV.glsl';

export default {
    name: 'ScaleTriangle_Matrix',
    mounted(){
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

        // 设置顶点位置
        const n = this.initVertexBuffers(gl);
        if(n < 0){
            console.log('设置顶点位置失败')
            return false
        }

        const scaleX = 0.5
        const scaleY = 0.5
        const scaleZ = 1

        // 注意WebGL中矩阵是列主序的
        const xformMatrix = new Float32Array([
            scaleX, 0.0, 0.0, 0.0,
            0.0, scaleY, 0.0, 0.0,
            0.0, 0.0, scaleZ, 0.0,
            0.0, 0.0, 0.0, 1.0
        ])
        // 将旋转矩阵传输给顶点着色器
        const u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix')
        if(!u_Matrix) {
            console.log('获取“u_Matrix”的存储位置失败')
            return false
        }
        gl.uniformMatrix4fv(u_Matrix, false, xformMatrix)
        
        // 设置背景色
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);


        // 绘制一个点
        // n为3，绘制需要3个点
        gl.drawArrays(gl.TRIANGLES, 0, n);
    },
    methods: {
        initVertexBuffers(gl) {
            // 顶点坐标
            const vertics = new Float32Array([
                0.0, 0.5,
                -0.5, -0.5,
                0.5, -0.5
            ])
            // 点的个数
            const n = 3

            // 创建缓冲区对象
            const vertextBuffer = gl.createBuffer()
            if(!vertextBuffer) {
                console.log('创建缓冲区对象失败')
                return -1
            }

            // 将缓冲区对象绑定到目标
            gl.bindBuffer(gl.ARRAY_BUFFER, vertextBuffer)

            // 想缓冲区对象写入数据
            // gl.STATIC_DRAW: 写入一次，绘制多次
            gl.bufferData(gl.ARRAY_BUFFER, vertics, gl.STATIC_DRAW)

            const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
            if(a_Position < 0) {
                console.log('获取“a_Position”的存储位置失败')
                return false
            }

            // 将缓存区对象分配给attribute变量（a_Position）
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)

            // 连接a_Position变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_Position)

            return n
        }
    }
}
</script>
        