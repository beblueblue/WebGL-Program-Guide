<template>
    <div>
        <canvas ref="myCanvas" @click="drawPoint($event)"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './DrawPointF.glsl';
import vGlsl from './DrawPointV2.glsl';

export default {
    name: 'DrawPoint',
    data() {
        return {
            gl: null,
            a_Position: 0,
            points: []
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

        // 获取attribute变量的存储位置
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
        const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
        if(a_Position < 0) {
            console.log('获取“a_Position”的存储位置失败')
            return false
        }

        // 将顶点位置传输给attribute变量
        // gl.vertexAttrib3f(a_Position, 0.5, 0.5, 0.0)
        gl.vertexAttrib1f(a_PointSize, 10)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gl = gl;
        this.a_Position = a_Position;
    },
    methods: {
        drawPoint(event) {
            const {gl, a_Position} = this;
            const clientX = event.clientX
            const clientY = event.clientY
            const canvas = event.target
            const { left, top } = canvas.getBoundingClientRect();
            const { width, height } = canvas;
            let x = (clientX - left - width/2)/ (width/2);
            let y = -(clientY - top - height/2)/ (height/2);

            this.points.push(x, y);
            // 清空当前画布
            gl.clear(gl.COLOR_BUFFER_BIT);
            for(let i = 0, len = this.points.length; i < len; i += 2) {
                const x = this.points[i];
                const y = this.points[i+1];

                gl.vertexAttrib3f(a_Position, x, y, 0.0)
                gl.drawArrays(gl.POINTS, 0, 1);
            }
        },
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas {
    background: black;
}
</style>
    