<template>
    <div class="fill">
        <div id="Container" class="fill" style="z-index: 50;top:0; left :0; position: absolute;">
            <DragableRect style="background-color: #00f3f380;" :rect="rect">
            </DragableRect>
            <DragableTable style="background-color: #33f3a380;" :rect="table"
            :row-definitions="[10,10]" :col-definitions="[10,20]"
            ></DragableTable>
        </div>
        <div id="Background" class="fill" style="top:0; position: absolute;">
            <img class="fill" src="../assets/background.png" />
        </div>
        <el-drawer v-model="drawer" title="I am the title" direction="ltr">
        </el-drawer>
    </div>
</template>

<script>
import { Rect } from '@/utils/drawing/rect'
import DragableRect from './controls/DragableRect.vue';
import DragableTable from './controls/DragableTable.vue';
export default {
    components: {
        DragableRect,
        DragableTable
    },
    data() {
        window.Rect = Rect;
        return {
            drawer: false,
            rect: new Rect(50, 50, 50, 50),
            table: new Rect(200,200,100,100)
        };
    },
    methods: {

    }
}
</script>

<style lang="scss">
.fill {
    height: 100%;
    width: 100%;
}
</style>