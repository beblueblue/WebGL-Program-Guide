<template>
    <div>
        <canvas ref="myCanvas" width="600" height="600"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './TextrueQuadF.glsl';
import vGlsl from './TextrueQuadV.glsl';

export default {
    name: 'TextureQuad_Repeat',
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
                -0.5, 0.5, -0.3, 1.7,
                -0.5, -0.5, -0.3, -0.2,
                0.5, 0.5, 1.7, 1.7,
                0.5, -0.5, 1.7, -0.2,
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
            const texture = gl.createTexture();
            if(!texture) {
                console.log('创建纹理对象失败')
                return false
            }
            // 获取u_Sampler的存储位置
            const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
            if(!u_Sampler) {
                console.log('获取u_Sampler存储位置失败')
                return false
            }
            // 创建一个image对象
            const image = new Image()
            if(!image) {
                console.log('创建image失败')
                return false
            }
    
            // 注册图像加载后的回调函数
            image.onload = function () {
                loadTexture(gl, n, texture, u_Sampler, image)
            }
            // 开始加载图像
            image.src = '/images/UV_Grid_Sm.jpg'
    
            return true
        },
        loadTexture(gl, n, texture, u_Sampler, image) {
            // 对纹理图像进行Y轴反转
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
            // 开启0号纹理单元
            gl.activeTexture(gl.TEXTURE0)
            // 向target绑定纹理对象
            gl.bindTexture(gl.TEXTURE_2D, texture)
    
            // 配置纹理参数
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            // 纹理x, y轴重复方式为：使用纹理图像边缘值
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // 配置纹理图像
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image) 
            
            // 将0号纹理传递给着色器
            gl.uniform1i(u_Sampler, 0)

            // 设置背景色
            gl.clearColor(0.0,0.0,0.0,1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // 绘制矩形
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
        }
    },
}
</script>

<style scoped>
    canvas {
        /* width: 300px;
        height: 300px; */
    }
</style>
    