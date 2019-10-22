const path = require('path');

module.exports = {
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            // 为生产环境修改配置...
            config.mode = 'production'
        } else {
            // 为开发环境修改配置...
            config.mode = 'development'
        }
        Object.assign(config, {
            // 开发生产共同配置
            resolve: {
                // 别名配置
                alias: {
                    '@': path.resolve(__dirname, './src'),
                    '@c': path.resolve(__dirname, './src/components'),
                    '@p': path.resolve(__dirname, './src/pages'),
                }
            },
        })
        config.module.rules.push(
            {
                test: /\.glsl$/,
                loader: 'raw-loader'
            },
            {
                test: /\.less$/,
                use: [ 
                        'style-loader', 
                        'css-loader',
                        'less-loader',
                    ],
                include: [
                    path.resolve( __dirname, 'node_modules' ),
                    path.resolve( __dirname, 'src/common' ),
                ]
            },
        )
    },
    // 多页应用，用以写一些小的demo
    pages: {
        index: {
            // page 的入口
            entry: 'src/main.js',
            // 模板来源
            template: 'public/index.html',
            // 在 dist/index.html 的输出
            filename: 'index.html',
        },
        // 只有entry属性时，直接用字符串表示模块入口
        particles: 'src/demos/particles/particles.js',
    }
}