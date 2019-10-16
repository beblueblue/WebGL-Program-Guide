<template>
  <div id="app">
    <h1 class="tc mt30 mb30">Hello, GLSL!</h1>
    <ul class="ml30 demo-title-box">
      <router-link to="DrawPoint" tag="li"><span class="fb">DrawPoint1</span>: 利用gl.drawArray绘制点</router-link>
      <router-link to="DrawPoint2" tag="li"><span class="fb">DrawPoint2</span>: 利用gl.vertexAttrib3f来传输attribute变量</router-link>
      <router-link to="DrawPointDynamic" tag="li"><span class="fb">DrawPointDynamic</span>: 鼠标点击，更新attribute变量</router-link>
      <router-link to="ColoredPoints" tag="li"><span class="fb">ColoredPoints</span>: 通过uniform变量控制片段着色器</router-link>
      <router-link to="MultiPoint" tag="li" class="mt10"><span class="fb">MultiPoint</span>: 利用buffer object绘制多个点</router-link>
      <router-link to="HelloTriangle" tag="li"><span class="fb">HelloTriangle</span>: 利用buffer object绘制三角形</router-link>
      <router-link to="TranslatedTriangle" tag="li"><span class="fb">TranslatedTriangle</span>: 利用uniform变量平移三角形</router-link>
      <router-link to="RotatedTriangle" tag="li"><span class="fb">RotatedTriangle</span>: 利用uniform变量旋转三角形</router-link>
      <router-link to="TranslatedTriangle_Matrix" tag="li"><span class="fb">TranslatedTriangle_Matrix</span>: 利用矩阵平移三角形</router-link>
      <router-link to="RotatedTriangle_Matrix" tag="li"><span class="fb">RotatedTriangle_Matrix</span>: 利用矩阵旋转三角形</router-link>
      <router-link to="ScaleTriangle_Matrix" tag="li"><span class="fb">ScaleTriangle_Matrix</span>: 利用矩阵缩放三角形</router-link>
      <router-link to="HelloQuad_STRIP" tag="li"><span class="fb">HelloQuad_STRIP</span>: 利用buffer object绘制矩形</router-link>
      <router-link to="HelloQuad_FAN" tag="li"><span class="fb">HelloQuad_FAN</span>: 利用buffer object绘制矩形</router-link>
    </ul>
    <div class="ml30 mt10">
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
.demo-title-box>li {
  padding: 5px 0;
  cursor: pointer;
  font-size: 14px;
}
</style>
