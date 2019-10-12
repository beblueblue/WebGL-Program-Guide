import Vue from 'vue';
import Router from 'vue-router';
import DrawPoint from '@p/drawPoint/DrawPoint.vue'
import DrawPoint2 from '@p/drawPoint/DrawPoint2.vue'
import DrawPointDynamic from '@p/drawPoint/DrawPointDynamic.vue'

Vue.use(Router);

export default  new Router({
    routes: [
        {
            path: '/DrawPoint',
            name: 'DrawPoint',
            component: DrawPoint
        },
        {
            path: '/DrawPoint2',
            name: 'DrawPoint2',
            component: DrawPoint2
        },
        {
            path: '/DrawPointDynamic',
            name: 'DrawPointDynamic',
            component: DrawPointDynamic
        },
    ]
})