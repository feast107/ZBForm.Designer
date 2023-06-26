const {defineConfig} = require("@vue/cli-service");
module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack: (config) => {
        config.plugin("html").tap((args) => {
            debugger;
            args[0].title = "ZBDesigner";
            return args;
        });
    },
    devServer: {
        proxy: {
            '/authservice': {
                target: 'http://47.93.86.37:8383',
                changeOrigin: true,
            }
        }
    },
    pluginOptions: {
        electronBuilder: {
            name: "ZBDesigner",
            appId: "com.zbform.zbdesigner",
            productName: "ZBDesigner",
            preload: "src/preload.js",
            chainWebpackMainProcess: (_) => {
            },
        },
    },
});
