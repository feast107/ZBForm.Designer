<template>
    <div class="fill" ref="view">
        <el-container style="height: 98%">
            <el-header>
                <el-row style="margin-top: 20px">
                    <el-col :span="8"></el-col>
                    <el-col :span="8" style="text-align: center">
                        <el-input-number v-model="this.currentScale"
                                         :min="25" :max="200" :step="25"
                                         @change="onScaleChange"/>
                    </el-col>
                    <el-col :span="8" style="text-align: end">
                        <el-button-group>
                            <el-button plain type="info" @click="showStats = true">
                                设计数据
                            </el-button>
                            <el-button :disabled="
                            this.selectRects == null
                            || this.selectRects.length === 0" plain type="danger"
                                       @click="_ => { this.delete(); }">
                                删除所选
                            </el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </el-header>
            <el-container style="height: 80%">
                <el-aside width="auto">
                    <el-scrollbar>
                        <el-menu style="--active-color:#3390ef;" :collapse="!expand" :default-openeds="['0']">
                            <el-menu-item @click="()=> expand = !expand">
                                <el-icon>
                                    <Expand v-if="expand"/>
                                    <Fold v-else/>
                                </el-icon>
                                <template #title>
                                    <span v-if="expand">展开</span>
                                    <span v-else>收起</span>
                                </template>
                            </el-menu-item>
                            <el-menu-item-group>
                                <el-sub-menu style="background-color: #f2f2f2"
                                             v-for="(menu,index) in menus"
                                             :key="menu"
                                             :index="`${index}`">
                                    <template #title>
                                        <el-icon>
                                            <component :is="menu.icon"></component>
                                        </el-icon>
                                        <span>{{ menu.label }}</span>
                                    </template>
                                    <el-menu-item v-for="item in menu.items" :key="item">
                                        <el-row :gutter="4" style="width: 100%;margin-right: 10px;">
                                            <el-col :span="20">
                                                <span>{{ item.label }}</span>
                                            </el-col>
                                            <el-col :span="4">
                                                <el-button style="vertical-align: center;width: 100%;"
                                                           :type="menu.style" plain
                                                           @click="_=>item.event(currentPage?.configs)"/>
                                            </el-col>
                                        </el-row>
                                    </el-menu-item>
                                </el-sub-menu>
                            </el-menu-item-group>
                        </el-menu>
                    </el-scrollbar>
                </el-aside>
                <el-container>
                    <el-container>
                        <el-main style="box-shadow: inset 0 0 16px black;">
                            <el-scrollbar v-if="currentPage != null" style="background-color: #c2c2c2">
                                <TwoPartView :top="-mousePos.Y" :left="-mousePos.X" :show="showViewer"
                                             
                                             width="200" height="200">
                                    <div ref="view" :style="`width:${viewerSize.Width}px;height:${viewerSize.Height}px`"
                                         style="position: relative"
                                    >
                                        <div v-show="wrapRegion != null" style="
                                        position: absolute;top:0;left: 0;width:100%;height:100%;
                                         z-index: 100" :onmousemove="mouseMove"></div>
                                        <div id="Container" class="fill" style="z-index: 50;top:0; left :0;"
                                        >
                                            <div v-for="config in configs" :key="config">
                                                <DraggableRect v-if="config.type !== 'table'"
                                                               :style="`background-color: ${config.backgroundColor}`"
                                                               :rect="config.region"
                                                               :on-select="()=>this.editRect(config)"
                                                               :on-move="(move) => rectChanged(config,move)"
                                                               :on-resize-start="onResizeStart"
                                                               :on-resizing="onResizing"
                                                               :on-resize-end="onResizeEnd">
                                                </DraggableRect>
                                                <DraggableTable v-if="config.type === 'table'"
                                                                :style="`background-color: ${config.backgroundColor}`"
                                                                :rect="config.region"
                                                                :on-select="()=>this.editRect(config)"
                                                                :on-move="(move) => rectChanged(config,move)"
                                                                :on-resize-start="onResizeStart"
                                                                :on-resizing="onResizing"
                                                                :on-resize-end="onResizeEnd"
                                                ></DraggableTable>
                                            </div>
                                            <div v-if="wrapRegion!=null"
                                                 style="
                                                 position: absolute;
                                                 background-color: #00000020;z-index: 100;
                                                 user-select: none;pointer-events: none"
                                                 :style="`top:${wrapRegion.Top
                                                 }px;left:${
                                                     wrapRegion.Left
                                                 }px;width:${
                                                     wrapRegion.Width
                                                 }px;height:${
                                                     wrapRegion.Height
                                                 }px;`"></div>
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
                        <el-footer>
                            <el-pagination style="display: inline-flex;margin-top: 10px"
                                           :background="true"
                                           layout="prev, pager, next, jumper"
                                           :total="pages.length * 10"
                                           @current-change="val => this.currentPage = pages[val-1]"
                            />
                        </el-footer>
                    </el-container>
                    <el-aside style="overflow: hidden;height:100%">
                        <el-scrollbar style="height: 100%">
                            <el-card class="box-card" style="height: 100%;" shadow="never">
                                <div v-if="this.editingRect != null">
                                    <el-collapse v-model="actives">
                                        <el-collapse-item title="基本属性" name="1">
                                            <el-form-item label="模板:">
                                                {{ this.editingRect.template.label }}
                                            </el-form-item>
                                            <el-form-item label="编号:">
                                                {{ this.editingRect.id }}
                                            </el-form-item>
                                            <el-form-item label="名称:">
                                                <el-input v-model="this.editingRect.name"></el-input>
                                            </el-form-item>
                                            <el-form-item
                                                v-if="editingRect.template.type !== 'table'
                                            && editingRect.template.options != null" label="类型:">
                                                <el-select v-model="this.editingRect.region.mode"
                                                           :type="editingRect.template.style"
                                                           :placeholder="modePlaceholder">
                                                    <el-option v-for="item in editingRect.template.options"
                                                               :type="editingRect.template.style"
                                                               :key="item.value"
                                                               :label="item.name"
                                                               :value="item"
                                                    />
                                                </el-select>
                                            </el-form-item>
                                        </el-collapse-item>
                                        <el-collapse-item title="控件位置" name="2">
                                            <el-form-item label="左上">
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.LeftTop.X* this.revertScale"/>
                                                ,
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.LeftTop.Y* this.revertScale"/>
                                            </el-form-item>
                                            <el-form-item label="右上">
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.RightTop.X* this.revertScale"/>
                                                ,
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.RightTop.Y* this.revertScale"/>
                                            </el-form-item>
                                            <el-form-item label="左下">
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.LeftBottom.X* this.revertScale"/>
                                                ,
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.LeftBottom.Y* this.revertScale"/>
                                            </el-form-item>
                                            <el-form-item label="右下:">
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.RightBottom.X* this.revertScale"/>
                                                ,
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.RightBottom.Y* this.revertScale"/>
                                            </el-form-item>
                                        </el-collapse-item>
                                        <el-collapse-item title="控件尺寸" name="3">
                                            <el-form-item label="宽">
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.Width * this.revertScale"/>
                                            </el-form-item>
                                            <el-form-item label="高">
                                                <el-statistic
                                                    :value="this.editingRect.region.rectangle.Height* this.revertScale"/>
                                            </el-form-item>
                                        </el-collapse-item>
                                        <el-collapse-item v-if="this.editingRect.type === 'table' " title="表格属性"
                                                          name="4">
                                            <el-form-item label="表格行列:">
                                                <el-button style="margin-bottom: 10px" @click="() => showInfo = true">
                                                    查看设置
                                                </el-button>
                                            </el-form-item>
                                            <el-form-item label="识别类型:">
                                                <el-button style="margin-bottom: 10px" @click="() => showMode = true">
                                                    查看设置
                                                </el-button>
                                            </el-form-item>
                                        </el-collapse-item>
                                    </el-collapse>
                                </div>
                                <el-empty v-else description="未选中目标"></el-empty>
                            </el-card>
                        </el-scrollbar>
                    </el-aside>
                    <el-dialog v-if="showInfo"
                               v-model="showInfo" align-center style="border-radius: 20px"
                               title="内部单元格">
                        <TableDetailView :scale="this.revertScale" :table="editingRect"></TableDetailView>
                    </el-dialog>
                    <el-dialog v-if="showMode" style="border-radius: 20px"
                               v-model="showMode" align-center
                               title="识别模式">
                        <TableModeView :scale="this.revertScale"
                                       :options="editingRect.template.options"
                                       :placeholder="modePlaceholder"
                                       :table="editingRect"></TableModeView>
                    </el-dialog>
                    <el-dialog v-if="showStats" v-model="showStats" style="border-radius: 20px;width: 70%">
                        <el-table border stripe :data="stats" row-key="id">
                            <el-table-column prop="page" label="页码"></el-table-column>
                            <el-table-column prop="num" label="编号"></el-table-column>
                            <el-table-column prop="name" label="名称"></el-table-column>
                            <el-table-column prop="template" label="模板" width="100"></el-table-column>
                            <el-table-column prop="x" label="X1" width="60"></el-table-column>
                            <el-table-column prop="y" label="Y1" width="60"></el-table-column>
                            <el-table-column prop="width" label="宽" width="60"></el-table-column>
                            <el-table-column prop="height" label="高" width="60"></el-table-column>
                            <el-table-column prop="mode" label="类型" width="80"></el-table-column>
                        </el-table>
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
import {Page} from "@/models/page";
import {TemplateGroup, TemplateItem} from "@/models/template";

export default {
    computed: {
        TableConfig() {
            return TableConfig
        },
        UnitConfig() {
            return UnitConfig
        },
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
        this.currentPage = this.pages[0];
    },
    beforeUnmount() {
        window.onresize = null;
        window.onwheel = null;
        window.onkeydown = null;
        window.onkeyup = null;
    },
    watch: {
        selectTab(n, o) {
            console.log(n)
        }
    },
    data() {
        window.Rect = Rect;
        return {
            /**
             * @type {Rect}
             */
            wrapRegion: null,
            expand: true,
            showStats: false,
            showMode: false,
            showInfo: false,
            showViewer: false,
            drawer: true,
            actives: ['1', '2', '3'],
            menus: [
                new TemplateGroup('单据类', "Ticket", 'primary',
                    [
                        new TemplateItem('精准控件', 'precise', '#5dc9f180',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '数值', value: 'number'},
                                {name: '布尔', value: 'bool'},
                                {name: '字母', value: 'char'}
                            ]),
                        new TemplateItem('常规控件', 'normal', '#5dc9f180',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '字符', value: 'string'},
                                {name: '绘图', value: 'draw'},
                                {name: '身份证', value: 'id'}
                            ]),
                        new TemplateItem('表格控件', 'table', '#5dc9f180',
                            function (configs) {
                                configs.push(TableConfig.fromTemplate(this))
                            }, [
                                {name: '数值', value: 'number'},
                                {name: '布尔', value: 'bool'},
                                {name: '字母', value: 'char'}
                            ]),
                        new TemplateItem('图形控件', 'graphics', '#5dc9f180',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }),
                    ]),
                new TemplateGroup('书写类', 'EditPen', 'warning',
                    [
                        new TemplateItem('颜色控件', 'color', '#e7b82b80',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '黑', value: 'black'},
                                {name: '红', value: 'red'},
                                {name: '蓝', value: 'blue'}
                            ]),
                        new TemplateItem('粗细控件', 'thickness', '#e7b82b80',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '极细', value: '1'},
                                {name: '细', value: '2'},
                                {name: '中等', value: '3'},
                                {name: '粗', value: '4'},
                                {name: '极粗', value: '5'}
                            ]),
                        new TemplateItem('擦除控件', 'erase', '#e7b82b80',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }),
                    ]),
                new TemplateGroup('操作类', 'Operation', 'success',
                    [
                        TemplateItem.from({
                            label: '管理控件',
                            type: 'manage',
                            color: '#95ef4180',
                            relate: 'UnitConfig',
                            options: [
                                {name: '收藏', value: 'star'},
                                {name: '分享', value: 'share'},
                                {name: '标签', value: 'tip'},
                            ]
                        }),
                        TemplateItem.from({
                            label: '换页控件',
                            type: 'page',
                            color: '#95ef4180',
                            relate: 'UnitConfig',
                            options: [
                                {name: '上一页', value: 'prev'},
                                {name: '下一页', value: 'next'},
                                {name: '新建页', value: 'new'},
                            ]
                        }),
                        TemplateItem.from({
                            label: '模式控件',
                            type: 'mode',
                            color: '#95ef4180',
                            relate: 'UnitConfig',
                            options: [
                                {name: '板书', value: 'board'},
                                {name: '屏写', value: 'screen'},
                                {name: 'PPT', value: 'ppt'},
                                {name: '鼠标', value: 'mouse'},
                                {name: '常规', value: 'normal'},
                            ]
                        }),
                        new TemplateItem('定制控件', 'custom', '#95ef4180',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }),
                        new TemplateItem('录制控件', 'record', '#95ef4180',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }),
                    ]),
                new TemplateGroup('资源类', 'Box', 'danger',
                    [
                        new TemplateItem('视频控件', 'video', '#ea977980',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                                console.log(this);
                            }),
                        new TemplateItem('音频控件', 'audio', '#ea977980',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                                console.log(this);
                            }),
                        new TemplateItem('音频控件', 'route', '#ea977980',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                                console.log(this);
                            }),
                    ]),
            ],
            pages: [
                new Page(
                    {
                        configs: []
                    }),
                new Page(
                    {
                        configs: []
                    }
                )
            ],
            /**
             * @type {Page}
             */
            currentPage: null,
            modePlaceholder: '空',
            /**
             * @type {Config[]}
             */
            get configs() {
                return this.currentPage?.configs ?? [];
            },
            editingRect: null,
            selectRects: [],
            mousePos: new Point(0, 0),
            viewerSize: new Size(900, 700),
            scaleChange: 0.8,
            currentScale: 100,
            revertScale: 1,
            scaling: false,
            copiedRect: null,
            lastClickPos: null,
            get stats() {
                const ret = [];
                const page = this.pages.indexOf(this.currentPage) + 1;
                this.configs.forEach(x => {
                    let one = {
                        id: ret.length + 1,
                        page,
                        num: x.id,
                        x: x.region.rectangle.x,
                        y: x.region.rectangle.y,
                        width: x.region.rectangle.width,
                        height: x.region.rectangle.height,
                        template: x.template.label,
                        name: x.name,
                    };
                    if (x instanceof UnitConfig) {
                        one.mode = x.region.mode?.name;
                    }
                    if (x instanceof TableConfig) {
                        one.children = [];
                        let i = 1;
                        x.region.getCells().forEach(c => {
                            let mode;
                            console.log(x.modes)
                            switch(x.modes.direction){
                                case TableConfig.Horizontal:
                                    mode = x.modes.configs.get(c.row)?.name;
                                    break;
                                case TableConfig.Vertical:
                                    mode = x.modes.configs.get(c.col)?.name;
                                    break;
                            }
                            one.children.add({
                                page,
                                id: one.id * 10 + i,
                                num : one.num + '-' + i,
                                name : `${one.name ?? '表格'} 的 ${c.row+1}行 ${c.col+1}列` ,
                                template: '子单元格',
                                x: c.rectangle.x,
                                y: c.rectangle.y,
                                width: c.rectangle.width,
                                height: c.rectangle.height,
                                mode
                            })
                            i++;
                        })
                        
                    }
                    ret.add(one);
                });
                console.log(ret)
                return ret;
            }
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
        rectChanged(changer, move) {
            changer.region.rectangle.showDrag = true;
            this.editingRect = changer;
            if (this.selectRects == null || this.selectRects.length === 0) return;
            this.selectRects.forEach(x => {
                if (x !== changer) {
                    x.region.rectangle.move(move);
                }
            })
        },
        editRect(rect) {
            if (this.editingRect !== rect) {
                this.editingRect = rect;
            }
            this.selectRects = [rect];
            this.configs.forEach(x => {
                if (x !== rect) {
                    x.region.rectangle.showDrag = false;
                }
            })
        },
        mouseDown(e) {
            window.onmouseup = this.mouseUp;
            this.editingRect = null;
            this.wrapRegion = new Rect(e.offsetX, e.offsetY, 0, 0);
            this.configs.forEach(x => {
                x.region.rectangle.showDrag = false;
            })
            this.lastClickPos = new Point(e.offsetX, e.offsetY)
        },
        mouseMove(e) {
            if (this.wrapRegion == null) return;
            let startX = this.lastClickPos.X;
            let startY = this.lastClickPos.Y;
            let width = startX - e.offsetX;
            if (width < 0) width = -width;
            let height = startY - e.offsetY;
            if (height < 0) height = -height;
            this.wrapRegion = new Rect(
                startX < e.offsetX ? startX : e.offsetX,
                startY < e.offsetY ? startY : e.offsetY,
                width, height);
        },
        mouseUp(_) {
            window.onmousemove = null;
            window.onmouseup = null;
            this.selectRects = [];
            this.configs.forEach(x => {
                if (x.region.rectangle.intersect(this.wrapRegion)) {
                    this.selectRects.add(x);
                    x.region.rectangle.showDrag = true;
                }
            });
            console.log(this.selectRects);
            this.wrapRegion = null;
            this.lastClickPos = null;
        },
        removeOne(item) {
            this.configs.remove(item);
            if (this.copiedRect === item) {
                this.copiedRect = null;
            }
            this.editingRect = null;
        },
        delete() {
            let i = 0;
            if (this.editingRect != null) {
                this.removeOne(this.editingRect);
                i++;
            }
            if (this.selectRects.length > 0) {
                this.selectRects.forEach(x => {
                    this.removeOne(x);
                    i++;
                })
            }
            this.selectRects = [];
            if (i > 0) {
                this.$message.success(`成功删除 ${i} 个目标`)
            }
        },
        keyDown(event) {
            if (event.key === 'Control') {
                this.scaling = true;
            }
            console.log(event.key)
            if (event.key === 'Delete') {
                this.delete();
            }
            if (this.scaling) {
                if (event.key === 'c') {
                    this.copiedRect = this.selectRects.copy;
                    if (this.copiedRect.length > 0) {
                        this.$message.success(`成功复制${this.copiedRect.length}个目标`);
                    } else {
                        this.$message.warning(`未选择复制目标`);
                    }
                }
                if (event.key === 'v') {
                    if (!(this.copiedRect != null && this.copiedRect.length > 0)) {
                        this.$message.warning(`没有复制的对象`);
                        return;
                    }
                    this.copiedRect.forEach(x => {
                        this.configs.push(x);
                        if (this.lastClickPos != null) {
                            x.region.rectangle.moveTo(this.lastClickPos);
                        }
                    });
                    this.$message.success(`粘贴成功`);
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
            let change = event.deltaY > 0 ? this.scaleChange : 1 / this.scaleChange;
            this.viewerSize.scale(change);
            this.configs.forEach(x => x.scale(change));
            this.revertScale /= change;
            this.currentScale /= change;
        },
        onScaleChange(n, o) {
            console.log(n, o)
        },
        
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

.el-menu-item * {
    vertical-align: middle !important;
}

.el-col {
    text-align: left;
}

.el-collapse-item__header {
    padding-left: 10px;
    background-color: #f2f2f2 !important;
}

.el-collapse-item__content {
    padding-top: 10px;
    padding-left: 10px;
    padding-bottom: 0 !important;
}

.el-menu-item:hover {
    background-color: #f2f2f2 !important;
}

#Background {
}
</style>