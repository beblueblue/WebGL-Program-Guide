export default {
    beforeRouteLeave(to, from, next) {
        if(this.animateID) {
            cancelAnimationFrame(this.animateID)
        }
        if(this.gl) {
            this.gl.getExtension('WEBGL_lose_context').loseContext();
            this.gl = null;
        }
        next()
    },
}