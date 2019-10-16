<template>
    <div>
        <canvas ref="myCanvas"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './DrawPointF.glsl';
import vGlsl from './DrawPointV2.glsl';

export default {
    name: 'DrawPoint2',
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

        // 获取attribute变量的存储位置
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
        const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
        if(a_Position < 0) {
            console.log('获取“a_Position”的存储位置失败')
            return false
        }

        // 将顶点位置传输给attribute变量
        // gl.vertexAttrib3f(a_Position, 0.5, 0.5, 0.0)
        gl.vertexAttrib1f(a_PointSize, 50)

        // 利用类型化数组来传递顶点位置
        const positions = new Float32Array([0.0, 0.0, 0.0, 1.0])
        gl.vertexAttrib4fv(a_Position, positions)

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 绘制一个点
        gl.drawArrays(gl.POINTS, 0, 1);
    },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {

}
</style>
    