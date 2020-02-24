;(function (){
	const fs = require('fs');
	const path = require('path');
	const stream = require('stream')
	
	// 记录渲染时间
	const startTime = Number(new Date());
	// 当前目录
	const curDir = '/render3D/';
	// 依赖包目录变量缓存
	const moduleDir = '/render3DWithTHREE/';
	// 图片及模型资源目录变量缓存
	const staticDir = '/render3DWithTHREE';
	
	// 配置参数变量
	const configObj = {
		// 生成图片的尺寸
		width: 1000,
		height: 1000,
		// 生成图片名称
		outPath: getFilePos('/render3DWithTHREE/output/out-zb.png'),
		// 模型地址
		modelPath: getFilePos(path.join(staticDir, '/models/zb2.obj')),
		mtlPath: getFilePos(path.join(staticDir, '/models/zb2.mtl')),
		normalMapPath: getFilePos(path.join(staticDir, '/models/map_normal.png')),
		colorMapPath: getFilePos(path.join(staticDir, '/models/map_green.png')),
		renderParams: {
			mainPointIntensity: 4,
    		aroundPointIntensity: 0.2,
    		ambientLightIntensity: 1,
    		roughness: 0.95,
    		metalness: 1,
    		normalScale: 1,
    		normalScale: 5,
		},
		// 相机参数
		postion: {
			x: -9,
	        y: 27,
	        z: 40,
		},
		target: {
			x: 0,
	        y: 0,
	        z: 0,
		},
		faceList: [
		    {
				name: 'A面',
				width: 1200,
				height: 1200,
				url: getFilePos(path.join(staticDir, '/models/p1.png')),
				params: {
		    		// 旋转角度
		            angle: 0,
		            // 水平镜像
		            flipX: true,
		            // 垂直镜像
		            flipY: true,
		            // 绘制起点
		            left: 0,
		            top: 0,
		            scaleX: 0.4370,
		            scaleY: 0.4370,
		            visible: false,
				}
			},
			{
				name: 'A面',
				width: 1200,
				height: 1200,
				url: getFilePos(path.join(staticDir, '/models/p1.png')),
				params: {
		    		// 旋转角度
		            angle: 0,
		            // 水平镜像
		            flipX: false,
		            // 垂直镜像
		            flipY: false,
		            // 绘制起点
		            left: 14.99,
		            top: -47.39,
		            minX: -102.78,
		            minY: -47.39,
		            scaleX: 0.268,
		            scaleY: 0.268,
		            visible: true,
				}
			},
			{
				name: 'B面',
				width: 1200,
				height: 1200,
				url: getFilePos(path.join(staticDir, '/models/p2.png')),
				params: {
		    		// 旋转角度
		            angle: 0,
		            // 水平镜像
		            flipX: true,
		            // 垂直镜像
		            flipY: false,
		            // 绘制起点
		            left: 0,
		            top: 0,
		            minX: 0,
		            minY: 0,
		            scaleX: 1,
		            scaleY: 1,
		            visible: true,
				}
			},
		],
		
		// UV的尺寸设置
		uvSize: 1024,
		// UV背景色
		baseColor: 'rgba(255, 255, 255, 1)',
	};
	// UV映射基准的尺寸, 不可改动
	const UVMAPSIZE = 1024;
	// 计算UV尺寸与1024的缩放因子
    const scaleFactor = configObj.uvSize / UVMAPSIZE;
	
	// 依赖导入
	const { JSDOM } = require(getFilePos(path.join(moduleDir, 'node_modules/jsdom')));
	const THREE = require(getFilePos(path.join(moduleDir, 'node_modules/three')));
	const sharp = require(getFilePos(path.join(moduleDir, 'node_modules/sharp')));
	const PNG = require(getFilePos(path.join(moduleDir, 'node_modules/pngjs'))).PNG;
	const gl = require(getFilePos(path.join(moduleDir, 'node_modules/gl')))(configObj.width, configObj.height, {
		preserveDrawingBuffer: true,
		antialias: true
	});
	const OBJLoader = require(getFilePos(path.join(moduleDir, 'OBJLoader_node')));
	const MTLLoader = require(getFilePos(path.join(moduleDir, 'MTLLoader_node')));
	
	// 构建domcument, window, canvas对象
	const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
	    resources: 'usable'
	});
	const window = dom.window;
	const document = window.document;
	const canvas = document.createElement('canvas');
	global.document = document;
	global.window = window;
	// 图片数据缓存
	const png = new PNG({ width: configObj.width, height: configObj.height });
	// 定位文件位置
	function getFilePos(fileUrl) {
		return path.relative(curDir, fileUrl);
	}
	
	const paramsCache = {
	    gl,
		canvas,
		// loader
		OBJLoader,
		MTLLoader,
		// 输出图片参数
		png,
	    WIDTH: configObj.width,
	    HEIGHT: configObj.height,
	    outPath: configObj.outPath,
	    // 模型材质
	    modelPath: configObj.modelPath,
	    mtlPath: configObj.mtlPath,
	    // 法线贴图
	    normalMapPath: configObj.normalMapPath,
	    // 渲染参数
	    renderParams: configObj.renderParams || {
			mainPointIntensity: 4,
    		aroundPointIntensity: 0.2,
    		ambientLightIntensity: 1,
    		roughness: 0.95,
    		metalness: 1,
    		normalScale: 0.2,
		},
	    
	    // 颜色贴图合图参数
	    // 利用sharp库合成colorMap
	    uvSize: configObj.uvSize,
	    baseColor: configObj.baseColor,
	    faceList: configObj.faceList,
	    scaleFactor: scaleFactor,
	    UVMAPSIZE: UVMAPSIZE,
	    colorMapPath: configObj.colorMapPath,
	    
	    // 相机与灯光
	    copyPosition: configObj.postion,
	    copyLookAt: configObj.target,
	    lights: [
	        {
	            type: 'AmbientLight',
	            color: '#fff',
	        },
	        {
	            type: 'PointLight',
	            color: '#fff',
	            position: [0, 200, 0]
	        },
	        {
	            type: 'PointLight',
	            color: '#fff',
	            position: [0, -200, 0]
	        },
	        {
	            type: 'PointLight',
	            color: '#fff',
	            position: [200, 0, 0]
	        },
	        {
	            type: 'PointLight',
	            color: '#fff',
	            position: [-200, 0, 0]
	        },
	        {
	            type: 'PointLight',
	            color: '#fff',
	            position: [0, 0, 200]
	        },
	        {
	            type: 'PointLight',
	            color: '#fff',
	            position: [0, 0, -200]
	        },
	    ],
	}
	/**
	 * 服务端合图脚本
	 */
	class renderObject {
	    constructor(options) {
	        this.defaultOpt = {}
	        this.options = {}

	        Object.assign(this.options, this.defaultOptions, options)

	        this.componentCache = {
	            renderer: null,
	            scene: null,
	            camera: null,
	            model: null,
	            colorMap: null,
	            normalMap: null,
	            autoPointLight: null,
	            // 面数据和配置映射关系的缓存
	            imgIndexMap: {},
	        }
	    }
	    /**
	     * 开始绘制
	     */
	    draw() {
	        // 同步任务
	        this.initRenderer()
	        this.initScene()
	        this.initCamera()
	        this.initLights()

	        // 异步任务
	        Promise.all([
				this.loadColorMap(),
//				this.loadColorMap2(),
	            this.loadNormalMap(),
	            this.loadModel(),
	        ]).then(
	            () => {
	                this.initModel()
	            }
	        )
	    }
	    /**
	     * 渲染器构建
	     */
	    initRenderer() {
	        const { options, componentCache } = this
	        const { canvas, gl } = options
	        componentCache.renderer = new THREE.WebGLRenderer({
	            canvas: canvas,
	            preserveDrawingBuffer: true,
	            context: gl,
	        });
	    }
	    /**
	     * 场景构建
	     */
	    initScene() {
	        const { componentCache } = this

	        componentCache.scene = new THREE.Scene();
	    }
	    /**
	     * 相机构建
	     */
	    initCamera() {
			const { options: { WIDTH, HEIGHT, copyPosition, copyLookAt }, componentCache } = this
			const target = new THREE.Vector3(0, 0, 0)
			const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
			target.copy(copyLookAt)
			camera.position.copy(copyPosition);
			// lookAt方法，必须传入THREE.Vector3的实例
		    camera.lookAt(target);
		    camera.updateMatrixWorld()
	        componentCache.scene.add(camera)

	        componentCache.camera = camera
	    }
	    /**
	     * 灯光构建
	     */
	    initLights() {
	        const { 
	                componentCache: { scene, camera }, 
	                options: { 
	                	lights, 
	                	renderParams: {
	                		mainPointIntensity,
	                		aroundPointIntensity,
	                		ambientLightIntensity,
	                	} 
                	} 
	            } = this

	        //增加一个相机位置的点光源
	        const autoPointLight = new THREE.PointLight( '#fff', mainPointIntensity )
	        autoPointLight.position.copy(camera.position)
	        scene.add(autoPointLight)

	        lights.forEach(ele => {
	            let light = null
	            switch(ele.type) {
	                case 'PointLight':
	                    light = new THREE.PointLight( ele.color, aroundPointIntensity )
	                    light.position.set(ele.position[0], ele.position[1], ele.position[2])
	                break;
	                case 'RectAreaLight':
	                    light = new THREE.DirectionalLight( ele.color, ele.intensity, ele.width, ele.height )
	                    light.position.set(ele.position[0], ele.position[1], ele.position[2])
	                    light.lookAt(ele.lookAt[0], ele.lookAt[1], ele.lookAt[2])
	                break;
	                case 'AmbientLight':
	                    light = new THREE.AmbientLight( ele.color, ambientLightIntensity )
	                break;
	            }
	            scene.add(light)
	        });
	    }
	    /**
	     * 加载模型和材质
	     */
	    async loadModel() {
	        const {
	            options: { modelPath, mtlPath, MTLLoader, OBJLoader, },
	            componentCache,
	        } = this
	        const mtlLoaderCache = new MTLLoader()
	        const OBJLoaderCache = new OBJLoader()

	        if(mtlPath) {
	        	const materials = await mtlLoaderCache.load( mtlPath )
	        	materials.preload();
	        	OBJLoaderCache.setMaterials( materials )
	        }
	        componentCache.model = await OBJLoaderCache.load( modelPath )
	    }
	    /**
	     * 加载颜色纹理
	     */
	    async loadColorMap(...arg){
		    const { 
		    	componentCache,
		    	options: {
		    		uvSize, 
		    		faceList, 
					baseColor,
					scaleFactor,
		    	},
	    	} = this;

		    /**
		     * 利用sharp库合成UV图
		     * https://github.com/lovell/sharp
		     */
		    return this.handleBuffer(faceList)
			    .then(list => sharp({
						            create: {
						                width: uvSize*3,
						                height: uvSize*3,
						                channels: 4,
						                background: baseColor
						            }
						        })
						        .composite(list.map((ele, index) => { 
						            let left = faceList[componentCache.imgIndexMap[index]].params.minX * scaleFactor + uvSize;
						            let top = faceList[componentCache.imgIndexMap[index]].params.minY * scaleFactor + uvSize;
						            
						            left = Math.min(left, uvSize * 2);
						            top = Math.min(top, uvSize * 2);
						            left = Math.max(0, left);
						            top = Math.max(0, top);
						            left = Math.round(left);
						            top = Math.round(top);
						            return {
						                input: ele, 
						                left,
						                top,
						            } 
						        })).png().toBuffer()
			    ).then(data => sharp(data)
					            .extract({ 
					                left: uvSize, 
					                top: uvSize, 
					                width: uvSize, 
					                height: uvSize 
					            }).png().toBuffer()
				).then(data => {
						const endTime = Number(new Date());
					    console.log(`colorMap composited execute: ${endTime - startTime}ms`)
			            
					    // 创建一个bufferstream
						const bufferStream = new stream.PassThrough();
					    
						bufferStream.end(data);
						
						//进一步使用
						return new Promise((resolve, reject) => {
							// UV图缓存
						    const curPng = new PNG();
						    bufferStream
						    .pipe(curPng)
						    .on('parsed', function(img) {
						    	// 获得突破，通过DataTexture来导入纹理图片
						    	// texture载入，在node中利用Data URI格式来载入图片纹理
						    	// three.js中TextureLoader载入的图片纹理，都调用了DOM中的<img>对象，在node中不适用。
						    	// 解决思路一：search node中实现img对象的中间件
						    	// 解决思路二：利用自定义纹理材质来变形导入图片纹理，见模型的load
						    	const { width, height, data } = curPng
						    	
						    	const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
						    	texture.generateMipmaps = true;
						    	texture.flipY = true;
						    	texture.unpackAlignment = 4;
						    	texture.needsUpdate = true;
						    	
						    	texture.magFilter = THREE.LinearFilter
					            texture.minFilter = THREE.LinearMipMapLinearFilter
						    	componentCache.colorMap = texture;
						    	console.log(`loaded colorMap.`)
						    	resolve()
						    })
						    .on('error', (error) => {
				                reject(error)
				            })
						})
			    })   
			    .catch(e => console.log(e));
		}
		/**
		 * 加载颜色纹理
		 */
		async loadColorMap2(...arg){
			const { options, componentCache, _loadTexture } = this

			try {
				const texture = await _loadTexture(options.colorMapPath, ...arg);
				texture.magFilter = THREE.LinearFilter
				texture.minFilter = THREE.LinearMipMapLinearFilter
				// texture.repeat.set( 5, 5 );
				componentCache.colorMap = texture;
			}
			catch (err) {
				console.log('加载颜色纹理失败：', err);
			}
		}
	    /**
	     * 加载法线纹理
	     */
	    async loadNormalMap(...arg){
	        const { options, componentCache, _loadTexture } = this

	        try {
	            const texture = await _loadTexture(options.normalMapPath, ...arg);
	            texture.magFilter = THREE.LinearFilter
	            texture.minFilter = THREE.LinearMipMapLinearFilter
	            // texture.repeat.set( 5, 5 );
	            componentCache.normalMap = texture;
	        }
	        catch (err) {
	            console.log('加载法线纹理失败：', err);
	        }
	    }
	    /**
	     *  纹理加载器
	     * @param {String} path 图片地址
	     * @param {Number} width 纹理宽度，默认为1024
	     * @param {Number} height 纹理高度，默认为1024
	     */
	    _loadTexture(path, format =  THREE.RGBAFormat) {
	        return new Promise((resolve, reject) => {
	            const pngCache = new PNG();
	            fs.createReadStream(path)
	            .pipe(pngCache)
	            .on('parsed', () => {
	                const { width, height, data } = pngCache
	                
	                const texture = new THREE.DataTexture(data, width, height, format);
	                texture.generateMipmaps = true;
	                texture.flipY = true;
	                texture.unpackAlignment = 4;
	                texture.needsUpdate = true;
	                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	                console.log(`loaded texture: ${path}`)
	                resolve(texture)
	            })
	            .on('error', (error) => {
	                reject(error)
	            })
	        })
	    }
	    /**
	     * 处理图片缩放，旋转，镜像，转化为buffer
	     * @param { Array } list 面数据列表
	     * @returns Promise
	     */
	    async handleBuffer(list) {
			const { 
				componentCache,
				options: {
					UVMAPSIZE,
					scaleFactor,
					uvSize
				}
			} = this;
	        const bufferArr = [];
	        let imgNum = 0;
	        list.forEach((ele, index) => {
	            const defaultScale = UVMAPSIZE * 0.25 / ele.width;
	            const width = Math.round((ele.params.scaleX || defaultScale) * ele.width * scaleFactor);
	            const height = Math.round((ele.params.scaleY || defaultScale) * ele.height * scaleFactor);
	            // 过滤无需渲染的图片
	            if( ele.params.visible 
	                && ele.params.left > -uvSize && ele.params.left < uvSize 
	                && ele.params.top > -uvSize && ele.params.top < uvSize
	            ) {
	                const buffer = (async() => 
	                                    await sharp(ele.url)
	                                            .resize(width, height)
	                                            .rotate(ele.params.angle, {background: 'rgba(255, 255, 255, 0)'})
	                                            .flop(ele.params.flipX)
	                                            .flip(ele.params.flipY)
	                                            .png()
	                                            .toBuffer())();
	                componentCache.imgIndexMap[imgNum++] = index;
	                bufferArr.push(buffer);
	            }
	        });
	        return Promise.all(bufferArr);
	    }
	    /**
	     * 组装模型
	     */
	    initModel() {
	        const { 
	            componentCache: { model, colorMap, normalMap, renderer, camera, scene },
	            options: {
	            	WIDTH,
	            	HEIGHT,
	            	renderParams: {
	            		roughness,
	            		metalness,
	            		normalScale,
	            	},
	            },
	        } = this
	        if(!model) {
	        	console.log('模型缓存不存在')
	        	return false
	        }
	        model.traverse((child) => {
	        	if (child instanceof THREE.Mesh) {
                    switch(child.name.toLowerCase()) {
                        case 'phong':
                        	// 颜色贴图和漫反射，纯色背景通过mtl解析生成
                        	if(colorMap) {
                    			child.material.map = colorMap;
                        	}
                            break;
                        case 'standard':
                        default :
                            // 颜色贴图和漫反射，纯色背景通过mtl解析生成
                        	if(colorMap) {
                    			child.material.map = colorMap;
                        	}

	                     	// 法线贴图
                        	if(normalMap) {
                    			child.material.normalMap = normalMap;
                    			child.material.normalScale = new THREE.Vector2(normalScale, normalScale);
                        	}
                        	
	                        if(child.material.isMeshStandardMaterial) {
	                        	// 粗糙度
	                        	child.material.roughness = roughness
	                        	// 非金属程度
	                        	child.material.metalness = metalness
	                        }

                            // 使用蒙皮效果
                            child.material.skinning = true

                            // 把环境贴图加进去
//                            child.material.envMap = cubeTexture
//                            child.material.envMapIntensity  = 0.05
                    }
                    child.material.flatShading = false;
//                    child.material.side = THREE.DoubleSide;
                }
	        })
	        console.log('start render')
	        // Let's create a render target object where we'll be rendering
	        const rtTexture = new THREE.WebGLRenderTarget(
	            WIDTH, HEIGHT, {
	                minFilter: THREE.LinearFilter,
	                magFilter: THREE.NearestFilter,
	                format: THREE.RGBAFormat
	        })
	        scene.add( model );
	        renderer.setRenderTarget(rtTexture);
	        renderer.render(scene, camera);

	        this.exportImg()
	    }
	    /**
	     * 导出图片
	     */
	    exportImg(){
	        const { 
	            componentCache: { renderer, },
	            options: { WIDTH, HEIGHT, outPath, gl, png, }
	        } = this
	        const newGl = renderer.getContext()

	        const pixels = new Uint8Array(4 * WIDTH * HEIGHT)

	        newGl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

	        for(let j = 0; j < HEIGHT; j++){
	            for(let i = 0; i < WIDTH; i++){
	                const k = j * WIDTH + i
	                const r = pixels[4*k]
	                const g = pixels[4*k + 1]
	                const b = pixels[4*k + 2]
	                const a = pixels[4*k + 3]

	                const m = (HEIGHT - j + 1) * WIDTH + i
	                png.data[4*m]     = r
	                png.data[4*m + 1] = g
	                png.data[4*m + 2] = b
					png.data[4*m + 3] = a
	            }
	        }
	        const stream = fs.createWriteStream(outPath)
	            png.pack().pipe(stream)

	            stream.on('close', () => {
	                const endTime = Number(new Date());
	                console.log(`mage written: ${ outPath }`)
	                console.log(`The process execute: ${endTime - startTime}ms`)
	            }
	        )
	    }
	}
	const renderInit = new renderObject(paramsCache)

	renderInit.draw()
})();