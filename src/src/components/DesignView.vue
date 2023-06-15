<template>
    <div class="fill" ref="view">
        <el-container style="height: 98%">
            <el-header >
                <div></div>
            </el-header>
            <el-container style="height: 80%">
                <el-aside width="auto">
                    <el-scrollbar>
                        <el-menu style="--active-color:#3390ef" :collapse="expand"
                                 :default-openeds="['1']">
                            <el-menu-item @click="()=> expand = !expand">
                                <el-icon>
                                    <DArrowRight v-if="expand"/>
                                    <DArrowLeft v-else/>
                                </el-icon>
                                <template #title>
                                    <span v-if="expand">展开</span>
                                    <span v-else>收起</span>
                                </template>
                            </el-menu-item>
                            <el-sub-menu index="1">
                                <template #title>
                                    <el-icon>
                                        <FullScreen/>
                                    </el-icon>
                                    <span>区域</span>
                                </template>
                                <el-menu-item style="padding: 0 20px">
                                    <el-space>
                                        <el-button @click="e=>configs.push(defaults.rect)">单元
                                        </el-button>
                                        <el-button @click="e=>configs.push(defaults.table)">表格</el-button>
                                    </el-space>
                                </el-menu-item>
                            </el-sub-menu>
                        </el-menu>
                    </el-scrollbar>
                </el-aside>
                <el-container>
                    <el-main style="box-shadow: inset 0 0 16px black;height:700px;width:900px">
                        <el-scrollbar style="background-color: red">
                            <TwoPartView :top="-mousePos.Y" :left="-mousePos.X" :show="showViewer" width="200"
                                         
                                         height="200">
                                <div ref="view" :style="`width:${viewerSize.Width}px;height:${viewerSize.Height}px`"
                                     style="position: relative">
                                    <div id="Container" class="fill" style="z-index: 50;top:0; left :0;"
                                    >
                                        <div v-for="config in configs" :key="config">
                                            <DraggableRect v-if="config.type === 'unit'"
                                                           style="background-color: #00f3f380;" :rect="config.region"
                                                           :on-select="()=>this.editRect(config)"
                                                           :on-changed="rectChanged"
                                                           :on-resize-start="onResizeStart"
                                                           :on-resizing="onResizing"
                                                           :on-resize-end="onResizeEnd">
                                            </DraggableRect>
                                            <DraggableTable v-if="config.type === 'table'"
                                                            style="background-color: #33f3a380;" :rect="config.region"
                                                            :on-select="()=>this.editRect(config)"
                                                            :on-changed="rectChanged"
                                                            :on-resize-start="onResizeStart"
                                                            :on-resizing="onResizing"
                                                            :on-resize-end="onResizeEnd"
                                            ></DraggableTable>
                                        </div>
                                    
                                    </div>
                                    <div id="Background" class="fill" style="top:0; position: absolute;"
                                         :onmousedown="mouseDown">
                                        <div class="fill" style="user-select: none;pointer-events: none">
                                            <img class="fill" style="user-select: none;pointer-events: none"
                                                 src="../assets/background.png" alt=""/>
                                        </div>
                                    </div>
                                </div>
                            </TwoPartView>
                        </el-scrollbar>
                    </el-main>
                    <el-aside style="overflow: hidden">
                        <el-card class="box-card" style="height: 100%;" shadow="always">
                            <div v-if="this.editingRect != null">
                                <el-button type="danger" @click="()=>{ removeOne(this.editingRect) }">删除</el-button>
                                <el-descriptions
                                    title="区域"
                                    style="margin: 10px;"
                                    direction="vertical"
                                    :column="2"
                                    border
                                    v-if="this.editingRect.type === 'unit' "
                                >
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <TopLeft/>
                                            </el-icon>
                                            左上
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.LeftTop.X* this.revertScale"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.LeftTop.Y* this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <TopRight/>
                                            </el-icon>
                                            右上
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.RightTop.X* this.revertScale"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.RightTop.Y* this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <BottomLeft/>
                                            </el-icon>
                                            左下
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.LeftBottom.X* this.revertScale"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.LeftBottom.Y* this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <BottomRight/>
                                            </el-icon>
                                            右下
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.X* this.revertScale"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.Y* this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="宽">
                                        <el-statistic
                                            :value="this.editingRect.region.rectangle.Width * this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="高">
                                        <el-statistic
                                            :value="this.editingRect.region.rectangle.Height* this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="识别模式">
                                        <el-select v-model="this.editingRect.mode" :placeholder="modePlaceholder">
                                            <el-option v-for="item in modes"
                                                       :key="item.value"
                                                       :label="item.name"
                                                       :value="item"
                                            />
                                        </el-select>
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
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.LeftTop.X* this.revertScale"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.LeftTop.Y* this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item>
                                        <template #label>
                                            <el-icon>
                                                <BottomRight/>
                                            </el-icon>
                                            右下
                                        </template>
                                        <el-statistic prefix="X:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.X* this.revertScale"/>
                                        <el-statistic prefix="Y:"
                                                      :value="this.editingRect.region.rectangle.RightBottom.Y* this.revertScale"/>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="内部单元格">
                                        <el-button @click="() => showInfo = true">设置</el-button>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="识别模式">
                                        <el-button @click="() => showMode = true">设置</el-button>
                                    </el-descriptions-item>
                                </el-descriptions>
                            </div>
                            <el-empty v-else description="未选中目标"></el-empty>
                        </el-card>
                    </el-aside>
                    <el-dialog v-if="showInfo"
                               v-model="showInfo" align-center style="border-radius: 20px"
                               title="内部单元格">
                        <TableDetailView :scale="this.revertScale" :table="editingRect"></TableDetailView>
                    </el-dialog>
                    <el-dialog v-if="showMode" style="border-radius: 20px"
                               v-model="showMode" align-center
                               title="识别模式">
                        <TableModeView :scale="this.revertScale" :options="modes" :placeholder="modePlaceholder"
                                       :table="editingRect"></TableModeView>
                    </el-dialog>
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import TwoPartView from './controls/TwoPartView.vue'
import TableModeView from "./controls/TableModeView.vue";
import DraggableRect from './controls/DraggableRect.vue';
import DraggableTable from './controls/DraggableTable.vue';
import TableDetailView from "./controls/TableDetailView.vue";

import {Point} from '@/utils/drawing/point';
import {Size} from '@/utils/drawing/size';
import {Rect} from '@/utils/drawing/rect'
import {Table} from "@/models/table";
import {Unit} from "@/models/unit";
import {Config, UnitConfig, TableConfig} from "@/models/config";

export default {
    computed: {
        Rect() {
            return Rect
        }
    },
    components: {
        DraggableRect,
        DraggableTable,
        TwoPartView,
        TableDetailView,
        TableModeView
    },
    created() {
        window.onwheel = this.mouseWheel;
        window.onkeydown = this.keyDown;
        window.onkeyup = this.keyUp;
    },
    beforeUnmount() {
        window.onresize = null;
        window.onwheel = null;
        window.onkeydown = null;
        window.onkeyup = null;
    },
    data() {
        window.Rect = Rect;
        return {
            expand: false,
            showMode: false,
            showInfo: false,
            showViewer: false,
            drawer: true,
            modes: [
                {name: '精准', value: 'precise'},
                {name: '布尔', value: 'bool'},
                {name: '字符', value: 'string'}
            ],
            modePlaceholder: '空',
            defaults: {
                get rect() {
                    return new UnitConfig({
                        mode: '',
                        type: 'unit',
                        region: new Unit({
                            rectangle: new Rect(50, 50, 50, 50)
                        })
                    })
                },
                get table() {
                    return new TableConfig({
                        modes: {
                            direction: 'horizontal',
                            configs: new Map(),
                        },
                        type: 'table',
                        region: new Table({
                            rectangle: new Rect(50, 50, 50, 50),
                            rowDefinitions: [25],
                            columDefinitions: [25]
                        })
                    })
                }
            },
            /**
             * @type {Config[]}
             */
            configs: [
                new TableConfig({
                    modes: {
                        direction: 'horizontal',
                    },
                    type: 'table',
                    region: new Table({
                        rectangle: new Rect(370, 372, 332, 176),
                        rowDefinitions: [85, 131],
                        columDefinitions: [119, 179]
                    }),
                }),
                new UnitConfig({
                    mode: '',
                    type: 'unit',
                    region: new Unit({
                        rectangle: new Rect(100, 100, 50, 50)
                    })
                })
            ],
            editingRect: null,
            mousePos: new Point(0, 0),
            viewerSize: new Size(900, 700),
            scaleChange: 0.9,
            revertScale: 1,
            scaling: false,
            copiedRect: null,
            lastClickPos: null,
        };
    },
    methods: {
        /**
         * @param {MouseEvent} e
         */
        onResizeStart(e) {
            const rect = this.$refs.view.getBoundingClientRect();
            this.mousePos = new Point(e.pageX - 105 - rect.left, e.pageY - 105 - rect.top);
            this.showViewer = true;
        },
        /**
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
            this.configs.forEach(x => {
                if (x !== rect) {
                    x.region.rectangle.showDrag = false;
                }
            })
        },
        mouseDown(e) {
            window.onmousemove = this.mouseMove;
            window.onmouseup = this.mouseUp;
            this.editingRect = null;
            this.configs.forEach(x => {
                x.region.rectangle.showDrag = false;
            })
            this.lastClickPos = new Point(e.offsetX, e.offsetY)
        },
        mouseMove(e) {
        
        },
        mouseUp(e) {
            window.onmousemove = null;
            window.onmouseup = null;
        },
        removeOne(item) {
            this.configs.remove(item);
            if (this.copiedRect === item) {
                this.copiedRect = null;
            }
            this.editingRect = null;
        },
        keyDown(event) {
            if (event.key === 'Control') {
                this.scaling = true;
            }
            console.log(event.key)
            if (event.key === 'Delete') {
                if (this.editingRect == null) return;
                this.removeOne(this.editingRect);
            }
            if (this.scaling) {
                if (event.key === 'c') {
                    this.copiedRect = this.editingRect;
                    if (this.editingRect != null) {
                        this.$message.success(`复制成功`);
                    } else {
                        this.$message.warning(`未选择复制目标`);
                    }
                }
                if (event.key === 'v') {
                    if (this.copiedRect != null) {
                        let clone = this.copiedRect.clone;
                        this.configs.push(clone);
                        if (this.lastClickPos != null) {
                            clone.region.rectangle.moveTo(this.lastClickPos);
                        }
                        this.$message.success(`粘贴成功`);
                    } else {
                        this.$message.warning(`没有复制的对象`);
                    }
                }
            }
            
        },
        keyUp(event) {
            if (event.key === 'Control') {
                this.scaling = false;
            }
        },
        mouseWheel(event) {
            if (!this.scaling) return;
            if (event.deltaY > 0) {
                this.viewerSize.scale(this.scaleChange);
                this.configs.forEach(x => x.scale(this.scaleChange));
                this.revertScale /= this.scaleChange;
            } else {
                this.viewerSize.scale(1 / this.scaleChange);
                this.configs.forEach(x => x.scale(1 / this.scaleChange));
                this.revertScale *= this.scaleChange;
            }
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