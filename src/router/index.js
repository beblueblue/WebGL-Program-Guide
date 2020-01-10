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

import MultiAttributeSize from '@p/part4_ColorAndTexture/MultiAttributeSize.vue'
import MultiAttributeSize_Interleaved from '@p/part4_ColorAndTexture/MultiAttributeSize_Interleaved.vue'
import ColoredPoint from '@p/part4_ColorAndTexture/ColoredPoint.vue'
import HelloTriangle_FragCoord from '@p/part4_ColorAndTexture/HelloTriangle_FragCoord.vue'
import TextrueQuad from '@p/part4_ColorAndTexture/TextrueQuad.vue'
import TextureQuad_Repeat from '@p/part4_ColorAndTexture/TextureQuad_Repeat.vue'
import MultiTexture from '@p/part4_ColorAndTexture/MultiTexture.vue'

import demo1_drawImage from '@p/workForDrawImage/demo1_drawImage.vue'
import demo2_drawImage from '@p/workForDrawImage/demo2_drawImage.vue'
import demo3_drawImage from '@p/workForDrawImage/demo3_drawImage.vue'
import demo4_drawImage from '@p/workForDrawImage/demo4_drawImage.vue'

import LookAtTriangles from '@p/part7_3D_World/LookAtTriangles.vue'
import LookAtRotatedTriangle from '@p/part7_3D_World/LookAtRotatedTriangle.vue'
import LookAtRotatedTriangle_mvMatrix from '@p/part7_3D_World/LookAtRotatedTriangle_mvMatrix.vue'
import LookAtTriangleWithKeys from '@p/part7_3D_World/LookAtTriangleWithKeys.vue'
import OrthoView from '@p/part7_3D_World/OrthoView.vue'
import LookAtTranglesWithKeys_ViewVolum from '@p/part7_3D_World/LookAtTranglesWithKeys_ViewVolum.vue'
import perspectiveView from '@p/part7_3D_World/perspectiveView.vue'
import perspectiveView_mvp from '@p/part7_3D_World/perspectiveView_mvp.vue'
import perspectiveView_mvpMatrix from '@p/part7_3D_World/perspectiveView_mvpMatrix.vue'
import DepthBuffer from '@p/part7_3D_World/DepthBuffer.vue'
import Zfighting from '@p/part7_3D_World/Zfighting.vue'
import HelloCube from '@p/part7_3D_World/HelloCube.vue'
import ColoredCube from '@p/part7_3D_World/ColoredCube.vue'

import loaderMtl from '@p/loaders/loaderMtl.vue'
import useHdr from '@p/loaders/useHdr.vue'
import useDraco from '@p/loaders/useDraco.vue'
import postProcessing from '@p/loaders/postProcessing.vue'

import LightedCube from '@p/part8_lights/LightedCube.vue'
import LightedCube_ambient from '@p/part8_lights/LightedCube_ambient.vue'
import LightTranslatedRotatedCube from '@p/part8_lights/LightTranslatedRotatedCube.vue'
import PointLightedCube from '@p/part8_lights/PointLightedCube.vue'
import PointLightedCube_animate from '@p/part8_lights/PointLightedCube_animate.vue'
import PointLightedCube_perFragment from '@p/part8_lights/PointLightedCube_perFragment.vue'
import PointLightedCube_perFragment_animate from '@p/part8_lights/PointLightedCube_perFragment_animate.vue'

import JointModel from '@p/part9_hierarchical_objects/JointModel.vue'
import MultiJointModel from '@p/part9_hierarchical_objects/MultiJointModel.vue'

import RotateObject from '@p/part10_advanced_technology/RotateObject.vue'
import PickObject from '@p/part10_advanced_technology/PickObject.vue'
import PickFace from '@p/part10_advanced_technology/PickFace.vue'
import HUD from '@p/part10_advanced_technology/HUD.vue'

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
        {
            path: '/MultiAttributeSize',
            name: 'MultiAttributeSize',
            component: MultiAttributeSize
        },
        {
            path: '/MultiAttributeSize_Interleaved',
            name: 'MultiAttributeSize_Interleaved',
            component: MultiAttributeSize_Interleaved
        },
        {
            path: '/ColoredPoint',
            name: 'ColoredPoint',
            component: ColoredPoint
        },
        {
            path: '/HelloTriangle_FragCoord',
            name: 'HelloTriangle_FragCoord',
            component: HelloTriangle_FragCoord
        },
        {
            path: '/TextrueQuad',
            name: 'TextrueQuad',
            component: TextrueQuad
        },
        {
            path: '/TextureQuad_Repeat',
            name: 'TextureQuad_Repeat',
            component: TextureQuad_Repeat
        },
        {
            path: '/MultiTexture',
            name: 'MultiTexture',
            component: MultiTexture
        },
        {
            path: '/demo1_drawImage',
            name: 'demo1_drawImage',
            component: demo1_drawImage
        },
        {
            path: '/demo2_drawImage',
            name: 'demo2_drawImage',
            component: demo2_drawImage
        },
        {
            path: '/demo3_drawImage',
            name: 'demo3_drawImage',
            component: demo3_drawImage
        },
        {
            path: '/demo4_drawImage',
            name: 'demo4_drawImage',
            component: demo4_drawImage
        },
        {
            path: '/LookAtTriangles',
            name: 'LookAtTriangles',
            component: LookAtTriangles
        },
        {
            path: '/LookAtRotatedTriangle',
            name: 'LookAtRotatedTriangle',
            component: LookAtRotatedTriangle
        },
        {
            path: '/LookAtRotatedTriangle_mvMatrix',
            name: 'LookAtRotatedTriangle_mvMatrix',
            component: LookAtRotatedTriangle_mvMatrix
        },
        {
            path: '/LookAtTriangleWithKeys',
            name: 'LookAtTriangleWithKeys',
            component: LookAtTriangleWithKeys
        },
        {
            path: '/OrthoView',
            name: 'OrthoView',
            component: OrthoView
        },
        {
            path: '/LookAtTranglesWithKeys_ViewVolum',
            name: 'LookAtTranglesWithKeys_ViewVolum',
            component: LookAtTranglesWithKeys_ViewVolum
        },
        {
            path: '/perspectiveView',
            name: 'perspectiveView',
            component: perspectiveView
        },
        {
            path: '/perspectiveView_mvp',
            name: 'perspectiveView_mvp',
            component: perspectiveView_mvp
        },
        {
            path: '/perspectiveView_mvpMatrix',
            name: 'perspectiveView_mvpMatrix',
            component: perspectiveView_mvpMatrix
        },
        {
            path: '/DepthBuffer',
            name: 'DepthBuffer',
            component: DepthBuffer
        },
        {
            path: '/Zfighting',
            name: 'Zfighting',
            component: Zfighting
        },
        {
            path: '/HelloCube',
            name: 'HelloCube',
            component: HelloCube
        },
        {
            path: '/ColoredCube',
            name: 'ColoredCube',
            component: ColoredCube
        },
        {
            path: '/loaderMtl',
            name: 'loaderMtl',
            component: loaderMtl
        },
        {
            path: '/useHdr',
            name: 'useHdr',
            component: useHdr
        },
        {
            path: '/useDraco',
            name: 'useDraco',
            component: useDraco
        },
        {
            path: '/postProcessing',
            name: 'postProcessing',
            component: postProcessing
        },
        {
            path: '/LightedCube',
            name: 'LightedCube',
            component: LightedCube
        },
        {
            path: '/LightedCube_ambient',
            name: 'LightedCube_ambient',
            component: LightedCube_ambient
        },
        {
            path: '/LightTranslatedRotatedCube',
            name: 'LightTranslatedRotatedCube',
            component: LightTranslatedRotatedCube
        },
        {
            path: '/PointLightedCube',
            name: 'PointLightedCube',
            component: PointLightedCube
        },
        {
            path: '/PointLightedCube_animate',
            name: 'PointLightedCube_animate',
            component: PointLightedCube_animate
        },
        {
            path: '/PointLightedCube_perFragment',
            name: 'PointLightedCube_perFragment',
            component: PointLightedCube_perFragment
        },
        {
            path: '/PointLightedCube_perFragment_animate',
            name: 'PointLightedCube_perFragment_animate',
            component: PointLightedCube_perFragment_animate
        },
        {
            path: '/JointModel',
            name: 'JointModel',
            component: JointModel
        },
        {
            path: '/MultiJointModel',
            name: 'MultiJointModel',
            component: MultiJointModel
        },
        {
            path: '/RotateObject',
            name: 'RotateObject',
            component: RotateObject
        },
        {
            path: '/PickObject',
            name: 'PickObject',
            component: PickObject
        },
        {
            path: '/PickFace',
            name: 'PickFace',
            component: PickFace
        },
        {
            path: '/HUD',
            name: 'HUD',
            component: HUD
        },
    ]
})