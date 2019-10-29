<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4 } from '@/utils/cuon-matrix'
import fGlsl from './LookAtRotatedTriangleF.glsl';
import vGlsl from './mvMatrixV.glsl';

export default {
    name: 'LookAtRotatedTriangle_mvMatrix',
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

        // 设置顶点位置 （蓝色三角形置前）
        const n = this.initVertexBuffers(gl);
        if(n < 0){
            console.log('设置顶点位置失败')
            return false
        }

        // 获取u_modelViewMatrix变量的存储位置
        const u_modelViewMatrix = gl.getUniformLocation(gl.program, 'u_modelViewMatrix')
        if(!u_modelViewMatrix) {
            console.log('获取“u_modelViewMatrix”的存储位置失败')
            return false
        }

        // 计算视点、视线和上方向
        const viewMatrix = new Matrix4()
        viewMatrix.setLookAt(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0)

        // 计算旋转矩阵
        const modelMatrix = new Matrix4()
        // 绕Z轴旋转
        modelMatrix.setRotate(-10, 0, 0, 1)

        const modelViewMatrix = viewMatrix.multiply(modelMatrix)

        // 将模型视图矩阵传给u_modelViewMatrix变量
        gl.uniformMatrix4fv(u_modelViewMatrix, false, modelViewMatrix.elements)

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 绘制n个点
        // n为3，绘制需要3个点
        // gl.drawArrays(gl.POINTS, 0, n);
        // // 此操作将绘制一个渐变色的三角形
        gl.drawArrays(gl.TRIANGLES, 0, n);
    },
    methods: {
        initVertexBuffers(gl) {
            // 顶点坐标
            const verticsAndColors = new Float32Array([
                0.0, 0.5, -0.4, 0.4, 1, 0.4, // 绿色三角形在最后面
                -0.5, -0.5, -0.4, 0.4, 1, 0.4,
                0.5, -0.5, -0.4, 1, 0.4, 0.4,

                0.5, 0.4, -0.2, 1, 0.4, 0.4, // 黄色三角形在中间
                -0.5, 0.4, -0.2, 1, 1, 0.4,
                0, -0.6, -0.2, 1, 1, 0.4,

                0, 0.5, 0, 0.4, 0.4, 1, // 蓝色三角形在最前面
                -0.5, -0.5, 0, 0.4, 0.4, 1,
                0.5, -0.5, 0, 1, 0.4, 0.4,
            ])
            // TypedArray数据BYTES_PER_ELEMENT属性，表示这种数据类型占据的字节数。
            const FSIZE = verticsAndColors.BYTES_PER_ELEMENT
            // 点的个数
            const n = 9

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
        }
    }
}
</script>
    