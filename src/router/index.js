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
import RotatedTriangle_Matrix from '@p/multiPoint/RotatedTriangle_Matrix.vue'
import TranslatedTriangle_Matrix from '@p/multiPoint/TranslatedTriangle_Matrix.vue'
import ScaleTriangle_Matrix from '@p/multiPoint/ScaleTriangle_Matrix.vue'
import Rotated_Matrix from '@p/part3_MatrixAndAnimate/Rotated_Matrix.vue'
import RotatedAndTranslated from '@p/part3_MatrixAndAnimate/RotatedAndTranslated.vue'
import TranslatedAndRotated from '@p/part3_MatrixAndAnimate/TranslatedAndRotated.vue'
import RotatingTriangle from '@p/part3_MatrixAndAnimate/RotatingTriangle.vue'

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
        {
            path: '/RotatedTriangle_Matrix',
            name: 'RotatedTriangle_Matrix',
            component: RotatedTriangle_Matrix
        },
        {
            path: '/TranslatedTriangle_Matrix',
            name: 'TranslatedTriangle_Matrix',
            component: TranslatedTriangle_Matrix
        },
        {
            path: '/ScaleTriangle_Matrix',
            name: 'ScaleTriangle_Matrix',
            component: ScaleTriangle_Matrix
        },
        {
            path: '/Rotated_Matrix',
            name: 'Rotated_Matrix',
            component: Rotated_Matrix
        },
        {
            path: '/RotatedAndTranslated',
            name: 'RotatedAndTranslated',
            component: RotatedAndTranslated
        },
        {
            path: '/TranslatedAndRotated',
            name: 'TranslatedAndRotated',
            component: TranslatedAndRotated
        },
        {
            path: '/RotatingTriangle',
            name: 'RotatingTriangle',
            component: RotatingTriangle
        },
    ]
})