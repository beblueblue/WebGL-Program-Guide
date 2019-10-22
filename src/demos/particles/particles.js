import Vue from 'vue'
import Particles from './particles.vue'
import router from './router'

Vue.use(require('vue-wechat-title'))

new Vue({
    router,
    render: h => h(Particles)
}).$mount('#particles')