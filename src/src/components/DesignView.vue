<template>
    <div class="fill">
        <div id="Container" class="fill" style="z-index: 50;top:0; left :0; position: absolute;">
            <DragableRect style="background-color: #00f3f380;" :rect="rect">
                
            </DragableRect>
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
export default {
    components: {
        DragableRect
    },
    data() {
        window.Rect = Rect;
        return {
            drawer: false,
            rect: new Rect(50, 50, 50, 50)
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