<template>
    <div>
        <canvas ref="myCanvas"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './DrawPointF.glsl';
import vGlsl from './DrawPointV.glsl';

export default {
    name: 'DrawPoint',
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
