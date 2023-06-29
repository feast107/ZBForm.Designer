<template>
    <div class="fill" ref="view">
        <el-container style="height: 98%">
            <el-header>
                <el-row style="margin-top: 10px">
                    <el-col :span="8">
                        <el-button-group>
                            <el-button type="success" @click="postResult" size="large">提交
                            </el-button>
                            <el-button size="large" @click="save" plain type="warning">暂存</el-button>
                        </el-button-group>
                    </el-col>
                    <el-col :span="8" style="text-align: center">
                        <el-button :disabled="viewport == null" type="info" plain
                                   @click="_ => this.fill('horizontal')">
                            水平铺满
                        </el-button>
                        <el-input-number v-model="this.scales.current"
                                         :min="scales.range[0]" :max="scales.range[1]" :step="scales.step"/>
                        <el-button :disabled="viewport == null" type="info" plain
                                   @click="_ => this.fill('vertical')">
                            垂直铺满
                        </el-button>
                    </el-col>
                    <el-col :span="8" style="text-align: end">
                        <el-switch active-text="显示详情" v-model="showDescription"
                                   style="margin-right: 10px"></el-switch>
                        <el-button-group>
                            <el-button plain type="info" @click="showStats = true">
                                设计数据
                            </el-button>
                            <el-button plain type="warning" @click="_ => { this.cleanPages(); }">
                                按页清空
                            </el-button>
                            <el-button :disabled="
                            this.selectRects == null
                            || this.selectRects.length === 0" plain type="success"
                                       @click="_ => { this.pastePages(); }">
                                按页粘贴
                            </el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </el-header>
            <el-container style="height: 80%">
                <el-aside width="auto">
                    <el-scrollbar>
                        <el-menu style="--active-color:#3390ef;" :collapse="!expand"
                                 :default-openeds="['0','1','2','3','4']">
                            <el-menu-item @click="()=> expand = !expand">
                                <el-icon>
                                    <Expand v-if="!expand"/>
                                    <Fold v-else/>
                                </el-icon>
                                <template #title>
                                    <span v-if="!expand">展开</span>
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
                                        <el-popover v-if="item.isCustom" trigger="contextmenu" placement="right">
                                            <template #reference>
                                                <el-row @click="() =>{this.generateFromMenu(item)}"
                                                        :gutter="4" style="width: 100%;margin-right: 10px;">
                                                    <el-col :span="20">
                                                        <span>{{ item.label }}</span>
                                                    </el-col>
                                                    <el-col :span="4">
                                                        <el-button style="vertical-align: center;width: 100%;"
                                                                   :type="menu.style" plain/>
                                                    </el-col>
                                                </el-row>
                                            </template>
                                            <el-button size="large"
                                                       type="danger" @click="_ => this.deleteTemplate(item.itemId)"
                                                       style="width: 100%;">删除
                                            </el-button>
                                        </el-popover>
                                        <el-row v-else @click="() =>{this.generateFromMenu(item)}"
                                                :gutter="4" style="width: 100%;margin-right: 10px;">
                                            <el-col :span="20">
                                                <span>{{ item.label }}</span>
                                            </el-col>
                                            <el-col :span="4">
                                                <el-button style="vertical-align: center;width: 100%;"
                                                           :type="menu.style" plain/>
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
                            <el-scrollbar ref="scroller" id="viewport" v-if="currentPage != null"
                                          style="background-color: #c2c2c2">
                                <TwoPartView :top="-mousePos.Y" :left="-mousePos.X" :show="showViewer"
                                             width="200" height="200">
                                    <div ref="view"
                                         :style="`width:${viewerSize.Width}px;height:${viewerSize.Height}px`"
                                         style="position: relative;border: 1px solid black">
                                        <div v-show="wrapRegion != null" style="
                                        position: absolute;top:0;left: 0;width:100%;height:100%;
                                         z-index: 2000" :onmousemove="mouseMove"></div>
                                        <el-popover v-if="this.editingRect !== null" trigger="contextmenu">
                                            <template #reference>
                                                <div style="position: absolute;
                                                z-index: 2000; background-color: transparent;"
                                                     @click="this.rightDown = false"
                                                     :style="`left:${this.editingRect.region.rectangle.x
                                                }px;top:${this.editingRect.region.rectangle.y
                                                }px;width:${this.editingRect.region.rectangle.Width
                                                }px;height:${this.editingRect.region.rectangle.Height}px;
                                                 pointer-events: ${ this.rightDown ? ''  : 'none' };`">
                                                </div>
                                            </template>
                                            <el-button-group style="width: 100%">
                                                <el-popover placement="right"
                                                            v-if="editingRect.template.type !== TableConfig.type &&
                                                            this.editingRect.template.options">
                                                    <template #reference>
                                                        <el-button icon="Paperclip" style="width: 100%">类型</el-button>
                                                    </template>
                                                    <el-menu>
                                                        <el-menu-item :index="`${index}`"
                                                                      @click="_ => { editingRect.mode = item }"
                                                                      style="height: min-content"
                                                                      v-for="(item,index) in editingRect.template.options"
                                                                      :key="index">{{ item.name }}
                                                        </el-menu-item>
                                                    </el-menu>
                                                </el-popover>
                                                
                                                <div v-for="item in contextMenus" :key="item" style="width: 100%">
                                                    <el-button style="width: 100%" :type="item.type ?? ''"
                                                               v-show="item.condition(this)"
                                                               @click="item.handler">
                                                        <el-icon class="el-icon--left">
                                                            <component :is="item.icon"></component>
                                                        </el-icon>
                                                        {{ item.label }}
                                                    </el-button>
                                                </div>
                                            </el-button-group>
                                        </el-popover>
                                        <div id="Container" class="fill" style="z-index: 50;top:0; left :0;">
                                            <div v-for="config in configs" :key="config">
                                                <DraggableRect v-if="config.type !== TableConfig.type"
                                                               :style="`background-color: ${config.backgroundColor}`"
                                                               :rect="config.region"
                                                               :on-select="()=>this.editRect(config)"
                                                               :on-move="(move) => rectChanged(config,move)"
                                                               :on-resize-start="onResizeStart"
                                                               :on-context-menu="_ => {this.onContextMenu(config)}"
                                                               :on-resizing="onResizing"
                                                               :on-resize-end="onResizeEnd">
                                                    <div v-show="showDescription" :style="`width:${config.region.rectangle.width}px;height:${
                                                        config.region.rectangle.height}px;`"
                                                         class="descriptorDiv">
                                                        <span style="left:0"
                                                              class="descriptor"
                                                              :style="`top:${config.region.rectangle.height}px`">
                                                            {{ config.name }}</span>
                                                        <span class="descriptor"
                                                              style="top:-20px;right:0">
                                                            {{ config.mode?.name ?? '' }}</span>
                                                    </div>
                                                </DraggableRect>
                                                <DraggableTable v-if="config.type === TableConfig.type"
                                                                :style="`background-color: ${config.backgroundColor}`"
                                                                :rect="config.region"
                                                                :on-select="()=>this.editRect(config)"
                                                                :on-move="(move) => rectChanged(config,move)"
                                                                :on-context-menu="_ => {this.onContextMenu(config)}"
                                                                :on-resize-start="onResizeStart"
                                                                :on-resizing="onResizing"
                                                                :on-resize-end="onResizeEnd">
                                                    <div v-if="showDescription" :style="`width:${config.region.rectangle.width}px;height:${
                                                        config.region.rectangle.height}px;`"
                                                         class="descriptorDiv">
                                                        <span style="left:0"
                                                              class="descriptor"
                                                              :style="`top:${config.region.rectangle.height}px`">
                                                            {{ config.name }}</span>
                                                        <span class="descriptor"
                                                              style="top:-20px;right:0">
                                                            {{ config.mode?.name ?? '' }}</span>
                                                    </div>
                                                </DraggableTable>
                                            </div>
                                            <div v-if="wrapRegion!=null" class="unSelect"
                                                 style="position: absolute;background-color: #00000020;z-index: 1000;"
                                                 :style="`top:${wrapRegion.Top
                                                 }px;left:${ wrapRegion.Left
                                                 }px;width:${wrapRegion.Width
                                                 }px;height:${wrapRegion.Height
                                                 }px;`"></div>
                                        </div>
                                        <div id="Background" class="fill" style="top:0; position: absolute;"
                                             :onmousedown="mouseDown">
                                            <div class="fill unSelect">
                                                <img class="fill unSelect" v-if="this.currentPage!= null"
                                                     :src="this.currentPage.url" alt=""/>
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
                                           @current-change="val => this.currentPage = pages[val-1]"/>
                        </el-footer>
                    </el-container>
                    <el-aside style="overflow: hidden;height:100%;width: max-content;right: 0;float: right">
                        <el-menu :collapse="rightSideCollapse">
                            <el-menu-item @click="()=> rightSideCollapse = !rightSideCollapse">
                                <el-icon>
                                    <Expand v-if="!rightSideCollapse"/>
                                    <Fold v-else/>
                                </el-icon>
                                <template #title>
                                    <span v-if="rightSideCollapse">展开</span>
                                    <span v-else>收起</span>
                                </template>
                            </el-menu-item>
                        </el-menu>
                        
                        <div style="height: 90%" v-show="!rightSideCollapse">
                            <el-scrollbar style="height:100%">
                                <el-card class="box-card" style="height: 100%;" shadow="never">
                                    <div v-if="this.editingRect != null" style="width:270px;">
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
                                                    v-if="editingRect.template.type !== TableConfig.type
                                            && editingRect.template.options != null" label="类型:">
                                                    <el-select v-model="this.editingRect.mode"
                                                               :type="editingRect.template.style"
                                                               :placeholder="modePlaceholder">
                                                        <el-option v-for="(item,index) in editingRect.template.options"
                                                                   :type="editingRect.template.style"
                                                                   :key="index"
                                                                   :label="item.name"
                                                                   :value="item"
                                                        />
                                                    </el-select>
                                                </el-form-item>
                                            </el-collapse-item>
                                            <el-collapse-item title="控件位置" name="2">
                                                <el-form-item label="左上">
                                                    {{
                                                        (this.editingRect.region.rectangle.LeftTop.X * this.revertScale).round()
                                                    }}mm
                                                    ，
                                                    {{
                                                        (this.editingRect.region.rectangle.LeftTop.Y * this.revertScale).round()
                                                    }}mm
                                                </el-form-item>
                                                <el-form-item label="右上">
                                                    {{
                                                        (this.editingRect.region.rectangle.RightTop.X * this.revertScale).round()
                                                    }}mm
                                                    ，
                                                    {{
                                                        (this.editingRect.region.rectangle.RightTop.Y * this.revertScale).round()
                                                    }}mm
                                                </el-form-item>
                                                <el-form-item label="左下">
                                                    {{
                                                        (this.editingRect.region.rectangle.LeftBottom.X * this.revertScale).round()
                                                    }}mm
                                                    ，
                                                    {{
                                                        (this.editingRect.region.rectangle.LeftBottom.Y * this.revertScale).round()
                                                    }}mm
                                                </el-form-item>
                                                <el-form-item label="右下:">
                                                    {{
                                                        (this.editingRect.region.rectangle.RightBottom.X * this.revertScale).round()
                                                    }}mm
                                                    ，
                                                    {{
                                                        (this.editingRect.region.rectangle.RightBottom.Y * this.revertScale).round()
                                                    }}mm
                                                </el-form-item>
                                            </el-collapse-item>
                                            <el-collapse-item title="控件尺寸" name="3">
                                                <el-form-item label="宽">
                                                    {{
                                                        (this.editingRect.region.rectangle.Width * this.revertScale).round()
                                                    }}mm
                                                </el-form-item>
                                                <el-form-item label="高">
                                                    {{
                                                        (this.editingRect.region.rectangle.Height * this.revertScale).round()
                                                    }}mm
                                                </el-form-item>
                                            </el-collapse-item>
                                            <el-collapse-item title="表格属性" name="4"
                                                              v-if="this.editingRect.type === TableConfig.type ">
                                                <el-form-item label="表格行列:">
                                                    <el-button style="margin-bottom: 10px"
                                                               @click="() => showInfo = true">
                                                        查看设置
                                                    </el-button>
                                                </el-form-item>
                                                <el-form-item label="识别类型:">
                                                    <el-button style="margin-bottom: 10px"
                                                               @click="() => showMode = true">
                                                        查看设置
                                                    </el-button>
                                                </el-form-item>
                                            </el-collapse-item>
                                            <el-collapse-item title="注释" name="5">
                                                <el-input type="textarea" v-model="editingRect.comment"></el-input>
                                            </el-collapse-item>
                                        </el-collapse>
                                    </div>
                                    <el-empty style="width:270px;" v-else description="未选中目标"></el-empty>
                                </el-card>
                            </el-scrollbar>
                        </div>
                    
                    </el-aside>
                    <div>
                        <el-dialog v-if="showInfo"
                                   v-model="showInfo" align-center style="border-radius: 20px"
                                   title="内部单元格">
                            <TableDetailView :scaled="this.revertScale" :table="editingRect"></TableDetailView>
                        </el-dialog>
                        <el-dialog v-if="showMode" style="border-radius: 20px"
                                   v-model="showMode" align-center
                                   title="识别模式">
                            <TableModeView :scaled="this.revertScale"
                                           :options="editingRect.template.options"
                                           :placeholder="modePlaceholder"
                                           :table="editingRect"></TableModeView>
                        </el-dialog>
                        <el-dialog v-if="showClean" style="border-radius: 20px;width:300px"
                                   v-model="showClean" align-center
                                   title="按页清空">
                            <el-form v-model="multiSelectForm" label-width="120px" style="margin: 0 auto">
                                <el-form-item label="起始页码">
                                    <el-input-number :min="1" :max="multiSelectForm.endPage"
                                                     v-model="multiSelectForm.startPage"></el-input-number>
                                </el-form-item>
                                <el-form-item label="结束页码">
                                    <el-input-number :min="multiSelectForm.startPage" :max="pages.length"
                                                     v-model="multiSelectForm.endPage"></el-input-number>
                                </el-form-item>
                                <el-form-item label="启用奇偶页">
                                    <el-switch size="large" active-text="是" inactive-text="否" inline-prompt
                                               v-model="multiSelectForm.useOption"></el-switch>
                                </el-form-item>
                                <el-form-item label="奇偶页" v-show="multiSelectForm.useOption">
                                    <el-switch size="large" inline-prompt
                                               active-text="奇" active-value="single"
                                               inactive-text="偶" inactive-value="double"
                                               style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                                               :disabled="!multiSelectForm.useOption"
                                               v-model="multiSelectForm.singleOrDouble"></el-switch>
                                </el-form-item>
                                <el-popconfirm style="width: 200px"
                                               confirm-button-text="确认"
                                               confirm-button-type="danger"
                                               cancel-button-text="取消"
                                               @confirm="confirmClean"
                                               title="此操作不可撤销">
                                    <template #reference>
                                        <el-button type="danger">清空</el-button>
                                    </template>
                                </el-popconfirm>
                            </el-form>
                        </el-dialog>
                        <el-dialog v-if="showPaste" style="border-radius: 20px;width:300px"
                                   v-model="showPaste" align-center
                                   title="按页粘贴">
                            <el-form v-model="multiSelectForm" label-width="120px" style="margin: 0 auto">
                                <el-form-item label="起始页码">
                                    <el-input-number :min="1" :max="multiSelectForm.endPage"
                                                     v-model="multiSelectForm.startPage"></el-input-number>
                                </el-form-item>
                                <el-form-item label="结束页码">
                                    <el-input-number :min="multiSelectForm.startPage" :max="pages.length"
                                                     v-model="multiSelectForm.endPage"></el-input-number>
                                </el-form-item>
                                <el-form-item label="启用奇偶页">
                                    <el-switch size="large" active-text="是" inactive-text="否" inline-prompt
                                               v-model="multiSelectForm.useOption"></el-switch>
                                </el-form-item>
                                <el-form-item label="奇偶页" v-show="multiSelectForm.useOption">
                                    <el-switch size="large" inline-prompt
                                               active-text="奇" active-value="single"
                                               inactive-text="偶" inactive-value="double"
                                               style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                                               :disabled="!multiSelectForm.useOption"
                                               v-model="multiSelectForm.singleOrDouble"></el-switch>
                                </el-form-item>
                                <el-button type="primary" @click="confirmPaste">粘贴</el-button>
                            </el-form>
                        </el-dialog>
                        <el-dialog v-if="showStats" v-model="showStats"
                                   style="max-height: 80%;border-radius: 20px;width: 70%">
                            <el-table max-height="500" border stripe :data="getStats(this.currentPage)" row-key="id">
                                <el-table-column prop="page" label="页码"></el-table-column>
                                <el-table-column prop="num" label="编号"></el-table-column>
                                <el-table-column prop="name" label="名称"></el-table-column>
                                <el-table-column prop="template.name" label="模板" width="100"></el-table-column>
                                <el-table-column prop="x" label="X" width="60"></el-table-column>
                                <el-table-column prop="y" label="Y" width="60"></el-table-column>
                                <el-table-column prop="width" label="宽" width="60"></el-table-column>
                                <el-table-column prop="height" label="高" width="60"></el-table-column>
                                <el-table-column prop="mode.name" label="类型" width="80"></el-table-column>
                            </el-table>
                        </el-dialog>
                        <el-dialog v-if="createTemplate.show" v-model="createTemplate.show"
                                   style="border-radius: 20px" align-center width="300"
                                   title="自定义控件组">
                            <el-form>
                                <el-form-item label="模板名称">
                                    <el-input v-model="createTemplate.name"></el-input>
                                </el-form-item>
                                <el-button @click="makeTemplate" type="primary">确定</el-button>
                            </el-form>
                        </el-dialog>
                    </div>
                
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
import {Unit, Table, Region} from "@/models/region";
import {Config, UnitConfig, TableConfig} from "@/models/config";
import {Page} from "@/models/page";
import {TemplateGroup, TemplateItem} from "@/models/template";
import Request from "@/utils/request";
import {Url} from "@/configs/location";

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
    async created() {
        let url = new URL(window.location).searchParams;
        let userId = url.get('userId');
        let formId = url.get('formId');
        if (userId) this.userId = userId;
        if (formId) this.formId = formId;
        console.log(`UserId : [ ${this.userId} ]`);
        console.log(`FormId : [ ${this.formId} ]`);
        await this.loadConfig();
        let ps;
        try {
            ps = await Request.get(`${Url.authservice.admin.queryFormInfo}?formId=${this.formId}`);
            if (ps.data.code !== 1) {
                throw ps.data.msg;
            }
        } catch (e) {
            this.$message.error(e);
            return;
        }
        
        /**
         * @type {Form}
         */
        let formInfo = ps.data.data;
        this.viewerSize = new Size(formInfo.pageWidth, formInfo.pageHeight);
        let stable = new Size(formInfo.pageWidth, formInfo.pageHeight);
        this.pages = [];
        for (let i = 0; i < formInfo.pageCount; i++) {
            this.pages.push(new Page({
                configs: [],
                url: `${formInfo.formUrl}/${i + 1}.png`,
                size: stable
            }));
        }
        let rs;
        try {
            rs = await Request.get(`${Url.authservice.admin.design.queryInfo}?formId=${this.formId}`);
            if (rs.data.code !== 1) {
                throw rs.data.msg;
            }
        } catch (e) {
            this.$message.error(e);
        }
        if (rs.data.data) {
            this.loadFromJson(rs.data.data);
        }
        
        window.onwheel = this.mouseWheel;
        window.onkeydown = this.keyDown;
        window.onkeyup = this.keyUp;
        this.currentPage = this.pages[0];
        
        window.stat = this.postResult;
    },
    beforeUnmount() {
        window.onresize = null;
        window.onwheel = null;
        window.onkeydown = null;
        window.onkeyup = null;
    },
    watch: {
        currentPage(n, o) {
            this.selectRects.clear();
        },
        currentScale(n, o) {
            let scale = n / o;
            this.viewerSize.scale(scale);
            this.pages.forEach(p => {
                p.configs.forEach(x => {
                    x.scale(scale);
                });
            });
            this.revertScale /= scale;
        }
    },
    data() {
        window.Rect = Rect;
        return {
            userId: '64882984a232e987c68862dd',
            rightSideCollapse: false,
            formId: '6dcf42ed1f0440a9a43ed1061a1019bf',
            /**
             * @type {Rect}
             */
            wrapRegion: null,
            expand: true,
            createTemplate: {
                show: false,
                name: '',
            },
            showStats: false,
            showMode: false,
            showInfo: false,
            showViewer: false,
            showClean: false,
            showPaste: false,
            showDescription: false,
            drawer: true,
            actives: ['1', '2', '3', '5'],
            contextMenus: [
                {
                    label: '复制', condition: (_) => true,
                    icon: 'CopyDocument',
                    handler: this.triggerCopy
                },
                {
                    label: '删除', condition: (_) => true,
                    icon: 'Delete',
                    handler: this.delete
                },
                {
                    label: '制作模板', condition: (_) => true,
                    icon: 'Printer',
                    handler: () => this.createTemplate.show = true
                },
                {
                    label: '置于顶层', condition: (data) => data.selectRects.length === 1,
                    icon: 'Top',
                    handler: _ => {
                        this.putLayer('top')
                    }
                },
                {
                    label: '置于底层', condition: (data) => data.selectRects.length === 1,
                    icon: 'Bottom',
                    handler: _ => {
                        this.putLayer('bottom')
                    }
                },
                {
                    label: '上对齐', condition: (data) => data.selectRects.length > 1, icon: 'ArrowUp',
                    handler: _ => {
                        this.alignToThis(this.editingRect, 'top')
                    }
                },
                {
                    label: '左对齐', condition: (data) => data.selectRects.length > 1, icon: 'ArrowLeft',
                    handler: _ => {
                        this.alignToThis(this.editingRect, 'left')
                    }
                },
                {
                    label: '下对齐', condition: (data) => data.selectRects.length > 1, icon: 'ArrowDown',
                    handler: _ => {
                        this.alignToThis(this.editingRect, 'bottom')
                    }
                },
                {
                    label: '右对齐', condition: (data) => data.selectRects.length > 1, icon: 'ArrowRight',
                    handler: _ => {
                        this.alignToThis(this.editingRect, 'right')
                    }
                },
                {
                    label: '水平对齐', condition: (data) => data.selectRects.length > 1, icon: 'Switch',
                    handler: _ => {
                        this.alignToThis(this.editingRect, 'horizontal')
                    }
                },
                {
                    label: '垂直对齐', condition: (data) => data.selectRects.length > 1, icon: 'Sort',
                    handler: _ => {
                        this.alignToThis(this.editingRect, 'vertical')
                    }
                }
            ],
            menus: [],
            pages: [],
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
            scales: {
                range: [50, 600],
                step: 25,
                current: 100,
            },
            get currentScale() {
                return this.scales.current;
            },
            revertScale: 1,
            ctrl: false,
            copiedRects: null,
            lastClickPos: null,
            rightDown: false,
            multiSelectForm: {
                startPage: 1,
                endPage: 1,
                useOption: false,
                singleOrDouble: 'single',
            },
            viewport: null,
        };
    },
    mounted() {
        let vue = this;
        let interval;
        interval = setInterval(() => {
            if (!vue.$refs.scroller) return;
            clearInterval(interval);
            this.viewport = document.getElementById('viewport');
            this.fill('horizontal');
        }, 100);
    },
    methods: {
        /**
         * @param {Page} page
         * @returns {*[]}
         */
        getStats(page) {
            const ret = [];
            const pageNum = this.pages.indexOf(page) + 1;
            page.configs.forEach(x => {
                let one = {
                    id: ret.length + 1,
                    page: pageNum,
                    num: x.id,
                    x: (x.region.rectangle.x * this.revertScale).toFixed().toInt(),
                    y: (x.region.rectangle.y * this.revertScale).toFixed().toInt(),
                    width: (x.region.rectangle.width * this.revertScale).toFixed().toInt(),
                    height: (x.region.rectangle.height * this.revertScale).toFixed().toInt(),
                    template: {name: x.template.label, value: x.template.type},
                    comment: x.comment,
                    name: x.name,
                };
                if (x instanceof UnitConfig) {
                    one.mode = x.mode;
                }
                if (x instanceof TableConfig) {
                    one.children = [];
                    let i = 1;
                    x.region.getCells().forEach(c => {
                        let mode;
                        switch (x.modes.direction) {
                            case TableConfig.Horizontal:
                                mode = x.modes.configs[c.row];
                                break;
                            case TableConfig.Vertical:
                                mode = x.modes.configs[c.col];
                                break;
                        }
                        one.children.add({
                            page: pageNum,
                            id: one.id * 10 + i,
                            num: one.num + '-' + i,
                            name: `${one.name ?? '表格'} 的 ${c.row + 1}行 ${c.col + 1}列`,
                            template: {name: '子单元格', value: 'subCell'},
                            x: (c.rectangle.x * this.revertScale).toFixed().toInt(),
                            y: (c.rectangle.y * this.revertScale).toFixed().toInt(),
                            width: (c.rectangle.width * this.revertScale).toFixed().toInt(),
                            height: (c.rectangle.height * this.revertScale).toFixed().toInt(),
                            comment: one.comment,
                            mode
                        })
                        i++;
                    })
                }
                ret.add(one);
            });
            return ret;
        },
        /**
         * @param {TemplateItem} item
         */
        generateFromMenu(item) {
            let cs = item.generate();
            cs.forEach(config => {
                config.scale(1 / this.revertScale);
                this.currentPage?.configs?.push(config)
            });
        },
        fill(direction) {
            let rect = this.viewport.getBoundingClientRect();
            switch (direction) {
                case 'horizontal':
                    this.scales.current = (this.scales.current * rect.width / this.viewerSize.Width)
                        .toFixed()
                        .toInt();
                    break;
                case 'vertical':
                    this.scales.current = (this.scales.current * rect.height / this.viewerSize.Height)
                        .toFixed()
                        .toInt();
                    break;
            }
        },
        log(...args) {
            console.log(...args);
        },
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
            changer.region.showDrag = true;
            this.editingRect = changer;
            if (this.selectRects == null || this.selectRects.length === 0) return;
            if (!this.selectRects.contains(changer)) {
                this.selectRects.forEach(x => x.region.showDrag = false);
                this.selectRects.clear();
                return;
            }
            this.selectRects.forEach(x => {
                if (x !== changer) {
                    x.region.rectangle.move(move);
                }
            })
        },
        editRect(rect) {
            if (this.ctrl) {
                if (this.selectRects.contains(rect)) {
                    this.selectRects.remove(rect)
                } else {
                    this.selectRects.push(rect)
                }
                return;
            }
            if (this.editingRect !== rect) {
                this.editingRect = rect;
            }
            this.selectRects = [rect];
            this.configs.forEach(x => {
                if (x !== rect) {
                    x.region.showDrag = false;
                }
            })
        },
        mouseDown(e) {
            window.onmouseup = this.mouseUp;
            this.editingRect = null;
            this.rightDown = false;
            this.wrapRegion = new Rect(e.offsetX, e.offsetY, 0, 0);
            this.configs.forEach(x => {
                x.region.showDrag = false;
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
                    x.region.showDrag = true;
                }
            });
            this.wrapRegion = null;
            this.lastClickPos = null;
        },
        removeOne(item) {
            this.configs.remove(item);
            if (this.copiedRects === item) {
                this.copiedRects = null;
            }
            this.editingRect = null;
        },
        delete() {
            let i = 0;
            if (this.editingRect != null) {
                this.removeOne(this.editingRect);
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
                this.ctrl = true;
            }
            if (event.key === 'Delete') {
                this.delete();
            }
            if (this.ctrl) {
                if (event.key === 'c') {
                    this.triggerCopy();
                }
                if (event.key === 'v') {
                    this.paste();
                }
            }
            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                case 'ArrowDown':
                case 'ArrowRight':
                    this.moveAll(1, event.key);
                    break;
            }
        },
        keyUp(event) {
            if (event.key === 'Control') {
                this.ctrl = false;
            }
        },
        mouseWheel(event) {
            if (!this.ctrl) return;
            this.scales.current = event.deltaY > 0
                ? this.scales.current === this.scales.range[0]
                    ? this.scales.range[0] : this.scales.current - 25
                : this.scales.current === this.scales.range[1]
                    ? this.scales.range[1] : this.scales.current + 25
        },
        onContextMenu(config) {
            this.rightDown = true;
            this.editingRect = config;
            if (this.selectRects.length === 0) {
                this.selectRects = [config];
            }
        },
        triggerCopy() {
            this.copiedRects = this.selectRects.copy;
            if (this.copiedRects.length > 0) {
                this.$message.success(`成功复制${this.copiedRects.length}个目标`);
            } else {
                this.$message.warning(`未选择复制目标`);
            }
        },
        paste() {
            if (!(this.copiedRects != null && this.copiedRects.length > 0)) {
                this.$message.warning(`没有复制的对象`);
                return;
            }
            this.copiedRects.forEach(x => {
                let tar = x.clone;
                this.configs.push(tar);
                if (this.lastClickPos != null) {
                    x.region.rectangle.moveTo(this.lastClickPos);
                }
            });
            this.$message.success(`粘贴成功`);
        },
        moveAll(distant, direction) {
            if (this.selectRects.length === 0) return;
            this.selectRects.forEach(x => {
                let tar;
                let rect = x.region.rectangle;
                switch (direction) {
                    case 'ArrowUp':
                        if (rect.y === 0) return;
                        tar = new Point(rect.x, rect.y - 1);
                        break;
                    case 'ArrowLeft':
                        if (rect.x === 0) return;
                        tar = new Point(rect.x - 1, rect.y);
                        break;
                    case 'ArrowDown':
                        tar = new Point(rect.x, rect.y + 1);
                        break;
                    case 'ArrowRight':
                        tar = new Point(rect.x + 1, rect.y);
                        break;
                }
                x.region.rectangle.moveTo(tar);
            })
        },
        /**
         * @param {Config} to
         * @param {string} direction
         */
        alignToThis(to, direction) {
            if (this.selectRects.length < 1) return;
            
            /**
             * @param {Rect} rect
             */
            let move = (rect) => {
            };
            switch (direction) {
                case 'top':
                    let y = to.region.rectangle.y;
                    move = (rect) => {
                        rect.y = y;
                    };
                    break;
                case 'left':
                    let x = to.region.rectangle.x;
                    move = (rect) => {
                        rect.x = x;
                    };
                    break;
                case 'right':
                    let right = to.region.rectangle.Right;
                    move = (rect) => {
                        let x = right - rect.Width;
                        rect.moveTo(new Point(x, rect.y))
                    };
                    break;
                case 'bottom':
                    let bottom = to.region.rectangle.Bottom;
                    move = (rect) => {
                        let y = bottom - rect.Height;
                        rect.moveTo(new Point(rect.x, y))
                    };
                    break;
                case 'horizontal':
                    let yCenter = to.region.rectangle.Center.Y;
                    move = (rect) => {
                        let y = yCenter - rect.Height / 2;
                        rect.moveTo(new Point(rect.x, y));
                    }
                    break;
                case 'vertical':
                    let xCenter = to.region.rectangle.Center.X;
                    move = (rect) => {
                        let x = xCenter - rect.Width / 2;
                        rect.moveTo(new Point(x, rect.y));
                    }
                    break;
            }
            this.selectRects.forEach(x => {
                if (x === to) return;
                move(x.region.rectangle);
            })
        },
        cleanPages() {
            this.multiSelectForm = {
                startPage: 1,
                endPage: this.pages.length,
                useOption: false,
                singleOrDouble: 'single',
            };
            this.showClean = true;
        },
        getSelectCondition() {
            let condition = (num) => false;
            if (!this.multiSelectForm.useOption) {
                condition = (num) => true;
            } else {
                switch (this.multiSelectForm.singleOrDouble) {
                    case "single":
                        condition = (num) => num % 2 === 1;
                        break;
                    case 'double':
                        condition = (num) => num % 2 === 0;
                        break;
                }
            }
            return condition;
        },
        confirmClean() {
            let count = 0;
            console.log(this.multiSelectForm);
            let condition = this.getSelectCondition();
            
            for (let i = this.multiSelectForm.startPage; i <= this.multiSelectForm.endPage; i++) {
                if (!condition(i)) continue;
                count += this.pages[i - 1].configs.length;
                this.pages[i - 1].configs.clear();
            }
            this.showClean = false;
            this.$message.success(`成功删除了 ${count} 个控件`);
        },
        pastePages() {
            this.multiSelectForm = {
                startPage: 1,
                endPage: this.pages.length,
                useOption: false,
                singleOrDouble: 'single',
            };
            this.showPaste = true;
        },
        confirmPaste() {
            let count = 0;
            console.log(this.multiSelectForm);
            let condition = this.getSelectCondition();
            
            for (let i = this.multiSelectForm.startPage; i <= this.multiSelectForm.endPage; i++) {
                if (!condition(i)) continue;
                count += this.selectRects.length;
                this.selectRects.forEach(x => {
                    let tar = x.clone;
                    this.pages[i - 1].configs.push(tar);
                })
            }
            this.selectRects = [];
            this.showPaste = false;
            this.$message.success(`成功粘贴了 ${count} 个控件`);
        },
        async postResult() {
            let page = 1;
            const ret = [];
            this.pages.forEach(p => {
                let tmp = this.getStats(p);
                let configs = [];
                tmp.forEach(c => {
                    if (c.children) {
                        c.children.forEach(cc => {
                            configs.push(cc);
                        })
                    } else {
                        configs.push(c)
                    }
                });
                ret.push({
                    relationId: this.formId,
                    page,
                    configs
                })
                page++;
            })
            console.log(ret);
            try {
                let r = await Request.post(Url.authservice.admin.design.saveConfig, {
                    "configList": ret
                });
                console.log(r)
                if (r.data.code !== 1) {
                    throw `请求异常 [ ${r.data.msg} ]`;
                }
                this.$message.success('提交成功');
            } catch (e) {
                this.$message.warning(e)
            }
            return ret;
        },
        async save() {
            this.pages.forEach(x => x.configs.forEach(c => {
                c.scale(this.revertScale);
            }));
            console.log(this.pages);
            let json = this.pages.serialize;
            console.log(json);
            this.pages.forEach(x => x.configs.forEach(c => {
                c.scale(1 / this.revertScale);
            }));
            try {
                let r = await Request.post(Url.authservice.admin.design.saveInfo, {
                    formId: this.formId,
                    info: json
                });
                if (r.data.code !== 1) {
                    throw r.data.msg;
                }
                this.$message.success(`暂存成功`);
            } catch (e) {
                this.$message.error(`暂存失败: [ ${e} ]`);
            }
        },
        async loadConfig() {
            let response;
            try {
                response = await Request.get(`${Url.authservice.admin.queryItem}?userId=${this.userId}`);
                if (response.data.code !== 1) throw response.data.msg;
            } catch (e) {
                this.$message.error('配置请求失败 : [ ${e} ]');
                return;
            }
            let config = [];
            response.data.data.forEach(c => {
                config.push(TemplateGroup.from(c))
            });
            this.menus = config;
        },
        loadFromJson(json) {
            let data = json.deserialize();
            data.forEach(x => {
                x.__proto__ = Page.prototype;
                Config.setProto(x.configs)
            })
            this.pages = data;
            console.log(this.pages)
        },
        putLayer(direct) {
            switch (direct) {
                case 'top':
                    this.selectRects[0].region.layer = Region.MaxLayer;
                    break;
                case 'bottom':
                    this.configs.forEach(x => x.region.layer += 1);
                    this.selectRects[0].region.layer = Region.MinLayer;
                    break;
            }
        },
        async makeTemplate() {
            let cs = this.selectRects.aggregate([], (arr, c) => {
                let t = c.clone;
                t.scale(this.revertScale);
                arr.push(t)
                return arr;
            })
            debugger;
            let name = this.createTemplate.name;
            let result;
            try {
                result = await Request.post(Url.authservice.admin.template.saveTemplate, {
                    info: cs.serialize,
                    title: name,
                    userId: this.userId
                });
                if (result.data.code !== 1) {
                    throw result.data.msg;
                }
                this.$message.success("保存成功");
                this.createTemplate.name = '';
                this.createTemplate.show = false;
                await this.loadConfig();
            } catch (e) {
                this.$message.error(`保存失败 : [ ${e} ]`);
            }
        },
        async deleteTemplate(id) {
            try {
                await Request.get(`${Url.authservice.admin.template.deleteTemplate}?templateId=${id}`);
                this.$message.success('删除成功');
                await this.loadConfig();
            } catch (e) {
                this.$message.error(`删除失败 : [ ${e} ]`)
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

.unSelect {
    user-select: none;
    pointer-events: none;
}

.descriptorDiv {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 14px;
    user-select: none;
    pointer-events: none;
    z-index: 0;
    color: grey;
    
    .descriptor {
        z-index: 0;
        white-space: nowrap;
        font-size: 14px;
        position: absolute;
        color: grey;
    }
}

#Background {
}
</style>