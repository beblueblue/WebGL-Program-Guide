<template>
    <div>
        <canvas ref="myCanvas" width="600" height="600"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import fGlsl from './demo1F.glsl';
import vGlsl from './demo1V.glsl';

export default {
    name: 'demo1_drawImage(image, x, y)',
    data() {
        return {
            gl: null,
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
        this.gl = gl;

        if(!initShaders(gl)) {
            console.log('顶点着色器变量赋值失败')
            return false
        }

        const textureInfos = [
            loadImageAndCreateTextureInfo(gl, '/images/star.jpg'),
            loadImageAndCreateTextureInfo(gl, '/images/leaves.jpg'),
            loadImageAndCreateTextureInfo(gl, '/images/keyboard.jpg'),
        ]

        let drawInfos = [];
        let numToDraw = 9;
        const speed = 60;
        for(let ii = 0; ii < numToDraw; ii++) {
            const drawInfo = {
                x: Math.random() * gl.canvas.width,
                y: Math.random() * gl.canvas.height,
                dx: Math.random() > 0.5 ? -1 : 1,
                dy: Math.random() > 0.5 ? -1 : 1,
                // 用位操作'|'取整
                textureInfo: textureInfos[Math.random() * textureInfos.length | 0]
            }
            drawInfos.push(drawInfo)
        }
    },
    methods: {
        // 对顶点着色器变量进行赋值
        initVertexBuffers(gl) {
            // 获取着色器attribute变量缓存地址
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
            // 获取着色器uniform变量缓存地址
            const u_matrix = gl.getUniformLocation(gl.program, 'u_matrix')
            if(!u_matrix) {
                console.log('获取“u_matrix”的存储位置失败')
                return false
            }
            const u_texture = gl.getUniformLocation(gl.program, 'u_texture')
            if(!u_texture) {
                console.log('获取“u_texture”的存储位置失败')
                return false
            }

            // 创建顶点坐标缓冲区
            const positionBuffer = gl.createBuffer()
            if(!positionBuffer) {
                console.log('创建缓冲区对象失败')
                return false
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            const positions = [
                0, 0,
                0, 1,
                1, 0,
                1, 0,
                0, 1,
                1, 1,
            ]
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

            // 创建纹理坐标缓冲区
            const texcoordBuffer = gl.createBuffer()
            if(!texcoordBuffer) {
                console.log('创建缓冲区对象失败')
                return false
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
            const texcoords = [
                0, 0,
                0, 1,
                1, 0,
                1, 0,
                0, 1,
                1, 1,
            ]
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW)

            return true
        },
        // 创建一个纹理信息 { width: w, height: h, texture: tes }
        // 纹理起初为 1x1 像素，当图像加载完成后更新大小
        /**
         * 图片加载程序
         * @param: gl -- gl对象
         * @param: src -- 图片资源地址
         * @return: 纹理信息对象 -- textureInfo { width, height, texture }
         *          null -- 发生错误
         */
        loadImageAndCreateTextureInfo(gl, src) {
            const tex = gl.createTexture()
            if(!texcoordBuffer) {
                console.log('创建缓冲区对象失败')
                return null
            }
            gl.bindTexture(gl.TEXTURE_2D, tex)

            // 假设并非所有的图像维度都是2的整数次幂
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_FILTER, gl.LINEAR)

            const textureInfo = {
                width: 1,
                height: 1,
                texture: tex,
            }

            const img = new Image()
            img.onload = function () {
                textureInfo.width = img.width;
                textureInfo.height = img.height;

                gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
            }

            return textureInfo
        },
        /**
         * 时间更新函数
         */ 
        update(drawInfos, speed, deltaTime) {
            drawInfos.forEach(drawInfo => {
                drawInfo.x += drawInfo.dx * speed, deltaTime
                drawInfo.y += drawInfo.dy * speed, deltaTime
                if(drawInfo.x < 0) {
                    drawInfo.dx = 1;
                }
                if(drawInfo.x >= gl,canvas.width) {
                    drawInfo.dx = -1;
                }
                if(drawInfo.y < 0) {
                    drawInfo.dy = 1;
                }
                if(drawInfo.y >= gl,canvas.height) {
                    drawInfo.dx = -1;
                }
            });
        },
        // 不同于图像， 纹理没有对于的长和宽
        // 向纹理传递长和宽
        drawImage(gl, tex, texWidth, texHeight, dstX, dstY) {
            gl.bindTexture(gl.TEXTURE_2D, tex)

            // 设置属性，从缓冲区提取数据
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        }
    }
}
</script>
    