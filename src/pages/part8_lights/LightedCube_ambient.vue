<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4, Vector3 } from '@/utils/cuon-matrix'
import fGlsl from './LookAtTrianglesF.glsl';
import vGlsl from './LightedCube_ambientV.glsl';

export default {
    name: 'LightedCube_ambient',
    data() {
        return {
            gl: null,
        }
    },
    mounted(){
        this.draw()
    },
    updated() {
        this.draw()
    },
    methods: {
        initVertexBuffers(gl) {
            const { initArrayBuffer } = this
            // 顶点坐标
            const vertics = new Float32Array([
                 1.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,
                 1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0,  1.0, -1.0,
                 1.0,  1.0,  1.0,  1.0,  1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,
                -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0,
                -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0,
                -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
            ])
            // 颜色索引
            const colors = new Float32Array([
                0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0,
                0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4,
                1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,
                1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,
                1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0,
                0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0,
                // 立方体面颜色一致，会失去立体感
                // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            ])
            // 顶点索引
            const indices = new Uint8Array([
                 0,  1,  2,  0,  2,  3, // 前
                 4,  5,  6,  4,  6,  7, // 右
                 8,  9, 10,  8, 10, 11, // 上
                12, 13, 14, 12, 14, 15, // 左
                16, 17, 18, 16, 18, 19, // 下
                20, 21, 22, 20, 22, 23, // 后
            ])
            // 法向量索引
            const normals = new Float32Array([
                0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 
                1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 
                0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 
                0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
                0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 
            ])

            if(!initArrayBuffer(gl, vertics, 3, gl.FLOAT, 'a_position')) {
                return -1
            }
            if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_color')) {
                return -1
            }
            if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_normal')) {
                return -1
            }
            const indexBuffer = gl.createBuffer()
            if(!indexBuffer) {
                console.log('创建缓冲区对象失败')
                return false
            }
            // 将顶点索引数据写入缓冲区对象
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

            return indices.length
        },
        /**
         * 封装缓冲区操作
         * @params: gl -- Object, WebGL对象
         * @params: data -- DataBuffer, 需要填入的数据
         * @params: num -- Number, 每个顶点所需的数据个数
         * @params: type -- String, 数据格式
         * @params: attribute -- String, attribute变量名称
         * @return false -- 操作出错
         *         true -- 操作成功
         */ 
        initArrayBuffer(gl, data, num, type, attribute) {
            const buffer = gl.createBuffer()
            if(!buffer) {
                console.log('创建缓冲区对象失败')
                return false
            }
            const a_attribute = gl.getAttribLocation(gl.program, attribute)
            if(a_attribute < 0) {
                console.log(`获取“${attribute}”的存储位置失败`)
                return false
            }
            // 将顶点索引数据写入缓冲区对象
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
            // 将缓存区对象分配给attribute变量
            gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
            // 连接a_color变量和分配给它的缓冲区对象
            gl.enableVertexAttribArray(a_attribute)

            return true
        },
        draw() {
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

            const n = this.initVertexBuffers(gl)
            if(n < 0){
                console.log('设置顶点位置失败')
                return false
            }

            // 获取uniform变量的存储位置
            const u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix')
            if(!u_mvpMatrix) {
                console.log('获取“u_mvpMatrix”的存储位置失败')
                return false
            }
            const u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor')
            if(!u_lightColor) {
                console.log('获取“u_lightColor”的存储位置失败')
                return false
            }
            const u_lightDirection = gl.getUniformLocation(gl.program, 'u_lightDirection')
            if(!u_lightDirection) {
                console.log('获取“u_lightDirection”的存储位置失败')
                return false
            }
            const u_ambientLight = gl.getUniformLocation(gl.program, 'u_ambientLight')
            if(!u_ambientLight) {
                console.log('获取“u_ambientLight”的存储位置失败')
                return false
            }

            // 设置视点、视线和上方向
            const mvpMatrix = new Matrix4()
            mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
            mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)

            // 将视图矩阵传给u_mvpMatrix变量
            gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)
            // 设置光线颜色（#fff - 白光）
            gl.uniform3f(u_lightColor, 1.0, 1.0, 1.0)
            // 设置环境光线颜色
            gl.uniform3f(u_ambientLight, 0.2, 0.2, 0.2)
            // 设置光线方向（世界坐标下）
            let lightDirection = new Vector3([0.5, 3.0, 4.0]);
            lightDirection.normalize(); //归一化
            gl.uniform3fv(u_lightDirection, lightDirection.elements)

            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.enable(gl.DEPTH_TEST)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            // 绘制立方体
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
        },
    }
}
</script>
