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

import { MTLLoader } from '@/utils/loaders/MTLLoader'

export default {
    name: 'loaderMtl',
    data() {
        return {
            canvas: null,
            gl: null,
            renderer: null,
            scene: null,
            controls: null,
            model: null,
            loadedNum: 0,
            needLoadNum: 1,
            animateID: null,

            modelPath: 'zb.obj',
            mtlPath: 'zb.mtl',
            lights: [
                {
                    type: 'AmbientLight',
                    color: '#fff',
                    intensity: 0.4,
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
                {
                    type: 'PointLight',
                    color: '#fff',
                    intensity: 1,
                    // distance: 500,
                    distance: 69.993,
                    // decay: 54.985,
                    position: [-17.066, 21.048, -32.362]
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
            const { initRenderer, initScene, initCamera, initControls, initLights, loadModel } = this
            initRenderer()
            initScene()
            initCamera()
            initControls()
            initLights()
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
        // loadUV() {
        //     const textureLoader = new THREE.TextureLoader();
	    //     textureLoader.load(UVMap, (texture) => {
	    //     	this.loadedNum++;
	    //     	this.textureMap = texture;
        //         this.init();
	    //     });
        // },
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
                console.log(materials)
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
            const { needLoadNum, loadedNum, animate } = this
            if(needLoadNum === loadedNum) {
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
    