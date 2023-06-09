<template>
    <div style="position: absolute;" ref="ref"
         :style="`height:${rectangle.Height}px;width:${rectangle.Width}px;top:${rectangle.Top}px;left:${rectangle.Left}px;z-index:${index}`">
        <div :onmousedown="mousedown" :onclick="switchDrag" :onmouseup="mouseup" style="height: 100%;width:100%;">
            <div v-for="(col, index) in columDefinitions" :key="col"
                 :onmousedown="(e) => this.editDown(e, (point) => this.colEdit(point, index))"
                 :style="`left:${col}px;width:${this.showDrag ? 2 : 1}px;height:${rectangle.Height}px;background-color:${this.showDrag ? 'orange' : 'black'}`"
                 style="cursor: w-resize;" class="innerBorder"></div>
            <div v-for="(row, index) in rowDefinitions" :key="row"
                 :onmousedown="(e) => this.editDown(e, (point) => this.rowEdit(point, index))"
                 :style="`top:${row}px;height:${this.showDrag ? 2 : 1}px;width:${rectangle.Width}px;background-color:${this.showDrag ? 'orange' : 'black'}`"
                 style="cursor: n-resize;" class="innerBorder"></div>
        </div>
        <slot default style=""></slot>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeLeftTop)" :onmouseup="onResizeUp"
             style="cursor: nw-resize;"
             :style="`width: ${outer}px;height: ${outer}px;left: -${outer}px;top:-${outer}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeRightTop)" :onmouseup="onResizeUp"
             style="cursor: ne-resize;"
             :style="`width: ${outer}px;height: ${outer}px;right:-${outer}px;top:-${outer}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeLeftBottom)" :onmouseup="onResizeUp"
             style="cursor: sw-resize;"
             :style="`width: ${outer}px;height: ${outer}px;left: -${outer}px;bottom:-${outer}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeRightBottom)" :onmouseup="onResizeUp"
             style="cursor: se-resize;"
             :style="`width: ${outer}px;height: ${outer}px;right:-${outer}px;bottom:-${outer}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeLeft)" :onmouseup="onResizeUp"
             style="cursor: w-resize;"
             :style="`width: ${outer}px;height: ${rectangle.Height}px;left: -${outer}px;top: ${0}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeTop)" :onmouseup="onResizeUp"
             style="cursor: n-resize;"
             :style="`width: ${rectangle.Width}px;height: ${outer}px;left:  ${0}px;top:-${outer}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeRight)" :onmouseup="onResizeUp"
             style="cursor: e-resize;"
             :style="`width: ${outer}px;height: ${rectangle.Height}px;right:-${outer}px;top:${0}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
        <div class="resizer" :onmousedown="(e) => this.onResizeDown(e, this.resizeBottom)" :onmouseup="onResizeUp"
             style="cursor: s-resize;"
             :style="`width: ${rectangle.Width}px;height: ${outer}px;left:  ${0}px;bottom:-${outer}px;display:${showDrag ? '' : 'none'};background-color:${borderColor ?? borderDefault}`">
        </div>
    </div>
</template>

<script>
import {Point} from '@/utils/drawing/point';
import {Rect} from '@/utils/drawing/rect';

export default {
    props: ['rect', 'borderColor', 'onResizeStart', 'onResizing', 'onResizeEnd', 'onChanged'],
    data() {
        return {
            /**
             * @type {Rect}
             */
            rectangle: this.rect?.rectangle ?? new Rect(10, 10, 10, 10),
            dragging: false,
            dragged: false,
            editing: false,
            resizing: false,
            lastPoint: null,
            outer: 10,
            index: 99,
            showDrag: false,
            borderDefault: '#a0a0a080',
            /**
             * @type {Number[]}
             */
            rowDefinitions: this.rect?.rowDefinitions ?? [],
            /**
             * @type {Number[]}
             */
            columDefinitions: this.rect?.columDefinitions ?? []
        }
    },
    mounted() {
    },
    watch: {
        region: {
            deep: true,
            /**
             *
             * @param {Rect} n
             * @param {Rect} o
             */
            handler(n, o) {
                if (this.rowDefinitions.length && this.columDefinitions.length === 0) return;
                if (n.Height < this.rowDefinitions.last()) {
                    this.rowDefinitions[this.columDefinitions.length - 1] = n.Height;
                    this.rowDefinitions = this.rowDefinitions.orderBy(x => x);
                }
                if (n.Width < this.columDefinitions.last()) {
                    this.columDefinitions[this.columDefinitions.length - 1] = n.Width;
                    this.columDefinitions = this.columDefinitions.orderBy(x => x);
                }
            }
        },
        rowDefs: {
            deep: true,
            handler(n, o) {
                this.onChanged?.call(null, {
                    rectangle: this.rectangle,
                    columDefinitions : this.columDefinitions,
                    rowDefinitions : this.rowDefinitions
                });
            }
        },
        colDefs: {
            deep: true,
            handler(n, o) {
                this.onChanged?.call(null, {
                    rectangle: this.rectangle,
                    columDefinitions : this.columDefinitions,
                    rowDefinitions : this.rowDefinitions
                });
            }
        }
    },
    methods: {
        switchDrag() {
            if (this.dragged) return;
            this.showDrag = !this.showDrag;
        },
        mousedown(e) {
            if (this.editing) return;
            this.dragging = true;
            this.lastPoint = new Point(e.x, e.y);
            this.index = 100;
            window.onmousemove = this.mousemove;
        },
        mouseup(_) {
            this.dragging = false;
            this.lastPoint = null;
            window.onmousemove = null;
            this.index = 1;
            setTimeout(() => {
                this.dragged = false;
            }, 0);
        },
        mousemove(e) {
            if (!this.dragging) return;
            this.dragged = true;
            this.rectangle.moveTo(new Point(
                this.rectangle.Left + e.x - this.lastPoint.x,
                this.rectangle.Top + e.y - this.lastPoint.y));
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
        editDown(e, handler) {
            this.editing = true;
            this.dragging = false;
            this.lastPoint = new Point(e.x, e.y);
            window.onmousemove = (e) => {
                if (!this.editing) return;
                handler(new Point(e.x - this.lastPoint.x, e.y - this.lastPoint.y));
                this.lastPoint = new Point(e.x, e.y);
            }
            window.onmouseup = () => {
                window.onmouseup = null;
                this.columDefinitions = this.columDefinitions.orderBy(x => x);
                this.rowDefinitions = this.rowDefinitions.orderBy(x => x);
                this.editing = false;
                this.lastPoint = null;
            }
        },
        /**
         *
         * @param {Point} point
         * @param {Number} index
         */
        rowEdit(point, index) {
            if (this.rowDefinitions[index] >= this.rectangle.Height) {
                this.rowDefinitions[index] = this.rectangle.Height - 1;
                return;
            }
            if (this.rowDefinitions[index] <= 0) {
                this.rowDefinitions[index] = 1;
                return;
            }
            this.rowDefinitions[index] += point.Y;
        },
        /**
         *
         * @param {Point} point
         * @param {Number} index
         */
        colEdit(point, index) {
            if (this.columDefinitions[index] >= this.rectangle.Width) {
                this.columDefinitions[index] = this.rectangle.Width - 1;
                return;
            }
            if (this.columDefinitions[index] <= 0) {
                this.columDefinitions[index] = 1;
                return;
            }
            this.columDefinitions[index] += point.X;
        }
    }
}
</script>

<style lang="scss">
.resizer {
    position: absolute;
}

.innerTable {
    border-spacing: 0;
}

.innerBorder {
    position: absolute;
}
</style>