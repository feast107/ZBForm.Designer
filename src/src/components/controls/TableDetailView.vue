<template>
    <div class="grid" style="grid-template-columns:1fr auto 1fr;grid-template-rows:1fr auto 1fr;">
        <div></div>
        <div class="grid" style="margin:0 auto 10px auto;" :style="`width:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(0,this.mergeLength)}px;height:20px;grid-template-columns:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.columDefinitions.concat([table.region.rectangle.Width])"
                 :key="item">
                <el-button class="but" type="primary" @click="()=>{ insertCol(index) }">+</el-button>
            </div>
        </div>
        <div></div>
        <div class="grid" style="margin:0 0 0 auto;" :style="`height:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(0,this.mergeLength)}px;height:20px;grid-template-rows:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.rowDefinitions.concat([table.region.rectangle.Height])"
                 :key="item">
                <el-button class="but" type="primary" @click="()=>{ insertRow(index) }">+</el-button>
            </div>
        </div>
        <div style="margin: auto;">
            <div class="grid" :style="`grid-template-columns:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(String(),this.mergeString)};grid-template-rows:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(String(),this.mergeString)}`">
                <div class="fill" v-for="item in getAllCells(table.region)" :key="item">
                    <el-popover width="200" :placement="placement" :trigger="trigger">
                        <template #reference>
                            <div class="fill" style="border: 1px solid green;" :oncontextmenu="rightClick"></div>
                        </template>
                        <template #default>
                            <el-descriptions direction="vertical" :column="2" border>
                                <el-descriptions-item label="X">
                                    <el-statistic :value="item.rectangle.Left * scale + offset"/>
                                </el-descriptions-item>
                                <el-descriptions-item label="Y">
                                    <el-statistic :value="item.rectangle.Top * scale + offset"/>
                                </el-descriptions-item>
                                <el-descriptions-item label="宽">
                                    <el-statistic :value="item.rectangle.Width * scale + offset"/>
                                </el-descriptions-item>
                                <el-descriptions-item label="高">
                                    <el-statistic :value="item.rectangle.Height * scale + offset"/>
                                </el-descriptions-item>
                            </el-descriptions>
                        </template>
                    </el-popover>
                </div>
            </div>
        </div>
        <div class="grid" style="margin:0 auto 0 0;" :style="`height:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(0,this.mergeLength)}px;height:20px;grid-template-rows:${
                getSpace(table.region.rowDefinitions,table.region.rectangle.Height)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.rowDefinitions.concat([table.region.rectangle.Height])"
                 :key="item">
                <div v-if="index === 0"></div>
                <el-button v-else class="but" type="danger" @click="()=>{ removeRow(index - 1) }">×</el-button>
            </div>
        </div>
        <div></div>
        <div class="grid" style="margin:0 auto 0 auto;" :style="`width:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(0,this.mergeLength)}px;height:20px;grid-template-columns:${
                getSpace(table.region.columDefinitions,table.region.rectangle.Width)
                .aggregate(String(),this.mergeString)}`">
            <div v-for="(item,index) in table.region.columDefinitions.concat([table.region.rectangle.Width])"
                 :key="item">
                <div v-if="index === 0"></div>
                <el-button v-else class="but" type="danger" @click="()=>{ removeCol(index - 1) }">×</el-button>
            </div>
        </div>
        <div></div>
    </div>
</template>

<script>
import {Rect} from "@/utils/drawing/rect";

export default {
    props: {
        table: null,
        scale: {
            type: Number,
            default: 1,
        },
        offset: {
            type: Number,
            default: 0,
        }
    },
    data() {
        this.table.region.columDefinitions.orderBy(x=>x);
        this.table.region.rowDefinitions.orderBy(x=>x);
        return {
            placement: 'top-end',
            trigger: 'click'
        }
    },
    methods: {
        rightClick(...args) {
        },
        getSpace(array, edge) {
            console.log(array);
            let arr = [];
            for (let i = 0; i < array.length; i++) {
                let curr = array[i];
                arr.push((curr - (i === 0 ? 0 : array[i - 1])) * this.scale);
            }
            arr.push((edge - (arr.any() ? array.last() : 0)) * this.scale);
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
        insertRow(index) {
            let top = index === 0 ? 0 : this.table.region.rowDefinitions[index - 1];
            let bottom = index === this.table.region.rowDefinitions.length
                ? this.table.region.rectangle.Height
                : this.table.region.rowDefinitions[index];
            this.table.region.rowDefinitions.insert(index, ((top + bottom) / 2).toFixed().toInt());
        },
        insertCol(index) {
            let left = index === 0 ? 0 : this.table.region.columDefinitions[index - 1];
            let right = index === this.table.region.columDefinitions.length
                ? this.table.region.rectangle.Width
                : this.table.region.columDefinitions[index];
            this.table.region.columDefinitions.insert(index, (((left + right) / 2).toFixed()).toInt());
        },
        removeRow(index) {
            this.table.region.rowDefinitions.removeAt(index);
        },
        removeCol(index) {
            this.table.region.columDefinitions.removeAt(index);
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