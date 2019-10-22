<template>
    <div>
        <canvas ref="myCanvas" width="600" height="600"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './MultiTextureF.glsl';
import vGlsl from './MultiTextureV.glsl';

export default {
    name: 'MultiTexture',
    data() {
        return {
            g_texUnit0: false,
            g_texUnit1: false,
        }
    },
    mounted(){
        const { initVertexBuffers, initTextures } = this;
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
        const n = initVertexBuffers(gl);
        if(n < 0){
            console.log('设置顶点位置失败')
            return false
        }
        // 配置纹理
        if(!initTextures(gl, n)) {
            console.log('配置纹理失败')
            return false
        }
    },
    methods: {
        initVertexBuffers(gl) {
            const verticesTexCoords = new Float32Array([
                // 顶点坐标， 纹理坐标
                -0.5, 0.5, 0.0, 1.0,
                -0.5, -0.5, 0.0, 0.0,
                0.5, 0.5, 1.0, 1.0,
                0.5, -0.5, 1.0, 0.0,
            ])
            // TypedArray数据BYTES_PER_ELEMENT属性，表示这种数据类型占据的字节数。
            const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
            // 点的个数
            const n = 4

            // 创建缓冲区对象
            const vertextTexCoordBuffer = gl.createBuffer()
            if(!vertextTexCoordBuffer) {
                console.log('创建缓冲区对象失败')
                return -1
            }
            
            const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
            if(a_Position < 0) {
                console.log('获取“a_Position”的存储位置失败')
                return false
            }
            // 将纹理坐标分配给a_TexCoord
            const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
            if(a_TexCoord < 0) {
                console.log('获取“a_TexCoord”的存储位置失败')
                return false
            }

            // 将顶点坐标和尺寸同时写入缓冲区对象并开启
            gl.bindBuffer(gl.ARRAY_BUFFER, vertextTexCoordBuffer)
            // 想缓冲区对象写入数据
            // gl.STATIC_DRAW: 写入一次，绘制多次
            gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)

            // 将缓存区对象分配给attribute变量（a_Position）
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
            // 连接a_Position变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_Position)
            // 将缓存区对象分配给attribute变量（a_TexCoord）
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
            // 连接a_TexCoord变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_TexCoord)
            return n
        },
        initTextures(gl, n) {
            const { loadTexture } = this;
            // 创建纹理坐标
            const texture0 = gl.createTexture();
            const texture1 = gl.createTexture();
            if(!texture0 || !texture1) {
                console.log('创建纹理对象失败')
                return false
            }
            // 获取u_Sampler0的存储位置
            const u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0')
            if(!u_Sampler0) {
                console.log('获取u_Sampler0存储位置失败')
                return false
            }
            // 获取u_Sampler1的存储位置
            const u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1')
            if(!u_Sampler1) {
                console.log('获取u_Sampler1存储位置失败')
                return false
            }
            // 创建一个image对象
            const image0 = new Image()
            const image1 = new Image()
            if(!image0 || !image1) {
                console.log('创建image失败')
                return false
            }
    
            // 注册图像加载后的回调函数
            image0.onload = function () {
                loadTexture(gl, n, texture0, u_Sampler0, image0, 0)
            }
            image1.onload = function () {
                loadTexture(gl, n, texture1, u_Sampler1, image1, 1)
            }
            // 开始加载图像
            image0.src = '/images/UV_Grid_Sm.jpg'
            image1.src = '/images/center_trans.png'
    
            return true
        },
        loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
            // 对纹理图像进行Y轴反转
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
            if(texUnit === 0) {
                // 开启0号纹理单元
                gl.activeTexture(gl.TEXTURE0)
                this.g_texUnit0 = true;
            }else {
                // 开启1号纹理单元
                gl.activeTexture(gl.TEXTURE1)
                this.g_texUnit1 = true;
            }
            // 向target绑定纹理对象
            gl.bindTexture(gl.TEXTURE_2D, texture)
    
            // 配置纹理参数
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            // 纹理x, y轴重复方式为：使用纹理图像边缘值
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // 配置纹理图像
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image) 
            
            // 将0号纹理传递给着色器
            gl.uniform1i(u_Sampler, texUnit)

            // 设置背景色
            gl.clearColor(0.0,0.0,0.0,1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // 绘制矩形
            if (this.g_texUnit0 && this.g_texUnit1) {
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
            }
        }
    },
}
</script>

<style scoped>
    canvas {
        width: 300px;
        height: 300px;
    }
</style>
    