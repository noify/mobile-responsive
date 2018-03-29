'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const webpack = require('webpack') // 引入 webpack 便于调用其内置插件

// 获取绝对路径
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  // 入口文件，可以指定多个入口起点
  entry: {
    app: './src/js/index.js',
    vendor: [ // 第三方库可以统一放在这个入口一起合并
      'lodash'
    ]
  },
  // 输出路径和命名规则
  output: { // 输出，只可指定一个输出配置
    path: config.build.assetsRoot, // 输出文件所在的目录
    filename: '[name].js', // 输出bundle文件命名格式
    publicPath: process.env.NODE_ENV === 'production' // 静态资源的url
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  // 模块resolve的规则
  resolve: {
    // 默认解析扩展路径，引入文件可节约后缀名
    extensions: ['.js', '.less', '.json'],
    // 设置模块别名，便于我们更方便引用
    alias: {
      '@': resolve('src'),
    }
  },
  module: { // 如何处理项目中不同类型的模块
    rules: [ // 用于规定在不同模块被创建时如何处理模块的规则数组
      {
        test: /\.(html)$/,
        loader: 'html-loader',
        options: {
          attrs: ['img:src']
        }
      },
      // 对src和test文件夹下的.js文件使用babel-loader将es6+的代码转成es5
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
        //exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // 小于10K的图片转成base64编码的dataURL字符串写到代码中
          limit: 10000,
          // 其他的图片转移到静态资源文件夹
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [ // 插件属性，是插件的实例数组
    new webpack.ProvidePlugin({ // 设置全局变量
      _: 'lodash',
    })
  ],
}
