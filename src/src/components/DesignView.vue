<template>
    <div class="fill" ref="view">
        <TwoPartView :top="-mousePos.Y" :left="-mousePos.X" :show="showViewer" width="200" height="200">
            <div style="position: absolute; height:1000px;width:1400px">
                <div id="Container" class="fill" style="z-index: 50;top:0; left :0; position: absolute;">
                    <DraggableRect style="background-color: #00f3f380;" :rect="rect"
                                   :on-resize-start="onResizeStart" :on-resizing="onResizing"
                                   :on-resize-end="onResizeEnd">
                    </DraggableRect>
                    <DraggableTable style="background-color: #33f3a380;" :rect="table"
                                    :on-resize-start="onResizeStart" :on-resizing="onResizing"
                                    :on-resize-end="onResizeEnd"
                    ></DraggableTable>
                </div>
                <div id="Background" class="fill" style="top:0; position: absolute;">
                    <img class="fill" src="../assets/background.png" alt=""/>
                </div>
            </div>
        </TwoPartView>
    </div>
</template>

<script>
import TwoPartView from './controls/TwoPartView.vue'
import {Rect} from '@/utils/drawing/rect'
import DraggableRect from './controls/DraggableRect.vue';
import DraggableTable from './controls/DraggableTable.vue';
import {Point} from '@/utils/drawing/point';
import {Size} from '@/utils/drawing/size';

export default {
    components: {
        DraggableRect,
        DraggableTable,
        TwoPartView
    },
    created() {
        window.onresize = (e) => {
            let view = this.$refs.view;
            console.log(this.$refs.view)
            this.viewerSize = new Size(view.offsetWidth, view.offsetHeight);
            console.log(this.viewerSize);
        }
    },
    data() {
        window.Rect = Rect;
        return {
            showViewer: false,
            drawer: false,
            rect: {rectangle: new Rect(50, 50, 50, 50)},
            table: {
                rectangle: new Rect(200, 200, 100, 100),
                rowDefinitions: [10, 10],
                columDefinitions: [10, 10]
            },
            mousePos: new Point(0, 0),
            viewerSize: new Size(0, 0)
        };
    },
    methods: {
        /**
         *
         * @param {MouseEvent} e
         */
        onResizeStart(e) {
            this.mousePos = new Point(e.pageX - 110, e.pageY - 160);
            this.showViewer = true;
        },
        /**
         *
         * @param {MouseEvent} e
         */
        onResizing(e) {
            this.mousePos = new Point(e.pageX - 110, e.pageY - 160);
            console.log(this.rect)
            
        },
        onResizeEnd() {
            this.showViewer = false;
        }
    }
}
</script>

<style lang="scss">
.fill {
    height: 100%;
    width: 100%;
}
</style>