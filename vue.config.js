const path = require('path');
const ThreeExamples = require('import-three-examples')

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
            ...ThreeExamples
        )
    },
}