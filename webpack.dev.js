/*
 * @Author: liuhuitao 
 * @Date: 2019-06-27 14:50:30 
 * @Last Modified by: 
 * @Last Modified time: 2019-06-27 15:05:22
 * @description:（开发环境配置）
 */

const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  // 动态监测并实时更新页面
  devServer: {
    // contentBase: './dist',
    port: 8099,
    open: true, // 自动打开浏览器
    compress: true, // 服务器压缩
    hot: true
    //... proxy、hot
  }, // 开发服务器：run dev/start 的配置，如端口、proxy等
});