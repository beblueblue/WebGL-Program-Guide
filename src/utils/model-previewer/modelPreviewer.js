;(function (undefined) {
  // 注册模型加载器
  OBJLoader(THREE);
  // 解码组件注册
  THREE.DRACOLoader.setDecoderPath("/static/admin/plugin/three/draco/");
  // 注册控制器
  const OrbitControler = OrbitControls(THREE);

  function isNumber(val) {
    return !isNaN(parseFloat(val))
  }
  /**
   * 3D场景类
   * 依赖"three.js(0.104.0)", "three-orbit-controls(82.1.0)", "three-obj-loader(1.1.3)"
   * @param: 
   * 	options -- Object:
   * 		el: Object -- 场景容器，canvas元素DOM对象
   * 		modelPath: String -- 模型引用地址
   * 		mtlPath: String -- 材质引用地址
   * 		mapPath: String -- 颜色纹理图引用地址
   * 		normalMapPath: String -- 法线纹理图引用地址
   * 
   * 		roughness: Number -- 粗糙度 [0, 1], 默认0.95
   * 		metalness: Number -- 非金属度 [0, 1]，默认1
   * 		normalScale: Number -- 法线强度 (0, 1]， 默认0.15
   * 		normalRepeat: Number -- 法线重复度 [1, 160]， 默认1
   * 
   * 		mainPointIntensity: Number -- 正面高光强度 [0, 5], 默认4
   * 		ambientLightIntensity: Number -- 环境灯强度 [0, 1], 默认0
   * 		aroundPointIntensity: Number -- 环境6灯强度 [0, 1]， 默认0
   * 		mainPointColor: String -- 正面高光颜色, 默认'#fff'
   * 		aroundPointColor: String -- 环境6灯颜色, 默认'#fff'
   * 		ambientLightColor: String -- 环境灯颜色, 默认'#fff'
   * 
   * 		clearColor: String -- 默认场景背景色
   * 		cameraPosition: Vector3 -- 相机默认初始位置
   * 		controlsTarget: Vector3 -- 相机默认初始视角
   * 		composeFlag: Boolean -- 是否为合图程序，默认false, 合图程序不需要调用requestAnimationFrame
   * 		afterCreate: Function -- 初始化后的回调
   */
  class createRenderer {
    constructor(options) {
      this.defaultOptions = {
        el: null,

        modelPath: '',
        mtlPath: '',
        mapPath: '',
        normalMapPath: '',

        roughness: 0.95,
        metalness: 1,
        normalScale: 0.15,
        normalRepeat: 1,

        mainPointIntensity: 4,
        mainPointPosition: null,
        ambientLightIntensity: 0,
        aroundPointIntensity: 0,
        mainPointColor: '#fff',
        aroundPointColor: '#fff',
        ambientLightColor: '#fff',

        clearColor: '#fff',
        afterCreate: null,
        cameraPosition: {
          x: 32,
          y: 23,
          z: -4,
        },
        controlsTarget: {
          x: 0,
          y: 0,
          z: 0
        },
        composeFlag: false,
      };
      this.options = {};

      Object.assign(this.options, this.defaultOptions, options);
      // 相机参数修正
      this.options.cameraPosition = this.options.cameraPosition || this.defaultOptions.cameraPosition;
      this.options.controlsTarget = this.options.controlsTarget || this.defaultOptions.controlsTarget;
      this.options.mainPointPosition = this.options.mainPointPosition || this.options.cameraPosition;

      // 初始化标志位
      this.isCreated = false;

      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.controls = null;
      // mesh对象缓存
      this.model = null;

      //灯光组
      this.lights = [{
          type: 'AmbientLight',
          color: this.options.ambientLightColor,
          intensity: this.options.ambientLightIntensity,
        },
        {
          type: 'PointLight',
          color: this.options.aroundPointColor,
          intensity: this.options.aroundPointIntensity,
          position: [0, 200, 0]
        },
        {
          type: 'PointLight',
          color: this.options.aroundPointColor,
          intensity: this.options.aroundPointIntensity,
          position: [0, -200, 0]
        },
        {
          type: 'PointLight',
          color: this.options.aroundPointColor,
          intensity: this.options.aroundPointIntensity,
          position: [200, 0, 0]
        },
        {
          type: 'PointLight',
          color: this.options.aroundPointColor,
          intensity: this.options.aroundPointIntensity,
          position: [-200, 0, 0]
        },
        {
          type: 'PointLight',
          color: this.options.aroundPointColor,
          intensity: this.options.aroundPointIntensity,
          position: [0, 0, 200]
        },
        {
          type: 'PointLight',
          color: this.options.aroundPointColor,
          intensity: this.options.aroundPointIntensity,
          position: [0, 0, -200]
        },
      ];
      // 主灯缓存
      this.mainPointLight = null;
      // 辅助6灯缓存
      this.aroundPoints = [];
      // 环境灯缓存
      this.ambientLight = null;

      // 颜色纹理
      this.map = null;
      // 法线纹理
      this.normalMap = null;


      // 渲染动画ID缓存
      this.animateID = null;

      // 图像缓存
      this.getImageData = false;
      this.imgData = '';

      // 缓存初始配置
      this.originCameraPosition = new THREE.Vector3();
      this.originControlsTarget = new THREE.Vector3();

      this._init();
    }
    /**
     * 获取当前画布图像
     * @return: dataUrl
     */
    getCanvasImg(stopFlag) {
      this.getImageData = true;
      this._animateRender();
      if (stopFlag) {
        if (this.animateID) {
          cancelAnimationFrame(this.animateID);
        }
        // 回收webgl对象
        //				this.renderer.forceContextLoss();
      }
      return this.imgData;
    }
    /**
     * 复位模型初始视角
     */
    resetView() {
      this.setView(this.originCameraPosition, this.originControlsTarget);
    }
    /**
     * 调整视角
     * @params:
     * 		cameraPosition: THREE.Vector3
     * 		controlsTarget: THREE.Vector3
     */
    setView(cameraPosition, controlsTarget, setViewCallback) {
      const target = new THREE.Vector3(0, 0, 0)

      target.copy(controlsTarget)
      this.camera.position.copy(cameraPosition);
      // lookAt方法，必须传入THREE.Vector3的实例
      this.camera.lookAt(target);
      this.camera.updateMatrixWorld();
      if (this.controls) {
        this.controls.target.copy(target);
        this.controls.update();
      }
      if (setViewCallback) {
        setViewCallback(this);
      }
    }
    /**
     * 获取当前视角
     * return: Object
     * 		cameraPosition: THREE.Vector3
     * 		controlsTarget: THREE.Vector3
     */
    getCurView() {
      let obj = {
        cameraPosition: new THREE.Vector3(),
        controlsTarget: new THREE.Vector3()
      };

      obj.cameraPosition.add(this.camera.position);
      obj.controlsTarget.add(this.controls.target);

      return obj;
    }
    /**
     * 调整画布大小
     * @params:
     * 		width: Number/String -- 画布宽（单位px）
     * 		height: Number/String -- 画布高（单位px）
     */
    resize(width, height) {
      if (!isNumber(width)) {
        throw new Error('Param error: width should be Number');
      }
      if (!isNumber(height)) {
        throw new Error('Param error: height should be Number');
      }

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    }
    /**
     * 更新颜色纹理图
     * @param: 
     * 		mapPath: String -- 图片地址
     * 		mapCallBack: Function -- 颜色纹理更新后的回调
     * @returns Promise 或 null
     */
    updateMap(mapPath, mapCallBack) {
      const {
        _loadTexture,
        options,
        model,
      } = this

      this.options.mapPath = mapPath;
      // 释放内存
      if (this.map) {
        this.map.dispose();
      }
      if (mapPath) {
        return _loadTexture(mapPath)
          .then(
            texture => {
              this.map = texture;
              if (mapCallBack) {
                mapCallBack();
              }
            },
            err => {
              console.log(err);
            }
          );
      } else {
        this.normalMap = null;
        if (model) {
          this.adjustModel();
        };
      }
      return null;
    }
    /**
     * 更新法线纹理图
     * @param: 
     * 		normalMapPath: String -- 图片地址
     * 		normalCallBack: Function -- 法线纹理更新后的回调
     * @returns Promise 或 null
     */
    updateNormal(normalMapPath, normalCallBack) {
      const {
        _loadTexture,
        options,
        model,
      } = this

      this.options.normalMapPath = normalMapPath;
      // 释放内存
      if (this.normalMap) {
        this.normalMap.dispose();
      }
      if (normalMapPath) {
        return _loadTexture(normalMapPath)
          .then(
            texture => {
              // 设置重复度
              texture.wrapS = THREE.RepeatWrapping
              texture.wrapT = THREE.RepeatWrapping
              texture.repeat.set(options.normalRepeat | 0, options.normalRepeat | 0);
              this.normalMap = texture;

              if (normalCallBack) {
                normalCallBack();
              }
            },
            err => {
              console.log(err);
            }
          );
      } else {
        this.normalMap = null;
        if (model) {
          this.adjustModel();
        }
      }
      return null;
    }
    /**
     * 更新模型
     * @params:
     * 		modelPath: String -- 模型文件地址
     * 		mtlPath: String -- 材质文件地址，为空时，模型默认材质MeshBasicMaterial
     * 		modelCallback: Function -- 模型更新后的回调
     * @returns Promise 或 null
     */
    updateModel(modelPath = '', mtlPath = '') {
      const {
        scene,
        options,
        model
      } = this;

      options.modelPath = modelPath;
      options.mtlPath = mtlPath;
      // 释放内存
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(ele => {
                ele.dispose();
              })
            } else {
              child.material.dispose();
            }
          }
        })
        scene.remove(model);
      }

      if (modelPath) {
        return this._loadModel()
          .then(
            (object) => {
              // mesh对象缓存
              this.model = object
              scene.add(object);
            },
            err => console.log(err)
          );
      }
      return null;
    }
    /**
     * 调整光照强度
     * @params
     * 	options: Object
     * 		main: Number -- 正面高光强度
     * 		around: Number -- 辅助灯强度
     * 		ambient: Number -- 环境灯强度
     */
    updatePointIntensity({
      main,
      around,
      ambient
    }) {
      const {
        mainPointLight,
        aroundPoints,
        ambientLight,
      } = this;

      if (main !== undefined && mainPointLight) {
        mainPointLight.intensity = main
      }
      if (around !== undefined && aroundPoints && aroundPoints.length > 0) {
        aroundPoints.forEach(ele => ele.intensity = around);
      }
      if (ambient !== undefined && ambientLight) {
        ambientLight.intensity = ambient
      }
    }
    /**
     * 调整光照颜色
     * @params
     * 	options: Object
     * 		main: String -- 正面高光颜色
     * 		around: String -- 辅助灯颜色
     * 		ambient: String -- 环境灯颜色
     */
    updatePointColor({
      main,
      around,
      ambient
    }) {
      const {
        mainPointLight,
        aroundPoints,
        ambientLight,
      } = this;

      if (main !== undefined && mainPointLight) {
        mainPointLight.color = new THREE.Color(main)
      }
      if (around !== undefined && aroundPoints && aroundPoints.length > 0) {
        aroundPoints.forEach(new THREE.Color(around));
      }
      if (ambient !== undefined && ambientLight) {
        ambientLight.color = new THREE.Color(ambient);
      }
    }
    /**
     * 调整法线贴图颗粒度
     * @params
     * 		scaleNumber: Number -- 颗粒度数值 [0, 1]
     */
    updateNormalScale(scaleNumber) {
      const {
        normalMap,
        material
      } = this;

      if (normalMap && material) {
        scaleNumber = Math.max(0, scaleNumber);
        scaleNumber = Math.min(1, scaleNumber);
        material.normalScale = new THREE.Vector2(scaleNumber, scaleNumber);
      }
    }
    /**
     * 调整法线贴图重复值
     * @params
     * 		repeat: Number -- 颗粒度数值 [1, 无穷大]
     */
    updateNormalRepeat(repeat) {
      const {
        normalMap,
        material,
        map
      } = this;

      if (normalMap && material) {
        repeat = Math.max(1, repeat);
        normalMap.repeat.set(repeat | 0, repeat | 0);
      }
    }
    /**
     * 调整材质参数roughness
     * @params
     * 		roughness: Number -- 粗糙度数值 [0, 1]
     */
    updateRoughness(roughness) {
      const {
        material
      } = this;

      if (material) {
        roughness = Math.max(0, roughness);
        roughness = Math.min(1, roughness);
        material.roughness = roughness;
      }
    }
    /**
     * 调整材质参数metalness
     * @params
     * 		metalness: Number -- 非金属度数值 [0, 1]
     */
    updateMetalness(metalness) {
      const {
        material
      } = this;

      if (material) {
        metalness = Math.max(0, metalness);
        metalness = Math.min(1, metalness);
        material.metalness = metalness;
      }
    }
    /**
     * 调整灯光锁定状态
     * @params
     * 		lockFlag: Boolean -- 是否锁定
     */
    updateLightLock(lockFlag) {
      const {
        camera,
        mainPointLight
      } = this;
      if (!lockFlag) {
        this.controls.diyMoveCB = function (controls) {
          mainPointLight.position.set(camera.position.x, camera.position.y, camera.position.z)
        }
      } else {
        this.controls.diyMoveCB = null;
      }
    }
    /**
     * 获取正面高光位置
     * @return
     * 		Position: Object -- 正面高光位置信息({x, y, z})
     */
    getMainPointPosition() {
      return Object.assign({}, this.mainPointLight.position);
    }
    /**
     * 释放内存
     */
    destroy() {
      // 删除动画
      if (this.animateID) {
        cancelAnimationFrame(this.animateID);
      }

      // 纹理
      if (this.map) {
        this.map.dispose();
      }
      if (this.normalMap) {
        this.normalMap.dispose();
      }

      // 控制组件
      if (this.controls) {
        this.controls.dispose();
      }

      // 模型
      if (this.model) {
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(ele => {
                ele.dispose();
              })
            } else {
              child.material.dispose();
            }
          }
        })
        this.scene.remove(this.model);
      }

      // 场景 
      if (this.scene) {
        this.scene.dispose();
      }

      // 渲染器
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
    /**
     * 调整模型材质
     */
    adjustModel() {
      let {
        model,
        options: {
          roughness,
          metalness,
          normalScale,
          mapPath,
          normalMapPath,
          composeFlag,
        }
      } = this;

      if (!model) {
        return false;
      }

      model.traverse((child) => {
        if (child instanceof THREE.Mesh || child.type === 'Mesh') {
          child.material = new THREE.MeshStandardMaterial();
          switch (child.name.toLowerCase()) {
            case 'phong':
              break;
            case 'standard':
            default:
              // 颜色贴图和漫反射，纯色背景通过mtl解析生成
              if (mapPath) {
                child.material.map = this.map;
              } else {
                child.material.map = null;
                // 用户异步交互，取消了颜色贴图
                if (this.map) {
                  this.map.dispose();
                  this.map = null;
                }
              }

              // 法线贴图
              if (normalMapPath) {
                child.material.normalMap = this.normalMap;
                normalScale = Math.max(0, normalScale);
                normalScale = Math.min(1, normalScale);
                child.material.normalScale = new THREE.Vector2(normalScale, normalScale);
              } else {
                child.material.normalMap = null;
                // 用户异步交互，取消了法线贴图
                if (this.normalMap) {
                  this.normalMap.dispose();
                  this.normalMap = null;
                }
              }

              if (child.material.isMeshStandardMaterial) {
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
          child.material.needsUpdate = true;
          if (!composeFlag) {
            child.material.side = THREE.DoubleSide;
          }
          // 材质缓存
          this.material = child.material;
        }
      })
      this._animateRender();
    }
    /**
     * 初始化
     */
    _init() {
      const {
        modelPath,
        mtlPath,
        mapPath,
        normalMapPath,
        el,
        afterCreate
      } = this.options;

      // 环境验证
      const gl = el.getContext("webgl");
      if (!gl) {
        console.log('您的浏览器不支持3D，请使用最新版chrome浏览器');
        return false;
      }

      // 同步任务
      this._initRenderer();
      this._initScene();
      this._initCamera();
      this._initControls();
      this._initLights();

      // 异步任务
      Promise.all([
        this.updateMap(mapPath),
        this.updateNormal(normalMapPath),
        this.updateModel(modelPath, mtlPath)
      ]).then(
        () => {
          // 组装模型
          this.adjustModel();
          if (afterCreate) {
            afterCreate(this);
          }
        },
        err => {
          console.log(err);
        }
      );
      this.updateLightLock(true);
    }
    /**
     * 渲染器构建
     */
    _initRenderer() {
      const {
        el,
        gl,
      } = this.options;
      const {
        width,
        height
      } = el;

      const renderer = new THREE.WebGLRenderer({
        canvas: el,
        // 开启抗锯齿
        antialias: true,
        // 保留缓冲区，以便导出图片
        preserveDrawingBuffer: true,
        context: gl,
      });
      renderer.setSize(width, height);
      this.renderer = renderer;
    }
    /**
     * 场景构建
     */
    _initScene() {
      this.scene = new THREE.Scene();
    }
    /**
     * 相机构建
     */
    _initCamera() {
      const {
        scene,
        originControlsTarget,
        originCameraPosition,
        options: {
          el: {
            width,
            height
          },
          cameraPosition,
          controlsTarget,
        },
      } = this;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
      // 设置初始相机位置
      this.camera = camera;
      this.setView(cameraPosition, controlsTarget);
      originCameraPosition.add(cameraPosition);
      originControlsTarget.add(controlsTarget);
      scene.add(camera);
    }
    _initControls() {
      const {
        options: {
          controlsTarget,
        },
      } = this;
      this.controls = new OrbitControler(this.camera, this.renderer.domElement);
      this.controls.target.copy(controlsTarget);
      this.controls.update();
    }
    /**
     * 灯光构建
     */
    _initLights() {
      const {
        scene,
        camera,
        lights,
        aroundPoints,
        options: {
          mainPointIntensity,
          mainPointPosition,
          mainPointColr,
        }
      } = this;

      // 增加一个相机位置的点光源
      const mainPointLight = new THREE.PointLight(mainPointColr, mainPointIntensity)
      mainPointLight.position.copy(mainPointPosition)
      scene.add(mainPointLight)
      // 正面高光，灯光缓存
      this.mainPointLight = mainPointLight;

      lights.forEach(ele => {
        let light = null
        switch (ele.type) {
          case 'PointLight':
            light = new THREE.PointLight(ele.color, ele.intensity);
            light.position.set(ele.position[0], ele.position[1], ele.position[2]);
            // 辅助灯光，辅助灯光缓存
            aroundPoints.push(light);
            break;
          case 'RectAreaLight':
            light = new THREE.DirectionalLight(ele.color, ele.intensity, ele.width, ele.height)
            light.position.set(ele.position[0], ele.position[1], ele.position[2])
            light.lookAt(ele.lookAt[0], ele.lookAt[1], ele.lookAt[2])
            break;
          case 'AmbientLight':
            light = new THREE.AmbientLight(ele.color, ele.intensity)
            // 环境灯光，灯光缓存
            this.ambientLight = light;
            break;
        }
        scene.add(light)
      });
    }
    /**
     *  纹理加载器
     * @param {String} path 图片地址
     * @returns Promise
     */
    _loadTexture(path) {
      return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(path,
          texture => {
            // 默认各向异性设定为4
            texture.anisotropy = 4;
            resolve(texture)
          },
          undefined,
          err => {
            reject(err)
          }
        );
      })
    }
    /**
     * 载入模型
     *  @returns: Promise
     */
    _loadModel() {
      const {
        scene,
        options: {
          modelPath,
          mtlPath,
        }
      } = this;
      const _this = this;
      if (modelPath && typeof modelPath === 'string') {
        const pointIndex = modelPath.lastIndexOf('.');
        const typeName = modelPath.slice(pointIndex + 1).toLowerCase();

        return new Promise((resolve, reject) => {
          // 判断模型格式
          if (typeName === 'drc') {
            // drc格式
            const dRACOLoaderCache = new THREE.DRACOLoader();

            dRACOLoaderCache.load(
              modelPath,
              function (geometry) {
                var material = new THREE.MeshStandardMaterial();
                var mesh = new THREE.Mesh(geometry, material);
                resolve(mesh);
              },
              function (xhr) {
                //				                	console.log(`${modelPath}: ${xhr.loaded / xhr.total * 100}% loaded`);
              },
              function (err) {
                reject(err);
              }
            );
          } else {
            // obj格式
            const OBJLoaderCache = new THREE.OBJLoader();
            // 材质文件不必须, 剔除mtl文件影响，采用drc模型文件格式
            if (false) {
              const mtlLoaderCache = new MTLLoader()
              mtlLoaderCache.load(mtlPath,
                function (materials) {
                  materials.preload();
                  OBJLoaderCache.setMaterials(materials);

                  OBJLoaderCache.load(modelPath,
                    function (object) {
                      resolve(object);
                    },
                    function (xhr) {
                      //					                	console.log(`${modelPath}: ${xhr.loaded / xhr.total * 100}% loaded`);
                    },
                    function (err) {
                      reject(err);
                    }
                  );
                },
                function (xhr) {
                  //			                	console.log(`${mtlPath}: ${xhr.loaded / xhr.total * 100}% loaded`);
                },
                function (err) {
                  reject(err);
                }
              );
            } else {
              OBJLoaderCache.load(modelPath,
                function (object) {
                  resolve(object);
                },
                function (xhr) {
                  //			                	console.log(`${modelPath}: ${xhr.loaded / xhr.total * 100}% loaded`);
                },
                function (err) {
                  reject(err);
                }
              );
            }
          }
        });

      }
    }

    // 持续更新renderer，赋能OrbitControls组件
    _animateRender() {
      const {
        composeFlag
      } = this.options;
      if (this.animateID) {
        cancelAnimationFrame(this.animateID);
      }
      if (!composeFlag) {
        this.animateID = requestAnimationFrame(this._animateRender.bind(this));
      }
      // 在渲染之前，重新设置设备像素比，修复模型位置错误
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.render(this.scene, this.camera);
      // 动画需要更新组件状态
      if (this.getImageData == true) {
        this.imgData = this.renderer.domElement.toDataURL('img/png');
        this.getImageData = false;
      }
      this.controls.update();
    }
  }
  /**
   * 3D预览类
   * 
   * 
   */
  class zw_model_previewer extends createRenderer {
    constructor(options) {
      const defaultOptions = {
        //				mtlPath: '',
      };
      const finalOptions = {};

      Object.assign(finalOptions, defaultOptions, options);
      // 配置项验证


      // 环境验证
      const gl = finalOptions.el.getContext("webgl");
      if (!gl) {
        console.log('您的浏览器不支持3D，请使用最新版chrome浏览器');
        return false;
      }
      super(finalOptions);
    }
  }

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = zw_model_previewer;
  } else {
    window.zw_model_previewer = zw_model_previewer;
  }
})();