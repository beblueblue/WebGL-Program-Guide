import Vue from 'vue';
import Router from 'vue-router';
import DrawPoint from '@c/DrawPoint.vue'

Vue.use(Router);

export default  new Router({
    routes: [
        {
            path: '/DrawPoint',
            name: 'DrawPoint',
            component: DrawPoint
        }
    ]
})