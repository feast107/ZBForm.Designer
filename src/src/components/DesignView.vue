<template>
    <div class="fill" ref="view">
        <el-container style="height: 98%">
            <el-header>
                <div></div>
            </el-header>
            <el-container style="height: 80%">
                <el-aside width="auto">
                    <el-scrollbar>
                        <el-menu style="--active-color:#3390ef;" :collapse="expand" :default-openeds="['1']">
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
                                         style="position: relative">
                                        <div id="Container" class="fill" style="z-index: 50;top:0; left :0;"
                                        >
                                            <div v-for="config in configs" :key="config">
                                                <DraggableRect v-if="config.type !== 'table'"
                                                               :style="`background-color: ${config.backgroundColor}`"
                                                               :rect="config.region"
                                                               :on-select="()=>this.editRect(config)"
                                                               :on-changed="rectChanged"
                                                               :on-resize-start="onResizeStart"
                                                               :on-resizing="onResizing"
                                                               :on-resize-end="onResizeEnd">
                                                </DraggableRect>
                                                <DraggableTable v-if="config.type === 'table'"
                                                                :style="`background-color: ${config.backgroundColor}`"
                                                                :rect="config.region"
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
                        <el-footer>
                            <el-pagination style="display: inline-flex;margin-top: 10px"
                                           :background="true"
                                           layout="prev, pager, next, jumper"
                                           :total="pages.length * 10"
                                           @current-change="val => this.currentPage = pages[val-1]"
                            />
                        </el-footer>
                    </el-container>
                    <el-aside style="overflow: hidden">
                        <el-card class="box-card" style="height: 100%;" shadow="always">
                            <div v-if="this.editingRect != null">
                                <el-scrollbar>
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
                                                <el-select v-model="this.editingRect.mode"
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
                                </el-scrollbar>
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
                        <TableModeView :scale="this.revertScale"
                                       :options="editingRect.template.options"
                                       :placeholder="modePlaceholder"
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
    data() {
        window.Rect = Rect;
        return {
            expand: false,
            showMode: false,
            showInfo: false,
            showViewer: false,
            drawer: true,
            actives: ['1', '2', '3'],
            menus: [
                new TemplateGroup('单据类', "Ticket", 'primary',
                    [
                        new TemplateItem('精准控件', 'precise', '#46d7f1',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '数值', value: 'number'},
                                {name: '布尔', value: 'bool'},
                                {name: '字母', value: 'char'}
                            ]),
                        new TemplateItem('常规控件', 'normal', '#46d7f1',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '字符', value: 'string'},
                                {name: '绘图', value: 'draw'},
                                {name: '身份证', value: 'id'}
                            ]),
                        new TemplateItem('表格控件', 'table', '#46d7f1',
                            function (configs) {
                                configs.push(TableConfig.fromTemplate(this))
                            }, [
                                {name: '数值', value: 'number'},
                                {name: '布尔', value: 'bool'},
                                {name: '字母', value: 'char'}
                            ]),
                        new TemplateItem('图形控件', 'graphics', '#46d7f1',
                            function (configs) {
                                configs.push(TableConfig.fromTemplate(this))
                            }),
                    ]),
                new TemplateGroup('书写类', 'EditPen', 'warning',
                    [
                        new TemplateItem('颜色控件', 'color', '#e7b82b',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '黑', value: 'black'},
                                {name: '红', value: 'red'},
                                {name: '蓝', value: 'blue'}
                            ]),
                        new TemplateItem('粗细控件', 'thickness', '#e7b82b',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '极细', value: '1'},
                                {name: '细', value: '2'},
                                {name: '中等', value: '3'},
                                {name: '粗', value: '4'},
                                {name: '极粗', value: '5'}
                            ]),
                        new TemplateItem('擦除控件', 'erase', '#e7b82b',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }),
                    ]
                ),
                new TemplateGroup('操作类', 'Operation', 'success',
                    [
                        new TemplateItem('管理控件', 'manage', '#95ef41',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '收藏', value: 'star'},
                                {name: '分享', value: 'share'},
                                {name: '标签', value: 'tip'},
                            ]),
                        new TemplateItem('换页控件', 'page', '#95ef41',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '上一页', value: 'prev'},
                                {name: '下一页', value: 'next'},
                                {name: '新建页', value: 'new'},
                            ]),
                        new TemplateItem('模式控件', 'mode', '#95ef41',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }, [
                                {name: '板书', value: 'board'},
                                {name: '屏写', value: 'screen'},
                                {name: 'PPT', value: 'ppt'},
                                {name: '鼠标', value: 'mouse'},
                                {name: '常规', value: 'normal'},
                            ]),
                        new TemplateItem('定制控件', 'custom', '#95ef41',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }),
                        new TemplateItem('录制控件', 'record', '#95ef41',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                            }),
                    ]),
                new TemplateGroup('资源类', 'Box', 'danger',
                    [
                        new TemplateItem('视频控件', 'video', '#e17861',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                                console.log(this);
                            }),
                        new TemplateItem('音频控件', 'audio', '#e17861',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                                console.log(this);
                            }),
                        new TemplateItem('音频控件', 'route', '#e17861',
                            function (configs) {
                                configs.push(UnitConfig.fromTemplate(this))
                                console.log(this);
                            }),
                    ]
                ),
            ],
            pages: [
                new Page({
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