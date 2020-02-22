;(function (undefined) {
  /**
   * 细节图合成类 -- composeDetail3D
   * @params:
   * 		options -- Object, 配置项
   * 			canvas: Element, 绘制图片的画布对象，默认为新建一个canvas对象
   * 			canvasSize: Number, 绘制区域宽，（px） 默认为600x600
   * 			canvasColor: String, canvas默认背景色，默认为'#fff'
   * 			dependencies: Object, 依赖组件，必填
   * 				{
   * 					composeImgsCreator: zw_composeImgsCreator, // composeImgsCreator.js 纹理图合成类
   * 					modelPreviewer: zw_model_previewer, // modelPreviewer.js 模型合成类
   * 				},
   * 			modelOptions: Array -- Object, 模型配置信息 
   * 				[{
   * 					detail3D: {
   * 						angle,
   * 						left,
   * 						top,
   * 						width,
   * 						height,
   * 						position,
   * 						target,
   * 						modelMap,
   * 						drcMap,
   * 						faceList: Array -- Object, 面配置数据
   * 							[{
   * 								id,
   * 								view_id，// 面索引id
   * 								name,
   * 								width,
   * 								height,
   * 								params,
   * 							}]
   * 					},
   * 					distortParams:{
   * 						p1,
   * 						p2,
   * 						p3,
   * 						p4
   * 					}
   * 				}]
   * 			faceListMap: Object, 面图片映射
   * 				{
   * 					[id]: img // id--面索引id, img -- 图片dataUrl
   * 				}
   * 			backgroundUrl: String or DataUrl, 背景图地址
   * 			foregroundUrl: String or DataUrl, 肌理图地址
   * 实例方法：
   * 		startDraw: Function, 合成成功后的回调函数，回调函数第一个参数为合成后图片的DataUrl
   */
  class composeDetail3D {
    constructor(options) {
      this.defaultOptions = {
        canvas: document.createElement('canvas'),
        canvasSize: 600,
        canvasColor: '#fff',
        dependencies: {
          composeImgsCreator: null,
          modelPreviewer: null,
        },
        modelOptions: [],
        faceListMap: null,
        backgroundUrl: '',
        foregroundUrl: '',
      };
      this.options = {};

      Object.assign(this.options, this.defaultOptions, options);
      const {
        canvas,
        canvasSize,
        dependencies,
        faceListMap
      } = this.options;
      // 配置项验证
      if (!this._isElement(canvas)) {
        throw new Error('配置项canvas: 必须是一个canvas DOM元素');
      }
      if (!this._isNumber(canvasSize)) {
        throw new Error('配置项canvasSize: 必须是一个Number');
      }
      if (dependencies === undefined || !dependencies.composeImgsCreator) {
        throw new Error('配置项dependencies: composeImgsCreator依赖不存在');
      }
      if (dependencies === undefined || !dependencies.modelPreviewer) {
        throw new Error('配置项dependencies: modelPreviewer依赖不存在');
      }
      if (!faceListMap) {
        throw new Error('配置项faceListMap: 面图像数据映射不存在');
      }

      // UV建立时参照的坐标系尺寸
      this._staticSize = 1024;
      // 模型图建立时参照的坐标系尺寸
      this._staticModelSize = 600;
      // 缓存模型比例关系
      this.modelScaleFactor = canvasSize / this._staticModelSize;
      // canvas对象缓存
      this.canvas = canvas;
      // 背景、肌理图缓存
      this._bgImg = null;
      this._bgImgLoaded = false;
      this._fgImg = null;
      this._fgImgLoaded = false;

      // 颜色贴图缓存
      this.colorMaps = [];
      this.colorMapsLoaded = false;
      // 合图程序
      this.modelPreviewers = [];
      this.modelPreviewersLoaded = false;
      // 模型图层缓存
      this.modelImgMaps = [];
      this.modelImgMapsLoaded = false;

      // 绘图对象缓存
      this._ctx = canvas.getContext('2d');
    }
    clear() {
      const {
        canvasSize
      } = this.options;
      // 清空画布
      this._ctx.clearRect(0, 0, canvasSize, canvasSize);
    }
    setBGImg(url) {
      // 清空缓存
      this._bgImg = null;
      this.options.backgroundUrl = url;
    }
    setFGImg(url) {
      // 清空缓存
      this._fgImg = null;
      this.options.foregroundUrl = url;
    }
    setBGColor(color) {
      this.options.canvasColor = color;
    }
    setSize(size) {
      if (!this._isNumber(size)) {
        throw new Error('setSize方法的参数size: 必须是一个Number');
      }
      this.options.canvasSize = size;
    }

    /**
     * 销毁程序，手动释放内存
     */
    destroy() {
      if (this.modelPreviewers && this.modelPreviewers.lenght > 0) {
        this.modelPreviewers.forEach(MPer => MPer.destroy())
        this.modelPreviewers = null;
      }
      this.modelImgMaps = null;
      this._fgImg = null;
      this._bgImg = null;
      this._ctx = null;
      this.canvas = null;
      return null;
    }

    /**
     * 更新颜色贴图
     * @params: 
     * 		faceListMap: Object, 面图片映射
     * 				{
     * 					[id]: img // id--面索引id, img -- 图片dataUrl
     * 				}
     * 		callback: Function, 回调函数
     */
    updateFaceListMap(faceListMap, callback) {
      if (callback && typeof callback !== 'function') {
        throw new Error('startDraw方法的参数可选：回调函数必须是一个Function');
      }

      this.options.faceListMap = faceListMap;

      if (this.modelPreviewersLoaded) {
        this._initColorMaps()
          .then(() => this._initModelImgMaps())
          .then(() => {
            this._drawImg(callback)
          });
      } else {
        // 加载颜色纹理，同时生成MPer
        const modelImgMapsPromise = Promise.all([
          this._initModelPreviewers(),
          this._initColorMaps(),
        ]).then(() => this._initModelImgMaps());

        Promise.all([
          this._initBgImg(),
          this._initBgImg(),
          modelImgMapsPromise
        ]).then(() => this._drawImg(callback));
      }
    }
    /**
     * 初始绘图程序
     * @params: 
     * 		callback: Function, 回调函数
     */
    startDraw(callback) {
      if (callback && typeof callback !== 'function') {
        throw new Error('startDraw方法的参数可选：回调函数必须是一个Function');
      }

      // 加载颜色纹理，同时生成MPer
      const modelImgMapsPromise = Promise.all([
        this._initModelPreviewers(),
        this._initColorMaps(),
      ]).then(() => this._initModelImgMaps());

      Promise.all([
        this._initBgImg(),
        this._initBgImg(),
        modelImgMapsPromise
      ]).then(() => this._drawImg(callback));
    }
    /**
     * 挂载 modelPreviewers
     * @retruns Promise 或 null
     */
    _initModelPreviewers() {
      const {
        options: {
          modelOptions,
        }
      } = this;
      this.modelPreviewersLoaded = false;

      if (modelOptions.length > 0) {
        const promiseList = modelOptions.map((modelParams, index) => {
          return this._createModelPreview(modelParams.detail3D).then(MPer => {
            this.modelPreviewers[index] = MPer;
          });
        })
        return Promise.all(promiseList).then(() => {
          this.modelPreviewersLoaded = true;
        })
      } else {
        this.modelPreviewersLoaded = true;
        return null;
      }
    }
    /**
     * 生成 MPer(moderPreviewer实例)
     * @params:
     * 		detail3D: Object -- 3D模型配置参数
     * @returns Promise
     */
    _createModelPreview(detail3D) {
      const {
        options: {
          dependencies: {
            modelPreviewer,
          },
          canvasSize,
        },
        modelScaleFactor,
      } = this;
      const canvas = document.createElement('canvas');
      canvas.width = detail3D.width * modelScaleFactor;
      canvas.height = detail3D.height * modelScaleFactor;

      detail3D.renderParams = Object.assign({}, {
        roughness: 0.95,
        metalness: 1,
        normalScale: 0.15,
        normalRepeat: 1,

        mainPointIntensity: 4,
        ambientLightIntensity: 0,
        aroundPointIntensity: 0,
      }, detail3D.renderParams);
      return new Promise((resolve, reject) => {
        try {
          new modelPreviewer({
            el: canvas,
            // 模型，材质，贴图
            modelPath: detail3D.drcMap || detail3D.modelMap,
            mtlPath: detail3D.mtlMap,
            normalMapPath: detail3D.normalMap,
            mapPath: '',
            // 材质参数
            roughness: detail3D.renderParams.roughness,
            metalness: detail3D.renderParams.metalness,
            normalScale: detail3D.renderParams.normalScale,
            normalRepeat: detail3D.renderParams.normalRepeat,
            // 灯光参数
            mainPointIntensity: detail3D.renderParams.mainPointIntensity,
            mainPointPosition: detail3D.renderParams.mainPointPosition,
            ambientLightIntensity: detail3D.renderParams.ambientLightIntensity,
            aroundPointIntensity: detail3D.renderParams.aroundPointIntensity,
            // 相机参数
            cameraPosition: detail3D.position,
            controlsTarget: detail3D.target,
            composeFlag: true,
            afterCreate: function (previewer) {
              resolve(previewer)
            }
          });
        } catch (err) {
          console.log('生成MPer失败：', err);
          reject(err);
        }
      })
    }
    /**
     * 挂载 colorMaps
     * @retruns Promise 或 null
     */
    _initColorMaps() {
      const {
        options: {
          modelOptions,
        }
      } = this;
      this.colorMapsLoaded = false;

      if (modelOptions.length > 0) {
        const promiseList = modelOptions.map((modelParams, index) => {
          return this._createColorMap(modelParams.detail3D).then(img => {
            this.colorMaps[index] = img;
          });
        })
        return Promise.all(promiseList).then(() => {
          this.colorMapsLoaded = true;
        })
      } else {
        this.colorMapsLoaded = true;
        return null;
      }
    }
    /**
     * 生成 colorMap
     * @params:
     * 		detail3D: Object -- 3D模型配置参数
     * @returns Promise
     */
    _createColorMap(detail3D) {
      const {
        _staticSize,
        options: {
          dependencies: {
            composeImgsCreator,
          },
          faceListMap,
        }
      } = this;

      // 先获取面数据
      const imgs = detail3D.faceList.map(ele => {
        ele.url = faceListMap[ele.view_id];
        return ele;
      });

      return new Promise((resolve, reject) => {
        try {
          const imgCreator = new composeImgsCreator({
            canvasSize: _staticSize * 2,
            canvasColor: detail3D.renderParams ? detail3D.renderParams.mtlColor || '#fff' : '#fff',
            imgs: imgs.slice(),
          });
          imgCreator.startDraw(function (img) {
            resolve(img);
          });
        } catch (err) {
          console.log('生成colorMap失败：', err);
          reject(err);
        }
      })
    }
    /**
     * 挂载 modelImgMaps
     * @retruns Promise 或 null
     */
    _initModelImgMaps() {
      const {
        colorMapsLoaded,
        modelPreviewersLoaded,
      } = this;

      this.modelImgMapsLoaded = false;
      if (colorMapsLoaded && modelPreviewersLoaded) {
        const {
          modelPreviewers,
          colorMaps
        } = this;
        const promiseList = colorMaps.map((map, index) => {
          return this._createModelImgMap(map, modelPreviewers[index]).then(img => {
            this.modelImgMaps[index] = img;
          });
        });
        return Promise.all(promiseList).then(() => {
          this.modelImgMapsLoaded = true;
        })
      }
      return null;
    }
    /**
     * 生成 modelImgMap
     * @params:
     * 		map: String -- 颜色贴图
     * 		MPer: Object -- 3D模型实例
     * @returns Promise
     */
    _createModelImgMap(map, MPer) {
      return new Promise((resolve, reject) => {
        try {
          MPer.updateMap(map).then(() => {
            MPer.adjustModel();
            this._loadImg(MPer.getCanvasImg(true), img => {
              resolve(img);
            })
          })
        } catch (err) {
          console.log('生成modelImgMap失败：', err);
          reject(err);
        }
      })
    }
    /**
     * 挂载 bgImg
     * @retruns Promise 或 null
     */
    _initBgImg() {
      const {
        _loadImg,
        options: {
          backgroundUrl
        }
      } = this;
      this._bgImgLoaded = false;
      if (backgroundUrl) {
        return new Promise((resolve, reject) => {
          try {
            _loadImg(backgroundUrl, img => {
              this._bgImg = img;
              this._bgImgLoaded = true;
              resolve();
            })
          } catch (err) {
            console.log('生成bgImg失败：', err);
            reject(err);
          }
        })
      } else {
        this._bgImgLoaded = true;
        return null;
      }
    }
    /**
     * 挂载 fgImg
     * @retruns Promise 或 null
     */
    _initFgImg() {
      const {
        _loadImg,
        options: {
          foregroundUrl
        }
      } = this;
      this._fgImgLoaded = false;
      if (foregroundUrl) {
        return new Promise((resolve, reject) => {
          try {
            _loadImg(foregroundUrl, img => {
              this._fgImg = img;
              this._fgImgLoaded = true;
              resolve();
            })
          } catch (err) {
            console.log('生成fgImg失败：', err);
            reject(err);
          }
        })
      } else {
        this._fgImgLoaded = true;
        return null;
      }
    }
    /**
     * 图片载入程序
     * @param:
     * 		url -- String, 图片载入地址
     * 		imgCallback -- 图片载入后的回调函数, 第一个参数是载入的图片资源
     */
    _loadImg(url, imgCallback) {
      const img = new Image();

      // 设置跨域
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;

      if (img.complete) {
        imgCallback(img);
      } else {
        img.onload = function () {
          imgCallback(img);
        }
      }
    }
    _setSize(size) {
      this.canvas.width = size;
      this.canvas.height = size;
    }
    /**
     * 图片绘制程序
     * @param:
     * 		callback -- 图片载入后的回调函数, 第一个参数是合成后图片的DataUrl
     */
    _drawImg(callback) {
      // 所有图片请求返回后，开始绘图
      const {
        _bgImg,
        _bgImgLoaded,
        _fgImg,
        _fgImgLoaded,
        modelImgMaps,
        modelImgMapsLoaded,
        modelScaleFactor: scaleFactor,
        options: {
          modelOptions,
          canvasSize,
          canvasColor
        },
        _ctx,
        canvas,
      } = this;

      // 绘制前，先设定尺寸、清空画布
      this._setSize(canvasSize);
      this.clear();

      // 首先绘制背景图
      if (_bgImg) {
        _ctx.drawImage(_bgImg, 0, 0, canvasSize, canvasSize);
      }
      // 关闭背景色，为了不透明背景
      //				else {
      //					_ctx.fillStyle = canvasColor;
      //					_ctx.fillRect( 0, 0, canvasSize, canvasSize );
      //				}
      // 依序绘制模型图
      if (modelOptions.length > 0 && modelImgMapsLoaded) {
        modelOptions.forEach((ele, index) => {
          const img = modelImgMaps[index];
          const {
            detail3D,
            distortParams
          } = ele;
          // 计算中心点位置
          const p1 = distortParams.p1.split(',');
          const p2 = distortParams.p2.split(',');
          const p3 = distortParams.p3.split(',');
          const p4 = distortParams.p4.split(',');
          const minX = Math.min(p1[0], p2[0], p3[0], p4[0]);
          const minY = Math.min(p1[1], p2[1], p3[1], p4[1]);
          const maxX = Math.max(p1[0], p2[0], p3[0], p4[0]);
          const maxY = Math.max(p1[1], p2[1], p3[1], p4[1]);
          const centerX = (minX + maxX) * scaleFactor / 2;
          const centerY = (minY + maxY) * scaleFactor / 2;

          const width = detail3D.width * scaleFactor;
          const height = detail3D.height * scaleFactor;
          const angle = detail3D.angle * Math.PI / 180;

          _ctx.save();
          _ctx.translate(centerX, centerY);
          _ctx.rotate(angle);
          _ctx.translate(-width / 2, -height / 2);

          _ctx.drawImage(img, 0, 0, width, height);
          _ctx.setTransform(1, 0, 0, 1, 0, 0);
          _ctx.restore();
        });
      }

      // 首先绘制肌理图
      if (_fgImg) {
        _ctx.drawImage(_fgImg, 0, 0, canvasSize, canvasSize);
      }

      if (callback) {
        callback(canvas.toDataURL('img/png'));
      }
    }

    _isNumber(val) {
      return !isNaN(parseFloat(val))
    }
    _isElement(o) {
      return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
      );
    }
  }

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = composeDetail3D;
  } else {
    window.composeDetail3D = composeDetail3D;
  }
})(undefined);