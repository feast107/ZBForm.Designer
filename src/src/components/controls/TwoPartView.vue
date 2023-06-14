<template>
    <div >
        <div class="scale" style="box-shadow: 0 0 15px #808080;margin: 15px "  :style="`display:${ show ? '' : 'none' };height:${height}px;width:${width}px`">
            <div style="position: absolute;z-index: 70;" :style="`top:${top}px;left:${left}px`">
                <slot default></slot>
            </div>
        </div>
        <div style="">
            <slot default></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: ['show', 'top', 'left', 'width', 'height']
}
</script>

<style scoped>
.scale {
    z-index: 60;
    position: absolute;
    overflow: hidden;
    border: 3px solid rgba(65, 60, 60, 0.78);
    border-radius: 100px;
    user-select: none;
    pointer-events: none
}
</style>