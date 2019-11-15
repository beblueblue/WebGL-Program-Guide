<template>
    <div>
        <canvas ref="myCanvas" width="600" height="600"></canvas>
    </div>
</template>

<script>
const THREE = require('three')
const OrbitControler = require('three-orbit-controls')(THREE)
// 用 THREE.OBJLoader 实例化
const OBJLoader = require('three-obj-loader')(THREE)
// 用 MTLLoader 实例化
// const MTLLoader = require('/plugins/MTLLoader')

import { MTLLoader } from '@/utils/loaders/MTLLoader'
import { RGBELoader } from '@/utils/loaders/RGBELoader'
const StaticInter = 0.2;
export default {
    name: 'useHdr',
    data() {
        return {
            canvas: null,
            gl: null,
            renderer: null,
            scene: null,
            controls: null,
            model: null,
            textureMap: null,
            HDRMap: null,
            bumpMap: null,
            cubeTexture: null,
            loadedNum: 0,
            needLoadNum: 6,
            animateID: null,
            autoPointLight: null,

            modelPath: 'zb2.obj',
            mtlPath: 'zb2.mtl',
            UVMapPath: '/models/map_green.jpg',
            HDRMapPath: '/models/HDR.jpg',
            normalMapPath: '/models/map_normal.png',
            bumpMapPath: '/models/map_bump.png',
            backUrls: [
                'HDR_r.jpg', 'HDR_l.jpg',
                'HDR_u.jpg', 'HDR_d.jpg',
                'HDR_f.jpg', 'HDR_b.jpg'
            ],
            lights: [
                {
                    type: 'AmbientLight',
                    color: '#fff',
                    intensity: 1,
                },
                // {
                //     type: 'RectAreaLight',
                //     color: '#fff',
                //     intensity: 1,
                //     width: 88.349,
                //     height: 62.559,
                //     position: [47.896, 34.396, 0],
                //     lookAt: [0, 0, 0],
                // },
                // {
                //     type: 'PointLight',
                //     color: '#fff',
                //     intensity: 1,
                //     // distance: 500,
                //     distance: 100.515,
                //     // decay: 81.399,
                //     position: [-35.067, 21.048, 64.35]
                // },
                // {
                //     type: 'PointLight',
                //     color: '#fff',
                //     intensity: 0.4,
                //     // distance: 500,
                //     distance: 69.993,
                //     // decay: 54.985,
                //     position: [-17.066, 21.048, -32.362]
                // },
                {
                    type: 'PointLight',
                    color: '#fff',
                    intensity: StaticInter,
                    // distance: 500,
                    // distance: 69.993,
                    // decay: 54.985,
                    position: [0, 200, 0]
                },
                {
                    type: 'PointLight',
                    color: '#fff',
                    intensity: StaticInter,
                    // distance: 500,
                    // distance: 69.993,
                    // decay: 54.985,
                    position: [0, -200, 0]
                },
                {
                    type: 'PointLight',
                    color: '#fff',
                    intensity: StaticInter,
                    // distance: 500,
                    // distance: 69.993,
                    // decay: 54.985,
                    position: [200, 0, 0]
                },
                {
                    type: 'PointLight',
                    color: '#fff',
                    intensity: StaticInter,
                    // distance: 500,
                    // distance: 69.993,
                    // decay: 54.985,
                    position: [-200, 0, 0]
                },
                {
                    type: 'PointLight',
                    color: '#fff',
                    intensity: StaticInter,
                    // distance: 500,
                    // distance: 69.993,
                    // decay: 54.985,
                    position: [0, 0, 200]
                },
                {
                    type: 'PointLight',
                    color: '#fff',
                    intensity: StaticInter,
                    // distance: 500,
                    // distance: 69.993,
                    // decay: 54.985,
                    position: [0, 0, -200]
                },
            ],
        }
    },
    mounted(){
        this.canvas = this.$refs.myCanvas;
        this.gl = this.canvas.getContext("webgl");
        if (!this.gl) {
            console.log('您的浏览器不支持3D，请使用最新版chrome浏览器');
            return false;
        }
        this.draw()
    },
    methods: {
        draw() {
            const { 
                    initRenderer, initScene, initCamera, initControls, initLights, 
                    loadModel, loadUV, loadHDR, loadBackgroundMap, loadBUMP, loadNORMAL,
                  } = this
            initRenderer()
            initScene()
            initCamera()
            initControls()
            initLights()
            loadUV()
            loadHDR()
            loadBUMP()
            loadNORMAL()
            loadBackgroundMap()
            loadModel()
            const { autoPointLight, camera } = this
            this.controls.diyMoveCB = function(controls) {
                autoPointLight.position.set(camera.position.x, camera.position.y, camera.position.z)
            }
        },
        // 渲染器构建
	    initRenderer() {
            const { canvas, gl } = this
            const { width, height } = canvas
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                canvas: canvas,
                preserveDrawingBuffer: true,
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height);
            
            this.renderer = renderer
        },
        initScene() {
            this.scene = new THREE.Scene();
        },
        initCamera() {
            const { canvas: {width, height}, scene } = this
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
            camera.position.z = 50;
            // camera.lookAt(copyLookAt);
            // camera.updateMatrixWorld()
            scene.add(camera)

            this.camera = camera

        },
        initControls() {
            this.controls = new OrbitControler(this.camera, this.renderer.domElement);
        },
        initLights() {
            const { scene, lights, camera } = this

            //增加一个相机位置的点光源
            this.autoPointLight = new THREE.PointLight( '#fff', 4 )
            this.autoPointLight.position.copy(camera.position)
            // scene.add(new THREE.PointLightHelper( this.autoPointLight, 10 ))
            scene.add(this.autoPointLight)

            lights.forEach(ele => {
                let light = null
                let helper = null
                const sphereSize = 10
                switch(ele.type) {
                    case 'PointLight':
                        light = new THREE.PointLight( ele.color, ele.intensity, ele.distance, 0.45 )
                        light.position.set(ele.position[0], ele.position[1], ele.position[2])
                        helper = new THREE.PointLightHelper( light, sphereSize );
                    break;
                    case 'RectAreaLight':
                        light = new THREE.DirectionalLight( ele.color, ele.intensity, ele.width, ele.height )
                        light.position.set(ele.position[0], ele.position[1], ele.position[2])
                        light.lookAt(ele.lookAt[0], ele.lookAt[1], ele.lookAt[2])
                    break;
                    case 'AmbientLight':
                        light = new THREE.AmbientLight( ele.color, ele.intensity )
                    break;
                }
                scene.add(light)
                // scene.add( helper );
            });
        },
        loadUV() {
            const { UVMapPath } = this
            const textureLoader = new THREE.TextureLoader();
	        textureLoader.load(UVMapPath, (texture) => {
	        	this.loadedNum++;
	        	this.textureMap = texture;
                this.initModel();
	        });
        },
        // 凹凸，这个不需要翻译
        loadBUMP() {
            const { bumpMapPath } = this
            const textureLoader = new THREE.TextureLoader();
	        textureLoader.load(bumpMapPath, (texture) => {
	        	this.loadedNum++;
	        	this.aoMap = texture;
                this.initModel();
	        });
        },
        loadNORMAL() {
            const { normalMapPath } = this
            const textureLoader = new THREE.TextureLoader();
	        textureLoader.load(normalMapPath, (texture) => {
                // 平铺重复
                // texture.wrapS = THREE.RepeatWrapping
                // texture.wrapT = THREE.RepeatWrapping
                // texture.repeat.set( 32, 32 );
	        	this.loadedNum++;
	        	this.normalMap = texture;
                this.initModel();
	        });
        },
        // HDR, 这个不需要翻译
        loadHDR() {
            const { HDRMapPath, scene } = this
            const _this = this
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(HDRMapPath, function(texture) {
                    _this.loadedNum++;
                    _this.HDRMap = texture;
                    _this.initModel();
                }, function() {}, function(err) {console.log(err)});
        },
        loadBackgroundMap() {
            const { backUrls, scene } = this
            //给场景添加天空盒子纹理
            const cubeTextureLoader = new THREE.CubeTextureLoader();
            cubeTextureLoader.setPath( '/models/envMap/' );

            //六张图片分别z是朝前的（posz）、朝后的（negz）、朝上的（posy）、朝下的（negy）、朝右的（posx）和朝左的（negx）。
            const cubeTexture = cubeTextureLoader.load(backUrls, () => {
                this.loadedNum++;
                this.cubeTexture = cubeTexture;
                this.initModel();
                // scene.background = cubeTexture
            });
        },
        loadModel() {
            const { modelPath, mtlPath, scene, initModel } = this
            const _this = this
            const manager = new THREE.LoadingManager();
            const mtlLoaderCache = new MTLLoader( manager )
            
            mtlLoaderCache.setPath('/models/')
			mtlLoaderCache.load( mtlPath, function ( materials ) {
                materials.preload();
                // materials.flatShading = false;
                const OBJLoaderCache = new THREE.OBJLoader( manager )
                OBJLoaderCache.setMaterials( materials )
                OBJLoaderCache.setPath('/models/')
                OBJLoaderCache.load( modelPath, function ( object ) {
                    _this.model = object
                    _this.loadedNum++
                    initModel()
                    scene.add( object );
                } );
            } );
        },
        initModel() {
            const { needLoadNum, loadedNum, animate, model, scene,
                HDRMap, textureMap, cubeTexture, bumpMap, normalMap,  } = this
            if(needLoadNum === loadedNum) {
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        switch(child.name) {
                            case '发光球':
                                // child.material.emissiveMap = HDRMap;
                                child.material.emissive = new THREE.Color('#fff');
                                child.material.envMap = cubeTexture;
                                break;
                            case '金属球':
                                // child.material.emissive = new THREE.Color('rgba(189, 148, 68, 1)');
                                child.material.envMap = cubeTexture
                                // 高度程度， 默认30
                                // child.material.shininess = 15
                                // 粗糙度, 
                                // child.material.roughness = 1
                                break;
                            case '布料':
                                // 颜色贴图和漫反射，纯色背景通过mtl解析生成
                                child.material.map = textureMap

                                // 将发光颜色设置成自身颜色，自身来着mtl的Kd
                                // child.material.emissive = child.material.color
                                // 将发光贴图设置为颜色贴图
                                // child.material.emissiveMap = textureMap

                                // 粗糙度
                                child.material.roughness = 0.95
                                // 非金属程度
                                child.material.metalness = 1

                                // 使用蒙皮效果
                                child.material.skinning = true

                                // 把环境贴图加进去
                                child.material.envMap = cubeTexture
                                child.material.envMapIntensity  = 0.05

                                // 环境贴图和颜色贴图的混合方式设定, 设置为mix模式
                                // child.material.combine = THREE.MixOperation

                                // 法线贴图
                                child.material.normalMap = normalMap;
                                child.material.normalScale = new THREE.Vector2(0.2, 0.2);

                                // 高光贴图属性, 只针对Phong材质
                                // child.material.specular = new THREE.Color('#000')
                                // 高光程度， 默认30, （暂时不影响渲染效果）
                                // child.material.shininess = 3

                                // child.material.reflectivity = 0.9
                                // child.material.refractionRatio = 0.8
                                break;
                            default :
                                // exposeMaterial = new THREE.MeshPhongMaterial( params );
                        }
                        console.log('adjust')
                        console.log(child)
                        
                        child.material.side = THREE.DoubleSide;
                    }
                })
                console.log('start render')
                animate()
            }
        },
        animate() {
            const { animateID, animate, renderer, controls, scene, camera } = this
            if(animateID) {
	            cancelAnimationFrame(animateID);
	        }
            this.animateID = requestAnimationFrame(animate);
            renderer.render(scene, camera);
            controls.update();
        },
    }
}
</script>
    