<template>
    <div style=" position: absolute;" ref="ref"
        :style="`height:${region.Height}px;width:${region.Width}px;top:${region.Top}px;left:${region.Left}px;`">
        <div :onmousedown="mousedown" :onclick="switchDrag" :onmouseup="mouseup" style="height: 100%;width:100%;">
        </div>
        <slot default style=""></slot>
        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeLeftTop)" :onmouseup="resizeup"
            style="cursor: nw-resize;"
            :style="`width: ${outer}px;height: ${outer}px;left: -${outer}px;top:-${outer}px;display:${showDrag ? '' : 'none'}`">
        </div>
        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeRightTop)" :onmouseup="resizeup"
            style="cursor: ne-resize;"
            :style="`width: ${outer}px;height: ${outer}px;right:-${outer}px;top:-${outer}px;display:${showDrag ? '' : 'none'}`">
        </div>
        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeLeftBottom)" :onmouseup="resizeup"
            style="cursor: sw-resize;"
            :style="`width: ${outer}px;height: ${outer}px;left: -${outer}px;bottom:-${outer}px;display:${showDrag ? '' : 'none'}`">
        </div>
        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeRightBottom)" :onmouseup="resizeup"
            style="cursor: se-resize;"
            :style="`width: ${outer}px;height: ${outer}px;right:-${outer}px;bottom:-${outer}px;display:${showDrag ? '' : 'none'}`">
        </div>

        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeLeft)" :onmouseup="resizeup"
            style="cursor: w-resize;"
            :style="`width: ${outer}px;height: ${region.Height}px;left: -${outer}px;top: ${0}px;display:${showDrag ? '' : 'none'}`">
        </div>
        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeTop)" :onmouseup="resizeup" 
            style="cursor: n-resize;"
            :style="`width: ${region.Width}px;height: ${outer}px;left:  ${0}px;top:-${outer}px;display:${showDrag ? '' : 'none'}`">
        </div>
        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeRight)" :onmouseup="resizeup"
            style="cursor: e-resize;"
            :style="`width: ${outer}px;height: ${region.Height}px;right:-${outer}px;top:${0}px;display:${showDrag ? '' : 'none'}`">
        </div>
        <div class="resizer" :onmousedown="(e)=>this.resizedown(e,this.resizeBottom)" :onmouseup="resizeup"
            style="cursor: s-resize;"
            :style="`width: ${region.Width}px;height: ${outer}px;left:  ${0}px;bottom:-${outer}px;display:${showDrag ? '' : 'none'}`">
        </div>
    </div>
</template>

<script>
import { Point } from '@/utils/drawing/point';
import { Rect } from '@/utils/drawing/rect';
export default {
    props: ['rect'],
    data() {
        return {
            /**
             * @type {Rect}
             */
            region: this.rect ?? new Rect(10, 10, 10, 10),
            dragging: false,
            dragged: false,
            resizing: false,
            lastPoint: null,
            outer: 10,
            showDrag: true,
        }
    },
    mounted() {
        this.$refs.ref;
    },
    methods: {
        switchDrag() {
            if (this.dragged) return;
            this.showDrag = !this.showDrag;
        },
        mousedown(e) {
            this.dragging = true;
            this.lastPoint = new Point(e.x, e.y);
            window.onmousemove = this.mousemove;
        },
        mouseup(_) {
            this.dragging = false;
            this.lastPoint = null;
            window.onmousemove = null;
            setTimeout(() => {
                this.dragged = false;
            }, 0);
        },
        mousemove(e) {
            if (!this.dragging) return;
            this.dragged = true;
            let xOffset = e.x - this.lastPoint.x;
            let yOffset = e.y - this.lastPoint.y;
            var curr = new Point(this.region.Left + xOffset, this.region.Top + yOffset);
            this.region.moveTo(curr);
            this.lastPoint = new Point(e.x, e.y);
        },
        /**
         * 
         * @param {MouseEvent} event
         * @param {function<Point>} handler 
         */
        resizedown(event,handler) {
            this.resizing = true;
            this.lastPoint = new Point(event.x, event.y);
            window.onmousemove = (e)=>{
                if(!this.resizing)return;
                let xOffset = e.x - this.lastPoint.x;
                let yOffset = e.y - this.lastPoint.y;
                var curr = new Point(xOffset, yOffset);
                handler(curr);
                this.lastPoint = new Point(e.x, e.y);
            };
            window.onmouseup = this.resizeup; 
        },
        resizeup() {
            this.resizing = false;
            this.lastPoint = null;
            window.onmousemove = null;
            window.onmouseup = null;
        },
        /**
         * 
         * @param {Point} point 
         */
        resizeLeftTop(point) {
            var tmp = this.region.LeftTop;
            this.region.LeftTop = new Point(tmp.X + point.X , tmp.Y + point.Y); 
        },
         /**
         * 
         * @param {Point} point 
         */
         resizeRightTop(point) {
            var tmp = this.region.RightTop;
            this.region.RightTop = new Point(tmp.X + point.X , tmp.Y + point.Y); 
        },
         /**
         * 
         * @param {Point} point 
         */
         resizeLeftBottom(point) {
            var tmp = this.region.LeftBottom;
            this.region.LeftBottom = new Point(tmp.X + point.X , tmp.Y + point.Y); 
        },
         /**
         * 
         * @param {Point} point 
         */
         resizeRightBottom(point) {
            var tmp = this.region.RightBottom;
            this.region.RightBottom = new Point(tmp.X + point.X , tmp.Y + point.Y); 
        },
         /**
         * 
         * @param {Point} point 
         */
         resizeLeft(point) {
            var tmp = this.region.Left;
            this.region.Left = tmp + point.X;
        },
         /**
         * 
         * @param {Point} point 
         */
         resizeRight(point) {
            var tmp = this.region.Right;
            this.region.Right = tmp + point.X;
        },
         /**
         * 
         * @param {Point} point 
         */
         resizeTop(point) {
            var tmp = this.region.Top;
            this.region.Top = tmp + point.Y;
        },
         /**
         * 
         * @param {Point} point 
         */
         resizeBottom(point) {
            var tmp = this.region.Bottom;
            this.region.Bottom = tmp + point.Y; 
        },
    }
}
</script>

<style style="scss">
.resizer {
    position: absolute;
    background-color: #a0a0a080;
}
</style>