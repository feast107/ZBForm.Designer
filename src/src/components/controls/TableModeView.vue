<template>
    <el-switch
        size="large" width="60" inline-prompt
        active-value="horizontal"
        active-text="横向"
        inactive-value="vertical"
        inactive-text="纵向" @change="_ => this.table.modes.configs = new Map()"
        style="--el-switch-on-color: #31acee; --el-switch-off-color: #4ad71b;"
        v-model="table.modes.direction"></el-switch>
    <div class="grid" style="grid-template-columns:1fr auto 1fr;grid-template-rows:1fr auto 1fr;">
        <div></div>
        <div v-if="table.modes.direction === 'vertical'"
             class="grid" style="margin:0 auto 10px auto;" :style="`width:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(0,this.mergeLength)}px;height:20px;grid-template-columns:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.columDefinitions.concat([table.region.rectangle.Width])"
                 :key="item">
                <el-popover width="200" :placement="placement" :trigger="trigger">
                    <el-select  @change="(val)=>setMode(index,val)"
                                style="--el-select-input-focus-border-color: #30d230;"
                                :placeholder="placeholder"
                                v-model="table.modes.configs[index]">
                        <el-option style="--el-color-primary: #30d230"
                            v-for="item in options"
                            :key="item.value"
                            :label="item.name"
                            :value="item"
                        />
                    </el-select>
                    <template #reference>
                        <el-button v-if="!table.modes.configs?.containsKey(index)" class="but" type="success"
                                   @click="()=>{  }">+
                        </el-button>
                        <el-button class="but" type="success">{{ table.modes.configs.get(index).name }}</el-button>
                    </template>
                </el-popover>
            </div>
        </div>
        <div v-else style="height:40px"></div>
        <div></div>
        <div v-if="table.modes.direction === 'horizontal'"
             class="grid" style="margin:0 0 0 auto;" :style="`height:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(0,this.mergeLength)}px;grid-template-rows:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.rowDefinitions.concat([table.region.rectangle.Height])"
                 :key="item">
                <el-popover width="200" placement="left" :trigger="trigger">
                    <el-select  @change="(val)=>setMode(index,val)"
                                :placeholder="placeholder"
                                v-model="table.modes.configs[index]">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.name"
                            :value="item"
                        />
                    </el-select>
                    <template #reference>
                        <el-button v-if="!table.modes.configs?.containsKey(index)" class="but" type="primary"
                                   @click="()=>{  }">+
                        </el-button>
                        <el-button class="but" type="primary">{{ table.modes.configs.get(index).name }}</el-button>
                    </template>
                </el-popover>
            </div>
        </div>
        <div v-else></div>
        <div style="margin: auto;">
            <div class="grid" :style="`grid-template-columns:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(String(),this.mergeString)};grid-template-rows:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(String(),this.mergeString)}`">
                <div class="fill" v-for="(rect,index) in table.region.getCells()" :key="index">
                    <div class="fill" style="border: 1px solid green;">
                    </div>
                </div>
            </div>
        </div>
        <div v-if="table.modes.direction === 'horizontal'"
             class="grid" style="margin:0 auto 0 0;" :style="`height:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(0,this.mergeLength)}px;height:20px;grid-template-rows:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.rowDefinitions.concat([table.region.rectangle.Height])"
                 :key="item">
                <el-button class="but" type="danger" @click="()=>{ removeMode(index) }">×</el-button>
            </div>
        </div>
        <div v-else></div>
        <div></div>
        <div v-if="table.modes.direction === 'vertical'"
             class="grid" style="margin:0 auto 0 auto;" :style="`width:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(0,this.mergeLength)}px;height:20px;grid-template-columns:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.columDefinitions.concat([table.region.rectangle.Width])"
                 :key="item">
                <el-button class="but" type="danger" @click="()=>{ removeMode(index) }">×</el-button>
            </div>
        </div>
        <div v-else></div>
        <div></div>
    </div>
</template>

<script>
import {Rect} from "@/utils/drawing/rect";

export default {
    props: {
        table: null,
    },
    data() {
        if(this.table.modes.configs == null){
            this.table.modes.configs = new Map();
        }
        return {
            trigger: 'click',
            placement: 'top',
            placeholder : '识别类型',
            options: [
                {name: '精准', value: 'precise'},
                {name: '布尔', value: 'bool'},
                {name: '字符', value: 'string'}
            ]
        }
    },
    watch: {
        table: {
            deep: true,
            handler(n, o) {
                this.table.modes;
                if (n.modes.direction !== o.modes.direction) {
                    //TODO:变了啊
                    this.table.modes.configs = new Map();
                    console.log(n.modes)
                }
            }
        }
    },
    methods: {
        getSpace(array, edge) {
            let arr = [];
            for (let i = 0; i < array.length; i++) {
                let curr = array[i];
                if (i === 0) {
                    arr.push(curr);
                } else {
                    arr.push(curr - array[i - 1])
                }
            }
            arr.push(edge - (arr.any() ? array.last() : 0));
            return arr;
        },
        mergeString: (str, val) => {
            str += `${val}px `;
            return str;
        },
        mergeLength: (sum, val) => {
            return sum += (val + 4);
        },
        getAllCells(region) {
            return region.getCells();
        },
        setMode(index,mode) {
            this.table.modes.configs.set(index,mode);
            console.log(this.table.modes.configs);
        },
        removeMode(index) {
            this.table.modes.configs.delete(index);
            delete this.table.modes.configs[index];
        }
    }
}
</script>


<style scoped>
.fill {
    margin: 0;
    height: 100%;
    width: 100%;
}

.but {
    height: 100%;
    width: 100%;
    font-size: 20px;
}

.grid {
    display: grid;
    padding: 5px;
    grid-gap: 5px 5px;
}

.fill :hover {
    background-color: rgba(56, 196, 142, 0.78);
    transition-delay: 0.1s;
    transition-duration: 0.25s;
}
</style>