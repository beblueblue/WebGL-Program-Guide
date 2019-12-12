<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4 } from '@/utils/cuon-matrix'
import fGlsl from './MatrixF.glsl';
import vGlsl from './MatrixV.glsl';

export default {
    name: 'RotatingTriangle',
    data() {
        return {
            currentAngle: 0,
            modelMatrix: new Matrix4(),
            animateID: null,
            gl: null,
            n: 0,
            u_ModelMatrix: -1,
            // 定义旋转速度
            ANGLE_STEP: 45,
            // 记录最后一次绘制的时间
            g_last: null,
        }
    },
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

        // 将旋转矩阵传输给顶点着色器
        const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
        if(!u_ModelMatrix) {
            console.log('获取“u_ModelMatrix”的存储位置失败')
            return false
        }
        
        // 设置背景色
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // 变量绑定
        this.u_ModelMatrix = u_ModelMatrix
        this.gl = gl
        this.n = n
        // 记录时间
        this.g_last = Date.now()

        // 执行动画
        this.render()
    },
    methods: {
        render() {
            const { animate, draw, n, gl, modelMatrix, u_ModelMatrix } = this
            if(this.animateID) {
                cancelAnimationFrame(this.animateID)
            }
            
            // 更新角度
            this.currentAngle = animate(this.currentAngle)
            // 绘制图像
            draw(gl, n, this.currentAngle, modelMatrix, u_ModelMatrix)
            this.animateID = requestAnimationFrame(this.render)
        },
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
            // 设置旋转矩阵
            modelMatrix.setRotate(currentAngle, 0, 0, 1)
            modelMatrix.translate(0.5, 0, 0)

            // 将旋转矩阵传递给顶点着色器
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
            // 清除当前<canvas>
            gl.clear(gl.COLOR_BUFFER_BIT);
            // 绘制三角形
            gl.drawArrays(gl.TRIANGLES, 0, n)
        },
        animate(angle) {
            const { ANGLE_STEP } = this
            const now = Date.now()
            const elapsed = now - this.g_last

            this.g_last = now
            return angle + (ANGLE_STEP * elapsed) / 1000
        },
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
        