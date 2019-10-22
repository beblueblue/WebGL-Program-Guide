<template>
    <div>
        <canvas ref="myCanvas" width="600" height="600"></canvas>
    </div>
</template>
<style scoped>
    /* 不指定css高宽，在Mac上，画布高宽有bug */
    canvas {
        width: 600px;
        height: 600px;
    }
</style>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4 } from '@/utils/cuon-matrix'
import { resizeCanvasToDisplaySize } from '@/utils/webgl-utils'
import fGlsl from './demo1F.glsl';
import vGlsl from './demo1V.glsl';

export default {
    name: 'demo2_drawImage',
    data() {
        return {
            gl: null,
            drawInfos: [],
            speed: 0,
            then: 0,
            animateID: 0,
            texcoordBuffer: null,
            positionBuffer: null,
            a_Position: -1,
            a_TexCoord: -1,
            u_Matrix: null,
            u_Texture: null,
        }
    },
    mounted(){
        const canvas = this.$refs.myCanvas
        const gl = getWebGLContext(canvas)
        const { initVertexBuffers, loadImageAndCreateTextureInfo, render } = this

        if(!gl) {
            console.log('获取webGL对象失败')
            return false
        }

        if(!initShaders(gl, vGlsl, fGlsl)) {
            console.log('初始化着色器失败')
            return false
        }

        if(!initVertexBuffers(gl)) {
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
        let then = 0;
        for(let ii = 0; ii < numToDraw; ii++) {
            const drawInfo = {
                x: Math.random() * gl.canvas.width,
                y: Math.random() * gl.canvas.height,
                dx: Math.random() > 0.5 ? -1 : 1,
                dy: Math.random() > 0.5 ? -1 : 1,
                xScale: Math.random() * 0.25 + 0.25,
                yScale: Math.random() * 0.25 + 0.25,
                // 用位操作'|'取整
                textureInfo: textureInfos[Math.random() * textureInfos.length | 0]
            }
            drawInfos.push(drawInfo)
        }
        this.gl = gl;
        this.drawInfos = drawInfos;
        this.speed = speed;
        this.then = then;

        // 执行绘图程序
        requestAnimationFrame(render)
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
            const u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix')
            if(!u_Matrix) {
                console.log('获取“u_Matrix”的存储位置失败')
                return false
            }
            const u_Texture = gl.getUniformLocation(gl.program, 'u_Texture')
            if(!u_Texture) {
                console.log('获取“u_Texture”的存储位置失败')
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

            this.a_Position = a_Position
            this.a_TexCoord = a_TexCoord
            this.u_Matrix = u_Matrix
            this.u_Texture = u_Texture
            this.positionBuffer = positionBuffer
            this.texcoordBuffer = texcoordBuffer

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
            if(!tex) {
                console.log('创建缓冲区对象失败')
                return null
            }
            gl.bindTexture(gl.TEXTURE_2D, tex)

            // Fill the texture with a 1x1 blue pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                    new Uint8Array([0, 0, 255, 255]));

            // 假设并非所有的图像维度都是2的整数次幂
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

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
            img.src = src

            return textureInfo
        },
        /**
         * 时间更新函数
         */ 
        update(deltaTime) {
            const { drawInfos, speed, gl } = this

            drawInfos.forEach(drawInfo => {
                drawInfo.x += drawInfo.dx * speed * deltaTime
                drawInfo.y += drawInfo.dy * speed * deltaTime
                if(drawInfo.x < 0) {
                    drawInfo.dx = 1;
                }
                if(drawInfo.x >= gl.canvas.width) {
                    drawInfo.dx = -1;
                }
                if(drawInfo.y < 0) {
                    drawInfo.dy = 1;
                }
                if(drawInfo.y >= gl.canvas.height) {
                    drawInfo.dy = -1;
                }
            });
        },
        /**
         * 绘制程序，单次绘图程序
         */ 
        draw() {
            const { gl, drawInfos, drawImage } = this

            // 设置绘制像素比
            resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio)
            // 重置canvas视窗大小
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
            // 绘制前，清空画布
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            drawInfos.forEach(function(drawInfo) {
                const dstX = drawInfo.x
                const dstY = drawInfo.y
                const dstWidth = drawInfo.textureInfo.width * drawInfo.xScale
                const dstHeight = drawInfo.textureInfo.height * drawInfo.yScale

                drawImage(
                    drawInfo.textureInfo.texture,
                    drawInfo.textureInfo.width,
                    drawInfo.textureInfo.height,
                    dstX, dstY, dstWidth, dstHeight);
            });
        },
        /**
         * 绘制程序，更新绘图数据
         * @params: time -- 当前时间，单位为毫秒
         */ 
        render(time){
            const { draw, update, render } = this
            const now = time * 0.001
            const deltaTime = Math.min(0.1, now - this.then)
            
            if(this.animateID) {
                cancelAnimationFrame(this.animateID)
            }

            this.then = now
            update(deltaTime)
            draw()
            this.animateID = requestAnimationFrame(render)
        },
        // 不同于图像， 纹理没有对于的长和宽
        // 向纹理传递长和宽
        drawImage(tex, texWidth, texHeight, 
            dstX, dstY, dstWidth, dstHeight) {
            const { gl, a_Position, positionBuffer, a_TexCoord, texcoordBuffer, u_Matrix, u_Texture } = this
            // dstWidth 和 dstHeight 为 undefined时，图像不执行缩放
            if(dstWidth === undefined) {
                dstWidth = texWidth
            }
            if(dstHeight === undefined) {
                dstHeight = texHeight
            }
            gl.bindTexture(gl.TEXTURE_2D, tex)

            // 设置属性，从缓冲区提取数据
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            gl.enableVertexAttribArray(a_Position)
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
            gl.enableVertexAttribArray(a_TexCoord)
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0)
            
            // 从像素空间转换到裁剪空间
            let matrix = new Matrix4()
            matrix.setOrtho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1)

            // 平移到dstx, dsty
            matrix.translate(dstX, dstY, 0)

            // 缩放单位矩阵的宽和高到 texWidth, texHeight 个单位长度
            matrix.scale(dstWidth, dstHeight, 1)

            // 设置矩阵
            gl.uniformMatrix4fv(u_Matrix, false, matrix.elements)
            // 着色器使用纹理空间0
            gl.uniform1i(u_Texture, 0)

            // 绘制矩形
            gl.drawArrays(gl.TRIANGLES, 0, 6)
        }
    }
}
</script>
    