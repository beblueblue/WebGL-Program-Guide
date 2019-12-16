<template>
    <div>
        <canvas ref="myCanvas" width="300" height="300"></canvas>
    </div>
</template>

<script>
import { initShaders, getWebGLContext } from '@/utils/cuon-utils'
import { Matrix4, Vector3 } from '@/utils/cuon-matrix'
import beforeRouteLeave from '@/mixins/beforeRouteLeave'
import fGlsl from './JointModelF.glsl';
import vGlsl from './JointModelV.glsl';

export default {
    name: 'MultiJointModel',
    data() {
        return {
            gl: null,
            n: -1,
            u_mvpMatrix: null,
            u_normalMatrix: null,
            viewProjMatrix: new Matrix4(),
            modelMatrix: new Matrix4(),
            mvpMatrix: new Matrix4(),
            normalMatrix: new Matrix4(),
            // 旋转角度步进值
            ANGLE_STEP: 5.0,
            // 缓存上臂当前的角度(degrees)
            arm1Angle: 90.0,
            // 缓存小臂当前的角度(degrees)
            joint1Angle: 45.0,
            // 缓存手掌当前的角度(degrees)
            joint2Angle: 0.0,
            // 缓存手指当前的角度(degrees)
            joint3Angle: 0.0,
            // 缓存模型矩阵栈
            matrixStock: [],
        }
    },
    mounted(){
        if(!this.registryVars()) {
            return false
        }
        this.draw()
    },
    beforeRouteLeave(to, from, next){
        window.onkeydown = null
        next()
    },
    mixins: [beforeRouteLeave],
    methods: {
        initVertexBuffers(gl) {
            const { initArrayBuffer } = this
            // 顶点坐标
            var vertices = new Float32Array([
                0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5,  0.0, 0.5,  0.5,  0.0, 0.5, // v0-v1-v0.5-v3 front
                0.5, 1.0, 0.5,  0.5,  0.0, 0.5,  0.5,  0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
                0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
                -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5,  0.0,-0.5, -0.5,  0.0, 0.5, // v1-v6-v7-v0.5 left
                -0.5,  0.0,-0.5,  0.5,  0.0,-0.5,  0.5,  0.0, 0.5, -0.5,  0.0, 0.5, // v7-v4-v3-v0.5 down
                0.5,  0.0,-0.5, -0.5,  0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
            ]);
            // 顶点索引
            const indices = new Uint8Array([
                0, 1, 2,   0, 2, 3,    // front
                4, 5, 6,   4, 6, 7,    // right
                8, 9,10,   8,10,11,    // up
                12,13,14,  12,14,15,    // left
                16,17,18,  16,18,19,    // down
                20,21,22,  20,22,23     // back
            ])
            // 法向量索引
            const normals = new Float32Array([
                0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
                1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
                0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
                -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
                0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
                0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
            ])

            if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_position')) {
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
        registryVars() {
            const canvas = this.$refs.myCanvas
            const gl = getWebGLContext(canvas)
            const _this = this

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
            const u_normalMatrix = gl.getUniformLocation(gl.program, 'u_normalMatrix')
            if(!u_normalMatrix) {
                console.log('获取“u_normalMatrix”的存储位置失败')
                return false
            }

            this.viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
            this.viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.enable(gl.DEPTH_TEST)

            window.onkeydown = function (event) {
                _this.keydown(event)
            }

            this.gl = gl
            this.n = n
            this.u_mvpMatrix = u_mvpMatrix
            this.u_normalMatrix = u_normalMatrix

            return true
        },
        keydown(event) {
            const { ANGLE_STEP } = this
            switch (event.keyCode) {
                // ↑ 键
                case 38:
                    // 限位135度
                    if (this.joint1Angle < 125.0) {
                        this.joint1Angle += ANGLE_STEP
                    }
                    break;
                // ↓ 键
                case 40:
                    // 限位135度
                    if (this.joint1Angle > -125.0) {
                        this.joint1Angle -= ANGLE_STEP
                    }
                    break;
                // → 键
                case 39:
                    this.arm1Angle = (this.arm1Angle + ANGLE_STEP) % 360;
                break;
                // ← 键
                case 37:
                    this.arm1Angle = (this.arm1Angle - ANGLE_STEP) % 360;
                break;
                // W 键
                case 87:
                    this.joint2Angle = (this.joint2Angle + ANGLE_STEP) % 360;
                break;
                // S 键
                case 83:
                    this.joint2Angle = (this.joint2Angle - ANGLE_STEP) % 360;
                break;
                // A 键
                case 65:
                    if (this.joint3Angle < 60.0) {
                        this.joint3Angle = (this.joint3Angle + ANGLE_STEP) % 360;
                    }
                break;
                // D 键
                case 68:
                    if (this.joint3Angle > -60.0) {
                        this.joint3Angle = (this.joint3Angle - ANGLE_STEP) % 360;
                    }
                break;
                default: return;
            }
            this.draw();
        },
        draw() {
            const { gl, arm1Angle, joint1Angle, joint2Angle, joint3Angle, } = this

            // 定义各部件高度
            const baseH = 2.0;
            const arm1Length = 10.0;
            const arm2Length = 12.0;
            const palmLength = 2.0;
            const fingerLength = 1.8;

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            // 绘制基底
            // 模型矩阵设置为Y轴负方向移动12个单位，便于整体展示
            this.modelMatrix.setTranslate(0.0, -12.0, 0.0);
            this.drawBox(10, baseH, 10)

            this.modelMatrix.translate(0.0, baseH, 0.0)
            // 大臂绕Y轴旋转
            this.modelMatrix.rotate(arm1Angle, 0.0, 1.0, 0.0);
            // 绘制大臂
            this.drawBox(4, arm1Length, 4)

            // 顶点Y轴正方形移动大臂长度，小臂位置与大臂位置错开
            this.modelMatrix.translate(0.0, arm1Length, 0.0)
            // 小臂绕Z轴旋转
            this.modelMatrix.rotate(joint1Angle, 0.0, 0.0, 1.0)
            // 绘制小臂
            this.drawBox(2.7, arm2Length, 2.7)
            
            // 绘制手掌
            this.modelMatrix.translate(0.0, arm2Length, 0.0)
            // 手掌绕Y轴旋转
            this.modelMatrix.rotate(joint2Angle, 0.0, 1.0, 0.0)
            this.drawBox(2, palmLength, 6)

            this.modelMatrix.translate(0.0, palmLength, 0.0)
            // 绘制手指1
            // 模型变换矩阵压栈
            this.pushMatrix(this.modelMatrix)
            this.modelMatrix.translate(0.0, 0.0, 2.0)
            this.modelMatrix.rotate(joint3Angle, 1.0, 0.0, 0.0)
            this.drawBox(1, fingerLength, 1)
            // 模型变换矩阵弹栈
            this.modelMatrix = this.popMatrix()
            // 绘制手指2
            this.modelMatrix.translate(0.0, 0.0, -2.0)
            this.modelMatrix.rotate(-joint3Angle, 1.0, 0.0, 0.0)
            this.drawBox(1, fingerLength, 1)
        },
        drawBox(width, height, depth) {
            const { gl, n, u_mvpMatrix, u_normalMatrix, viewProjMatrix, modelMatrix, mvpMatrix, normalMatrix, } = this

            this.pushMatrix(modelMatrix)
            modelMatrix.scale(width, height, depth)
            // 计算模型视图矩阵
            mvpMatrix.set(viewProjMatrix)
            mvpMatrix.multiply(modelMatrix)
            // 将视图矩阵传给u_mvpMatrix变量
            gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)
            // 法向量矩阵为模型矩阵的逆转置矩阵
            normalMatrix.setInverseOf(modelMatrix)
            normalMatrix.transpose()
            // 传入法向量变换矩阵
            gl.uniformMatrix4fv(u_normalMatrix, false, normalMatrix.elements)

            // 绘制立方体
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
            this.modelMatrix = this.popMatrix()
        },
        pushMatrix(m){
            const { matrixStock } = this
            // 断开引用关系
            const m2 = new Matrix4(m);

            matrixStock.push(m2);
        },
        popMatrix() {
            return this.matrixStock.pop();
        }
    }
}
</script>
