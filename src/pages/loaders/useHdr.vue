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

            modelPath: 'zb2.obj',
            mtlPath: 'zb2.mtl',
            UVMapPath: '/models/map.png',
            HDRMapPath: '/models/HDR.jpg',
            normalMapPath: '/models/map_normal.png',
            bumpMapPath: '/models/map_bump.png',
            backUrls: [
                'HDR_r.jpg', 'HDR_l.jpg',
                'HDR_u.jpg', 'HDR_d.jpg',
                'HDR_f.jpg', 'HDR_b.jpg'
            ],
            lights: [
                // {
                //     type: 'AmbientLight',
                //     color: '#fff',
                //     intensity: 1,
                // },
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
            const { initRenderer, initScene, initCamera, initControls, initLights, 
                loadModel, loadUV, loadHDR, loadBackgroundMap, loadBUMP, loadNORMAL } = this
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

            lights.forEach(ele => {
                let light = null
                let helper = null
                const sphereSize = 10
                switch(ele.type) {
                    case 'PointLight':
                        light = new THREE.PointLight( ele.color, ele.intensity, ele.distance, 0.45 )
                        light.position.set(ele.position[0], ele.position[1], ele.position[2])
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
	        	this.loadedNum++;
	        	this.normalMap = texture;
                this.initModel();
	        });
        },
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
                scene.background = cubeTexture
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
                                child.material.emissive = new THREE.Color('rgba(189, 148, 68, 1)');
                                child.material.envMap = scene.background
                                // 高度程度， 默认30
                                child.material.shininess = 15
                                // 粗糙度, 
                                // child.material.roughness = 1
                                break;
                            case '布料':
                                // 颜色贴图和漫反射
                                child.material.map = textureMap
                                // child.material.emissive = new THREE.Color('#000');
                                // child.material.envMap = scene.background
                                // // // 粗糙度
                                // child.material.roughness = 1;
                                // child.material.map = textureMap;
                                // // child.material.bumpMap = bumpMap;
                                // // child.material.bumpScale = 0.9;
                                // // 法线贴图
                                // child.material.normalMap = normalMap;
                                // child.material.normalScale = new THREE.Vector2(0.01, 0.01);
                                // // 
                                // child.material.reflectivity = 0.9
                                // child.material.refractionRatio = 0.8
                                // // 高光贴图属性, 只针对Phong材质
                                // child.material.specular = new THREE.Color('#000')
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
    