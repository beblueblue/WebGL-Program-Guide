<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './ColoredSizeF.glsl';
import vGlsl from './ColoredSizeV.glsl';

export default {
    name: 'ColoredPoint',
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

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 绘制n个点
        // n为3，绘制需要3个点
        gl.drawArrays(gl.POINTS, 0, n);
        // 此操作将绘制一个渐变色的三角形
        gl.drawArrays(gl.TRIANGLES, 0, n);
    },
    methods: {
        initVertexBuffers(gl) {
            // 顶点坐标
            const verticsAndSizesColors = new Float32Array([
                0.0, 0.5, 10, 1, 0, 0,
                -0.5, -0.5, 20, 0, 1, 0,
                0.5, -0.5, 30, 0, 0, 1
            ])
            // TypedArray数据BYTES_PER_ELEMENT属性，表示这种数据类型占据的字节数。
            const FSIZE = verticsAndSizesColors.BYTES_PER_ELEMENT
            // 点的个数
            const n = 3

            // 创建缓冲区对象
            const vertextSizeColorBuffer = gl.createBuffer()
            if(!vertextSizeColorBuffer) {
                console.log('创建缓冲区对象失败')
                return -1
            }
            
            const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
            if(a_Position < 0) {
                console.log('获取“a_Position”的存储位置失败')
                return false
            }
            const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
            if(a_PointSize < 0) {
                console.log('获取“a_PointSize”的存储位置失败')
                return false
            }
            const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
            if(a_Color < 0) {
                console.log('获取“a_Color”的存储位置失败')
                return false
            }
            // 将顶点坐标和尺寸同时写入缓冲区对象并开启
            gl.bindBuffer(gl.ARRAY_BUFFER, vertextSizeColorBuffer)
            // 想缓冲区对象写入数据
            // gl.STATIC_DRAW: 写入一次，绘制多次
            gl.bufferData(gl.ARRAY_BUFFER, verticsAndSizesColors, gl.STATIC_DRAW)

            // 将缓存区对象分配给attribute变量（a_Position）
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0)
            // 连接a_Position变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_Position)
            // 将缓存区对象分配给attribute变量（a_PointSize）
            gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2)
            // 连接a_PointSize变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_PointSize)
            // 将缓存区对象分配给attribute变量（a_Color）
            gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
            // 连接a_Color变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_Color)
            return n
        }
    }
}
</script>
    