<template>
    <div style=" position: absolute;" ref="ref"
         :style="`height:${rectangle.Height}px;width:${rectangle.Width}px;top:${rectangle.Top}px;left:${rectangle.Left}px;z-index:${index}`">
                <div :onmousedown="mousedown" :onclick="switchDrag" style="height: 100%;width:100%;">
                </div>
        <slot default style=""></slot>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeLeftTop)" :onmouseup="onResizeUp"
             style="cursor: nw-resize;"
             :style="`width: ${outer}px;height: ${outer}px;left: -${outer}px;top:-${outer}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeRightTop)" :onmouseup="onResizeUp"
             style="cursor: ne-resize;"
             :style="`width: ${outer}px;height: ${outer}px;right:-${outer}px;top:-${outer}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeLeftBottom)" :onmouseup="onResizeUp"
             style="cursor: sw-resize;"
             :style="`width: ${outer}px;height: ${outer}px;left: -${outer}px;bottom:-${outer}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeRightBottom)" :onmouseup="onResizeUp"
             style="cursor: se-resize;"
             :style="`width: ${outer}px;height: ${outer}px;right:-${outer}px;bottom:-${outer}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeLeft)" :onmouseup="onResizeUp"
             style="cursor: w-resize;"
             :style="`width: ${outer}px;height: ${rectangle.Height}px;left: -${outer}px;top: ${0}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeTop)" :onmouseup="onResizeUp"
             style="cursor: n-resize;"
             :style="`width: ${rectangle.Width}px;height: ${outer}px;left:  ${0}px;top:-${outer}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeRight)" :onmouseup="onResizeUp"
             style="cursor: e-resize;"
             :style="`width: ${outer}px;height: ${rectangle.Height}px;right:-${outer}px;top:${0}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeBottom)" :onmouseup="onResizeUp"
             style="cursor: s-resize;"
             :style="`width: ${rectangle.Width}px;height: ${outer}px;left:  ${0}px;bottom:-${outer}px;display:${rectangle.showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
    </div>
</template>

<script>
import {Point} from '@/utils/drawing/point';
import {Rect} from '@/utils/drawing/rect';

export default {
    props: {
        rect: null,
        borderColor: {
            type: String,
            default: '#a0a0a080'
        },
        onResizeStart: {
            type: Function,
        },
        onResizing: {
            type: Function,
        },
        onResizeEnd: {
            type: Function,
        },
        onChanged: {
            type: Function,
        },
        onSelect: {
            type: Function,
        },
        onMove: {
            type: Function,
        },
        onContextMenu:{
            type : Function,
        }
    },
    data() {
        return {
            /**
             * @type {Rect}
             */
            rectangle: this.rect?.rectangle ?? new Rect(10, 10, 10, 10),
            dragging: false,
            dragged: false,
            resizing: false,
            lastPoint: null,
            outer: 10,
            index: 99,
            borderDefault: '#a0a0a080'
        }
    },
    watch: {
        rectangle: {
            handler(n, o) {
                this.change(n, o);
            },
            deep: true
        }
    },
    mounted() {
    },
    methods: {
        change(n, o) {
            //this.onChanged?.call(null, n, o);
        },
        /**
         * 切换四角
         */
        switchDrag() {
            if (this.dragged) return;
            this.rectangle.showDrag = !this.rectangle.showDrag;
            this.onSelect?.call(null, this.rect);
        },
        /**
         * 拖动按下
         * @param {MouseEvent} e
         */
        mousedown(e) {
            this.dragging = true;
            this.lastPoint = new Point(e.x, e.y);
            this.index = 100;
            window.onmousemove = this.mousemove;
            window.onmouseup = this.mouseup;
        },
        mouseup(_) {
            this.dragging = false;
            this.lastPoint = null;
            window.onmousemove = null;
            window.onmouseup = null;
            this.index = 1;
            if(_.button === 2){
                this.onContextMenu?.call(null,_);
            }
            setTimeout(() => {
                this.dragged = false;
            }, 0);
        },
        /**
         * 拖动中
         * @param {MouseEvent} e
         */
        mousemove(e) {
            if (!this.dragging) return;
            this.dragged = true;
            const offsetX = e.x - this.lastPoint.x;
            const offsetY = e.y - this.lastPoint.y;
            const left = this.rectangle.Left + offsetX;
            const top = this.rectangle.Top + offsetY;
            if (left < 0 || top < 0) {
                this.lastPoint = new Point(e.x, e.y);
                return;
            }
            this.rectangle.moveTo(new Point(left, top));
            this.onMove?.call(null, new Point(offsetX, offsetY));
            this.lastPoint = new Point(e.x, e.y);
        },
        /**
         *
         * @param {MouseEvent} event
         * @param {(Point)=>void} handler
         */
        onResizeDown(event, handler) {
            this.resizing = true;
            this.lastPoint = new Point(event.x, event.y);
            window.onmousemove = (e) => {
                if (!this.resizing) return;
                handler(new Point(e.x - this.lastPoint.x, e.y - this.lastPoint.y));
                this.lastPoint = new Point(e.x, e.y);
                this.onResizing?.call(null, e);
            };
            window.onmouseup = this.onResizeUp;
            this.onResizeStart?.call(null, event);
        },
        onResizeUp() {
            this.resizing = false;
            this.lastPoint = null;
            window.onmousemove = null;
            window.onmouseup = null;
            this.onResizeEnd?.call(null);
        },
        /**
         *
         * @param {Point} point
         */
        resizeLeftTop(point) {
            const tmp = this.rectangle.LeftTop;
            this.rectangle.LeftTop = new Point(tmp.X + point.X, tmp.Y + point.Y);
        },
        /**
         *
         * @param {Point} point
         */
        resizeRightTop(point) {
            const tmp = this.rectangle.RightTop;
            this.rectangle.RightTop = new Point(tmp.X + point.X, tmp.Y + point.Y);
        },
        /**
         *
         * @param {Point} point
         */
        resizeLeftBottom(point) {
            const tmp = this.rectangle.LeftBottom;
            this.rectangle.LeftBottom = new Point(tmp.X + point.X, tmp.Y + point.Y);
        },
        /**
         *
         * @param {Point} point
         */
        resizeRightBottom(point) {
            const tmp = this.rectangle.RightBottom;
            this.rectangle.RightBottom = new Point(tmp.X + point.X, tmp.Y + point.Y);
        },
        /**
         *
         * @param {Point} point
         */
        resizeLeft(point) {
            this.rectangle.Left += point.X;
        },
        /**
         *
         * @param {Point} point
         */
        resizeRight(point) {
            this.rectangle.Right += point.X;
        },
        /**
         *
         * @param {Point} point
         */
        resizeTop(point) {
            this.rectangle.Top += point.Y;
        },
        /**
         *
         * @param {Point} point
         */
        resizeBottom(point) {
            this.rectangle.Bottom += point.Y;
        },
    }
}
</script>

<style lang="scss">
.resizer {
    position: absolute;
}
</style>