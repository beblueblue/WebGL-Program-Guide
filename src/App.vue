<template>
  <div id="app">
    <h1 class="tc mt30 mb30">Hello, GLSL!</h1>
    <ul class="ml30 demo-title-box">
      <router-link to="DrawPoint" tag="li"><span class="fb">DrawPoint1</span>: 利用gl.drawArray绘制点</router-link>
      <router-link to="DrawPoint2" tag="li"><span class="fb">DrawPoint2</span>: 利用gl.vertexAttrib3f来传输attribute变量</router-link>
      <router-link to="DrawPointDynamic" tag="li"><span class="fb">DrawPointDynamic</span>: 鼠标点击，更新attribute变量</router-link>
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
