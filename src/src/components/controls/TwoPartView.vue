<template>
    <div>
        <div class="scale"
            :style="`display:${ show ? '' : 'none' };height:${height}px;width:${width}px`">
            <div style="position: absolute;z-index: 70; " :style="`top:${top}px;left:${left}px`">
                <slot default></slot>
            </div>
        </div>
        <slot default></slot>
    </div>
</template>

<script>
export default {
    props: ['show', 'top', 'left', 'width', 'height']
}
</script>

<style scoped>
.scale{
    z-index: 60;
    position: fixed;
    top:0;
    left:0;
    overflow: hidden;
    border: 3px solid rgba(65, 60, 60, 0.78);
    user-select: none;
    pointer-events: none
}
</style>