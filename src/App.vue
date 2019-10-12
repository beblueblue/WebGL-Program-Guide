<template>
  <div id="app">
    <h1 class="tc mt30 mb30">Hello, GLSL!</h1>
    <ul class="ml30">
      <li>
        <router-link to="DrawPoint">利用gl.drawArray绘制点</router-link>
      </li>
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

</style>
