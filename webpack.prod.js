/*
 * @Author: liuhuitao 
 * @Date: 2019-06-27 14:52:13 
 * @Last Modified by: 
 * @Last Modified time: 2019-06-27 15:22:19
 * @description:（生产环境配置）
 */

const merge = require('webpack-merge');
const common = require('./webpack.common');
module.exports = merge(common, {
    // 方便追踪源代码错误
    //（如果不需要3.2小节的追踪功能，可以注释掉下行代码）
    // devtool: 'source-map'
});