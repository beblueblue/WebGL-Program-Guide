import Vue from 'vue';
import Router from 'vue-router';
import DrawPoint from '@p/drawPoint/DrawPoint.vue'
import DrawPoint2 from '@p/drawPoint/DrawPoint2.vue'
import DrawPointDynamic from '@p/drawPoint/DrawPointDynamic.vue'
import ColoredPoints from '@p/drawPoint/ColoredPoints.vue'
import MultiPoint from '@p/multiPoint/MultiPoint.vue'
import HelloTriangle from '@p/multiPoint/HelloTriangle.vue'
import HelloQuad_STRIP from '@p/multiPoint/HelloQuad_STRIP.vue'
import HelloQuad_FAN from '@p/multiPoint/HelloQuad_FAN.vue'
import TranslatedTriangle from '@p/multiPoint/TranslatedTriangle.vue'
import RotatedTriangle from '@p/multiPoint/RotatedTriangle.vue'

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
        {
            path: '/ColoredPoints',
            name: 'ColoredPoints',
            component: ColoredPoints
        },
        {
            path: '/MultiPoint',
            name: 'MultiPoint',
            component: MultiPoint
        },
        {
            path: '/HelloTriangle',
            name: 'HelloTriangle',
            component: HelloTriangle
        },
        {
            path: '/HelloQuad_STRIP',
            name: 'HelloQuad_STRIP',
            component: HelloQuad_STRIP
        },
        {
            path: '/HelloQuad_FAN',
            name: 'HelloQuad_FAN',
            component: HelloQuad_FAN
        },
        {
            path: '/TranslatedTriangle',
            name: 'TranslatedTriangle',
            component: TranslatedTriangle
        },
        {
            path: '/RotatedTriangle',
            name: 'RotatedTriangle',
            component: RotatedTriangle
        },
    ]
})