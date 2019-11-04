<template>
  <div id="app">
    <h1 class="header-title">Hello, GLSL!</h1>
    <div class="left-part pl20">
      <ul class="demo-title-box">
        <li><h3>第二章 WebGL入门</h3></li>
        <router-link to="DrawPoint" tag="li"><span class="fb">DrawPoint1</span>: 利用gl.drawArray绘制点</router-link>
        <router-link to="DrawPoint2" tag="li"><span class="fb">DrawPoint2</span>: 利用gl.vertexAttrib3f来传输attribute变量</router-link>
        <router-link to="DrawPointDynamic" tag="li"><span class="fb">DrawPointDynamic</span>: 鼠标点击，更新attribute变量</router-link>
        <router-link to="ColoredPoints" tag="li"><span class="fb">ColoredPoints</span>: 通过uniform变量控制片段着色器</router-link>
        
        <li class="mt20"><h3>第三章 绘制和变换三角形</h3></li>
        <router-link to="MultiPoint" tag="li"><span class="fb">MultiPoint</span>: 利用buffer object绘制多个点</router-link>
        <router-link to="HelloTriangle" tag="li"><span class="fb">HelloTriangle</span>: 利用buffer object绘制三角形</router-link>
        <router-link to="TranslatedTriangle" tag="li"><span class="fb">TranslatedTriangle</span>: 利用uniform变量平移三角形</router-link>
        <router-link to="RotatedTriangle" tag="li"><span class="fb">RotatedTriangle</span>: 利用uniform变量旋转三角形</router-link>
        <router-link to="TranslatedTriangle_Matrix" tag="li"><span class="fb">TranslatedTriangle_Matrix</span>: 利用矩阵平移三角形</router-link>
        <router-link to="RotatedTriangle_Matrix" tag="li"><span class="fb">RotatedTriangle_Matrix</span>: 利用矩阵旋转三角形</router-link>
        <router-link to="ScaleTriangle_Matrix" tag="li"><span class="fb">ScaleTriangle_Matrix</span>: 利用矩阵缩放三角形</router-link>
        <router-link to="HelloQuad_STRIP" tag="li"><span class="fb">HelloQuad_STRIP</span>: 利用buffer object绘制矩形</router-link>
        <router-link to="HelloQuad_FAN" tag="li"><span class="fb">HelloQuad_FAN</span>: 利用buffer object绘制矩形</router-link>

        <li class="mt20"><h3>第四章 高级变换和动画基础</h3></li>
        <router-link to="Rotated_Matrix" tag="li"><span class="fb">Rotated_Matrix</span>: 利用Matrix4工具来进行旋转</router-link>
        <router-link to="RotatedAndTranslated" tag="li"><span class="fb">RotatedAndTranslated</span>: 利用Matrix4工具来进行复合变换</router-link>
        <router-link to="TranslatedAndRotated" tag="li"><span class="fb">TranslatedAndRotated</span>: 利用Matrix4工具来进行复合变换</router-link>
        <router-link to="RotatingTriangle" tag="li"><span class="fb">RotatingTriangle</span>: 利用Matrix4工具来执行动画</router-link>
        
        <li class="mt20"><h3>第五章 颜色和纹理</h3></li>
        <router-link to="MultiAttributeSize" tag="li"><span class="fb">MultiAttributeSize</span>: 将非坐标数据传入顶点着色器</router-link>
        <router-link to="MultiAttributeSize_Interleaved" tag="li"><span class="fb">MultiAttributeSize_Interleaved</span>: 利用步进和偏移参数，将顶点坐标和尺寸写入同一个缓冲区</router-link>
        <router-link to="ColoredPoint" tag="li"><span class="fb">ColoredPoint</span>: 利用varying变量来控制点的颜色</router-link>
        <router-link to="HelloTriangle_FragCoord" tag="li"><span class="fb">HelloTriangle_FragCoord</span>: 利用gl_FragCoord变量来获取片元位置信息</router-link>
        <router-link to="TextrueQuad" tag="li"><span class="fb">TextrueQuad</span>: 运用纹理</router-link>
        <router-link to="TextureQuad_Repeat" tag="li"><span class="fb">TextureQuad_Repeat</span>: 运用纹理</router-link>
        <router-link to="MultiTexture" tag="li"><span class="fb">MultiTexture</span>: 多个纹理</router-link>
        
        <li class="mt20"><h3>第七章 进入三维世界</h3></li>
        <router-link to="LookAtTriangles" tag="li"><span class="fb">LookAtTriangles</span>: 设置视点、视线和上方向</router-link>
        <router-link to="LookAtRotatedTriangle" tag="li"><span class="fb">LookAtTriangles</span>: 设置modelMatrix -- 绕Z轴旋转</router-link>
        <router-link to="LookAtRotatedTriangle_mvMatrix" tag="li"><span class="fb">LookAtRotatedTriangle_mvMatrix</span>: 设置modelViewMatrix，提前计算模型视图矩阵</router-link>
        <router-link to="LookAtTriangleWithKeys" tag="li"><span class="fb">LookAtTriangleWithKeys</span>: 通过左右方向键，控制视点位置</router-link>
        <router-link to="OrthoView" tag="li"><span class="fb">OrthoView</span>: 通过setOrtho来创建正投影空间</router-link>
        <router-link to="LookAtTranglesWithKeys_ViewVolum" tag="li"><span class="fb">LookAtTranglesWithKeys_ViewVolum</span>: 利用投影矩阵，还原被裁剪的三角形</router-link>
        <router-link to="perspectiveView" tag="li"><span class="fb">perspectiveView</span>: 实践透视投影</router-link>
        <router-link to="perspectiveView_mvp" tag="li"><span class="fb">perspectiveView_mvp</span>: 实践模型矩阵，视图矩阵，投影矩阵（MVP）</router-link>
        <router-link to="perspectiveView_mvpMatrix" tag="li"><span class="fb">perspectiveView_mvpMatrix</span>: 优化MVP矩阵计算过程的调用次数</router-link>
        <router-link to="DepthBuffer" tag="li"><span class="fb">DepthBuffer</span>: 开启隐藏面消除 -- 顶点内存地址不干扰渲染深度</router-link>
        <router-link to="Zfighting" tag="li"><span class="fb">Zfighting</span>: 开启多边形偏移 -- 解决深度冲突问题</router-link>
        <router-link to="HelloCube" tag="li"><span class="fb">HelloCube</span>: gl.drawElements -- 绘制立方体</router-link>
        <router-link to="ColoredCube" tag="li"><span class="fb">ColoredCube</span>: gl.drawElements -- 绘制立方体，指定面颜色</router-link>
        
        <li class="mt20"><h3>番外： drawImage</h3></li>
        <router-link to="demo1_drawImage" tag="li"><span class="fb">demo1_drawImage</span>: 探究GPU实现drawImage接口--ctx.drawImage(image, dstX, dstY)</router-link>
        <router-link to="demo2_drawImage" tag="li"><span class="fb">demo2_drawImage</span>: 探究GPU实现drawImage接口--ctx.drawImage(image, dstX, dstY, dstWidth, dstHeight)</router-link>
        <router-link to="demo3_drawImage" tag="li"><span class="fb">demo3_drawImage</span>: 探究GPU实现drawImage接口--ctx.drawImage(image, dstX, dstY, dstWidth, dstHeight)</router-link>
        <router-link to="demo4_drawImage" tag="li"><span class="fb">demo4_drawImage</span>: 探究GPU实现drawImage接口--绘制纹理</router-link>
      </ul>
    </div>
    <div class="right-part">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.left-part {
  float: left;
  width: 420px;
}
.header-title {
  margin: 20px 0;
}
.right-part, .header-title {
  margin-left: 450px;
}
.demo-title-box>li {
  padding: 5px 0;
  cursor: pointer;
  font-size: 14px;
}
.demo-title-box>li.router-link-active {
  color: #428bca;
}
.demo-title-box {
  overflow: auto;
  max-height: 80vh;
  padding-right: 10px;
  padding-bottom: 10px;
}
</style>
