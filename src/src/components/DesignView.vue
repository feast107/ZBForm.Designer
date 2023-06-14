<template>
    <div class="fill" ref="view">
        <el-container>
            <el-header height="100px">
            
            </el-header>
            <el-container style="">
                <el-aside style="border: 1px solid firebrick">
                
                </el-aside>
                <el-container>
                    <el-main style="border: 1px solid yellowgreen;height:700px;width:900px">
                        <el-scrollbar>
                            <TwoPartView :top="-mousePos.Y" :left="-mousePos.X" :show="showViewer" width="200"
                                         height="200">
                                <div ref="view" style="height:700px;width:900px;position: relative">
                                    <div id="Container" class="fill" style="z-index: 50;top:0; left :0;">
                                        <DraggableRect v-for="rect in rects" :key="rect"
                                                       style="background-color: #00f3f380;" :rect="rect.region"
                                                       :on-select="()=>this.editRect(rect)"
                                                       :on-changed="rectChanged"
                                                       :on-resize-start="onResizeStart"
                                                       :on-resizing="onResizing"
                                                       :on-resize-end="onResizeEnd">
                                        </DraggableRect>
                                        <DraggableTable v-for="table in tables" :key="table"
                                                        style="background-color: #33f3a380;" :rect="table.region"
                                                        :on-select="()=>this.editRect(table)"
                                                        :on-changed="rectChanged"
                                                        :on-resize-start="onResizeStart"
                                                        :on-resizing="onResizing"
                                                        :on-resize-end="onResizeEnd"
                                        ></DraggableTable>
                                    </div>
                                    <div id="Background" class="fill" style="top:0; position: absolute;">
                                        <img class="fill" style="user-select: none;pointer-events: none"
                                             src="../assets/background.png" alt=""/>
                                    </div>
                                </div>
                            </TwoPartView>
                        </el-scrollbar>
                    </el-main>
                    <el-aside style="overflow: hidden">
                        <el-card class="box-card" style="height: 100%;" shadow="always">
                            <el-form v-if="this.editingRect != null">
                                <el-button type="danger" @click="()=>{ removeOne(this.editingRect) }">删除</el-button>
                                <el-descriptions
                                    title="区域"
                                    style="margin: 10px;"
                                    direction="vertical"
                                    :column="2"
                                    border
                                    v-if="this.editingRect.type === 'rect' "
                                >
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <TopLeft/>
                                            </el-icon>
                                            左上
                                        </template>
                                        <el-statistic prefix="X:" :value="this.editingRect.region.rectangle.LeftTop.X"/>
                                        <el-statistic prefix="Y:" :value="this.editingRect.region.rectangle.LeftTop.Y"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <TopRight/>
                                            </el-icon>
                                            右上
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.RightTop.X"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.RightTop.Y"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <BottomLeft/>
                                            </el-icon>
                                            左下
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.LeftBottom.X"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.LeftBottom.Y"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <BottomRight/>
                                            </el-icon>
                                            右下
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.X"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.Y"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="宽">
                                        <el-statistic :value="this.editingRect.region.rectangle.Width"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="高">
                                        <el-statistic :value="this.editingRect.region.rectangle.Height"/>
                                    </el-descriptions-item>
                                </el-descriptions>
                                <el-descriptions
                                    title="表格"
                                    style="margin: 10px;"
                                    direction="vertical"
                                    :column="2"
                                    border
                                    v-if="this.editingRect.type === 'table' "
                                >
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <TopLeft/>
                                            </el-icon>
                                            左上
                                        </template>
                                        <el-statistic prefix="X:" :value="this.editingRect.region.rectangle.LeftTop.X"/>
                                        <el-statistic prefix="Y:" :value="this.editingRect.region.rectangle.LeftTop.Y"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <BottomRight/>
                                            </el-icon>
                                            右下
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.X"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.Y"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="内部单元格">
                                        <el-button @click="() => showInfo = true">设置</el-button>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="识别模式">
                                        <el-button @click="() => showMode = true">设置</el-button>
                                    </el-descriptions-item>
                                </el-descriptions>
                            </el-form>
                        </el-card>
                    </el-aside>
                    <el-dialog v-if="showInfo"
                               v-model="showInfo" align-center
                               title="内部单元格">
                        <TableDetailView :table="editingRect"></TableDetailView>
                    </el-dialog>
                    <el-dialog v-if="showMode"
                               v-model="showMode" align-center
                               title="识别模式">
                        <TableModeView :table="editingRect"></TableModeView>
                    </el-dialog>
                </el-container>
            </el-container>
        </el-container>
    </div>

</template>

<script>
import TwoPartView from './controls/TwoPartView.vue'
import DraggableRect from './controls/DraggableRect.vue';
import DraggableTable from './controls/DraggableTable.vue';
import TableDetailView from "@/components/controls/TableDetailView.vue";
import TableModeView from "@/components/controls/TableModeView.vue";

import {Rect} from '@/utils/drawing/rect'
import {Point} from '@/utils/drawing/point';
import {Size} from '@/utils/drawing/size';
import {Table} from "@/models/table";

export default {
    components: {
        DraggableRect,
        DraggableTable,
        TwoPartView,
        TableDetailView,
        TableModeView
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
            showMode: false,
            showInfo: false,
            showViewer: false,
            drawer: true,
            rects: [
                {
                    mode: '',
                    type: 'rect',
                    region: {
                        rectangle: new Rect(50, 50, 50, 50)
                    }
                },
            ],
            tables: [
                {
                    modes: {
                        direction: 'vertical',
                    },
                    type: 'table',
                    region: new Table({
                        rectangle: new Rect(370, 372, 332, 176),
                        rowDefinitions: [85, 131],
                        columDefinitions: [119, 179]
                    }),
                },
                {
                    modes: {
                        direction: 'vertical'
                    },
                    type: 'table',
                    region: new Table({
                        rectangle: new Rect(300, 400, 100, 100),
                        rowDefinitions: [10, 20, 30],
                        columDefinitions: [10, 20, 30]
                    }),
                }
            ],
            editingRect: null,
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
            const rect = this.$refs.view.getBoundingClientRect();
            this.mousePos = new Point(e.pageX - 105 - rect.left, e.pageY - 105 - rect.top);
            this.showViewer = true;
        },
        /**
         *
         * @param {MouseEvent} e
         */
        onResizing(e) {
            const rect = this.$refs.view.getBoundingClientRect();
            this.mousePos = new Point(e.pageX - 105 - rect.left, e.pageY - 105 - rect.top);
        },
        onResizeEnd() {
            this.showViewer = false;
        },
        rectChanged(rectangle) {
        },
        editRect(rect) {
            if (this.editingRect !== rect) {
                this.editingRect = rect;
            }
            console.log(this.editingRect)
        },
        keydown(...args) {
            console.log(...args)
        },
        removeOne(item){
            switch (item.type){
                case 'rect':
                    this.rects.remove(item);
                    break;
                case 'table':
                    this.tables.remove(item);
                    break;
            }
            this.editingRect = null;
        }
    }
}
</script>

<style lang="scss">
.fill {
    height: 100%;
    width: 100%;
}

.hoverBox {
    height: 100%;
    width: 100%;
}

.hoverBox :hover {
    background-color: rgba(39, 89, 99, 0.78);
    transition-delay: 0.1s;
    transition-duration: 0.25s;
}

#Background {
}
</style>