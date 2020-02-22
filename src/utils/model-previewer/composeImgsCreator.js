;(function () {
  /**
   * 图片合成类 -- composeImgsCreator
   * @params:
   * 		options -- Object, 配置项
   * 			canvas: Element, 绘制图片的画布对象，默认为新建一个canvas对象
   * 			canvasSize: Number, 绘制区域宽，（px） 默认为2048
   * 			normalComposeFlag: Boolean, 是否为正常合图工具，默认false，为UV合图工具
   * 			backgroundUrl: String, 背景图地址
   * 			canvasColor: String, canvas默认背景色，默认为'#fff'
   * 			imgs: Array, 印刷面的相关配置对象imgObj列表
   * 				imgObj: {
   * 					name: 'A面',
   *              	width: 1200,
   *              	height: 1200,
   *              	url: '/static/admin/images/print/p1.jpg',
   *              	params: {
   *               		// 旋转角度
   *                  	angle: 0,
   *                  	// 水平镜像
   *                  	flipX: true,
   *                  	// 垂直镜像
   *                  	flipY: false,
   *                  	// 缩放比例
   *                  	scaleX: 0.4370,
   *                  	scaleY: 0.4370,
   *                  	// 绘制中心
   *                  	centerX,
   *                  	centerY,
   *                  	// 是否合成
   *                  	visible: true,
   *              	}
   * 				}
   * 实例方法：
   * 		startDraw: Function, 合成成功后的回调函数，回调函数第一个参数为合成后图片的DataUrl
   * 		setBGImg: Function, 更换配置项中的backgroundUrl
   * 		setBGColor: Function, 更换配置项中的canvasColor
   * 		setSize: Function, 更换配置项中的canvasSize
   * 		setImgs: Function, 更换配置项中的imgs
   */
  class composeImgsCreator {
    constructor(options) {
      this.defaultOptions = {
        canvas: document.createElement('canvas'),
        canvasSize: 2048,
        canvasColor: '#fff',
        backgroundUrl: '',
        imgs: [],
        normalComposeFlag: false,
        drawEnd: function () {},
      };
      this.options = {};

      Object.assign(this.options, this.defaultOptions, options);
      const {
        canvas,
        canvasSize,
        drawEnd
      } = this.options;
      // 配置项验证
      if (!this._isElement(canvas)) {
        throw new Error('配置项canvas: 必须是一个canvas DOM元素');
      }
      if (!this._isNumber(canvasSize)) {
        throw new Error('配置项canvasSize: 必须是一个Number');
      }

      // UV建立是参照的坐标系尺寸
      this._staticSize = 1024;
      // canvas对象缓存
      this.canvas = canvas;
      // 背景图缓存
      this._bgImg = null;
      // 需要绘制的图片缓存
      this._visibleImgs = [];
      // 图片导入缓存
      this._imgsMap = {};
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

    setBGColor(color) {
      this.options.canvasColor = color;
    }

    setSize(size) {
      if (!this._isNumber(size)) {
        throw new Error('setSize方法的参数size: 必须是一个Number');
      }
      this.options.canvasSize = size;
    }

    setImgs(imgs) {
      // 清空缓存
      this._imgsMap = {};
      this.options.imgs = imgs;
    }

    startDraw(callback) {
      if (callback && typeof callback !== 'function') {
        throw new Error('startDraw方法的参数可选：回调函数必须是一个Function');
      }

      // 图片载入管理
      this._imgNeedLoadNum = 0;
      this._imgLoadedNum = 0;
      this.clear();
      this._init(callback);
    }
    /**
     * 开始载入图片
     * @param:
     *		callback:  图片合成后的回调
     */
    _init(callback) {
      const {
        backgroundUrl,
        imgs
      } = this.options;

      this._visibleImgs = imgs.filter(imgObj => imgObj.params.visible);

      this._imgNeedLoadNum = this._visibleImgs.length;
      // 判断背景是图片还是颜色填充
      if (backgroundUrl) {
        this._imgNeedLoadNum++;
        this._loadImg(backgroundUrl, (img) => {
          this._imgLoadedNum++;
          this._bgImg = img;
          this._drawImg(callback);
        });
      }
      // 载入面图片
      if (this._visibleImgs.length > 0) {
        this._visibleImgs.forEach((imgObj) => {
          this._imgsMap[imgObj.name] = null;
          this._loadImg(imgObj.url, (img) => {
            this._imgLoadedNum++;
            this._imgsMap[imgObj.name] = img;
            this._drawImg(callback);
          });
        });
      } else {
        this._drawImg(callback);
      }
    }
    /**
     * 图片载入程序
     * @param:
     * 		url -- String, 图片载入地址
     * 		callback -- 图片载入后的回调函数, 第一个参数是载入的图片资源
     */
    _loadImg(url, callback) {
      const img = new Image();

      // 设置跨域
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;

      if (img.complete) {
        callback(img);
      } else {
        img.onload = function () {
          callback(img);
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
      if (this._imgNeedLoadNum === this._imgLoadedNum) {
        const {
          canvasSize,
          canvas,
          canvasColor,
          normalComposeFlag
        } = this.options;
        // 计算指定图片与UV关系图的缩放因子
        const scaleFactor = normalComposeFlag ? 1 : canvasSize / this._staticSize;
        // 绘制前，先设定尺寸、清空画布
        this._setSize(canvasSize);
        this.clear();
        // 首先绘制背景图
        if (this._bgImg) {
          this._ctx.drawImage(this._bgImg, 0, 0, canvasSize, canvasSize);
          // 将顶层像素与底层相应像素相乘，体现出材质贴图
          this._ctx.globalCompositeOperation = "multiply";
        } else {
          this._ctx.fillStyle = canvasColor;
          this._ctx.fillRect(0, 0, canvasSize, canvasSize);
          // 将顶层像素与底层相应像素相乘，体现出材质贴图
          this._ctx.globalCompositeOperation = "source-over";
        }
        // 依序绘制面图
        this._visibleImgs.forEach((imgObj) => {
          let img = this._imgsMap[imgObj.name];
          const defaultScale = this._staticSize * 0.25 / imgObj.width;
          const width = imgObj.width * (imgObj.params.scaleX || defaultScale) * scaleFactor;
          const height = imgObj.height * (imgObj.params.scaleX || defaultScale) * scaleFactor;

          // 是否镜像
          const flipX = imgObj.params.flipX ? -1 : 1;
          const flipY = imgObj.params.flipY ? -1 : 1;

          //					const left = imgObj.params.left * scaleFactor;
          //					const top = imgObj.params.top * scaleFactor;
          const angle = imgObj.params.angle * Math.PI / 180;
          const centerX = imgObj.params.centerX * scaleFactor;
          const centerY = imgObj.params.centerY * scaleFactor;

          // 镜像处理
          //					if(imgObj.params.flipX || imgObj.params.flipY) {
          //						const imgCanvas = document.createElement('canvas');
          //						const imgCtx = imgCanvas.getContext('2d');
          //						
          //						imgCanvas.width = img.width;
          //				        imgCanvas.height = img.height
          //				        imgCtx.translate((img.width - img.width * flipX)/2, (img.height - img.height * flipY)/2);
          //				        imgCtx.scale(flipX, flipY);
          //				        imgCtx.drawImage(img, 0, 0)
          //				        imgCtx.setTransform(1, 0, 0, 1, 0, 0);
          //				        img = imgCanvas;
          //					}

          this._ctx.save();
          this._ctx.translate(centerX, centerY);
          this._ctx.scale(flipX, flipY);
          this._ctx.rotate(angle * flipX * flipY);
          this._ctx.translate(-width / 2, -height / 2);

          this._ctx.drawImage(img, 0, 0, width, height);
          this._ctx.setTransform(1, 0, 0, 1, 0, 0);
          this._ctx.restore();
        });
        if (callback) {
          callback(canvas.toDataURL('img/png'));
        }
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
    module.exports = composeImgsCreator;
  } else {
    window.zw_composeImgsCreator = composeImgsCreator;
  }
})();