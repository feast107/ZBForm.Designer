const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack: (config) => {
        config.plugin("html").tap((args) => {
            debugger;
            args[0].title = "ZBDesigner";
            return args;
        });
    },
    pluginOptions: {
        electronBuilder: {
            name: "ZBDesigner",
            appId: "com.zbform.zbdesigner",
            productName: "ZBDesigner",
            preload: "src/preload.js",
            chainWebpackMainProcess: (_) => {},
        },
    },
});
