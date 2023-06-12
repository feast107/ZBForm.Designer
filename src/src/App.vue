<template>
    <DesignView></DesignView>
</template>

<script>
import DesignView from "./components/DesignView.vue";
import HelloWorld from "./components/HelloWorld.vue";

export default {
    name: "App",
    components: {
        DesignView,
    },
    created(){
      window.message = this.$message;
    }
};
</script>

<style>
html body{
    height: 100%;
    overflow: hidden;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 0;
    padding: 0;
    height: 100%;
}
</style>
