/**
 * @description:（公共配置）
 */
const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //抽取 css 到独立文件, 自动添加前缀
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: './src/js/index.js',
    login: './src/js/login.js'
  }, // 打包入口：指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始
  output: {
    path: path.resolve(__dirname, "dist"), // 解析路径为 ./dist
    filename: "js/[name].[hash:8].js"
  }, // 出口
  resolve: {
    /**
     * alias: 别名的配置
     *
     * extensions: 自动解析确定的扩展,
     *    比如 import 'xxx/theme.css' 可以在extensions 中添加 '.css'， 引入方式则为 import 'xxx/theme' /@/default ['.wasm', '.mjs', '.js', '.json']
     *
     * modules 告诉 webpack 解析模块时应该搜索的目录
     *   如果你想要添加一个目录到模块搜索目录，此目录优先于 node_modules/ 搜索
     *   这样配置在某种程度上可以简化模块的查找，提升构建速度 @default node_modules 优先
     */
    alias: {
      "@": path.resolve(__dirname, "src"),
      tool$: path.resolve(__dirname, "src/utils/tool.js") // 给定对象的键后的末尾添加 $，以表示精准匹配
    },
    extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  }, // 配置解析：配置别名、extensions 自动解析确定的扩展等等
  
  module: {
    /**
     * test: 匹配特定条件。一般是提供一个正则表达式或正则表达式的数组
     * include: 匹配特定条件。一般是提供一个字符串或者字符串数组
     * exclude: 排除特定条件
     * and: 必须匹配数组中的所有条件
     * or: 匹配数组中任何一个条件,
     * nor: 必须排除这个条件
     */
    rules: [
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "src")],
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")]
            }
          }
        ]
        //   经由上述两个 loader 的处理后，CSS 代码会转变为 JS， 如果需要单独把 CSS 文件分离出来，我们需要使用 mini-css-extract-plugin 插件
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")] // 添加css中的浏览器前缀
            }
          },
          "less-loader"
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              publicPath: '../images',  // 最终生成的css代码中,图片url前缀
              outputPath: "images/", //输出到images文件夹(图片输出的实际路径(相对于dist))
              limit: 500 //是把小于500B的文件打成Base64的格式，写入JS
            }
          }
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader", //解决ES6转ES5
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-transform-modules-commonjs'
            ]
          }
        }
      },
      { // 把html中的图片提取并打包
        test: /\.(html)$/,
        use: {
            loader: 'html-loader',
            options: {
                attrs: ['img:src', 'img:data-src', 'audio:src'],
                minimize: true
            }
        }
      }
    ]
  }, // 模块配置：配置loader（处理非 JavaScript 文件，比如 less、sass、jsx、图片等等）等
  plugins: [
    new CleanWebpackPlugin(), //打包前清理源目录文件 clean-webpack-plugin
    new MiniCssExtractPlugin({  //src/css/common/下的css单独打包并引用
      filename: "css/[name].[hash:8].css",
      chunkFilename: "css/[id].[hash:8].css"
    }),
    new HtmlWebpackPlugin({
      filename: "index.html", // 配置输出文件名和路径
      template: "./src/index.html", // 配置要被编译的html文件
      hash: true,
      // 压缩 => production 模式使用
      minify: {
        removeAttributeQuotes: true, //删除双引号
        collapseWhitespace: true //折叠 html 为一行
      },
      chunks: ['jquery', 'index']
    }),
    new HtmlWebpackPlugin({
      filename: "login.html", // 配置输出文件名和路径
      template: "./src/login.html", // 配置要被编译的html文件
      hash: true,
      // 压缩 => production 模式使用
      minify: {
        removeAttributeQuotes: true, //删除双引号
        collapseWhitespace: true //折叠 html 为一行
      },
      chunks: ['jquery', 'login']
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery-1x',
      jQuery: 'jquery-1x'
    }),
    new CopyWebpackPlugin([
      { from: './src/static', to: 'static' }
    ])
  ], // 插件的配置：打包优化、资源管理和注入环境变量
  optimization: {
    //提取公用代码
    splitChunks: {
      cacheGroups: {
        commons: {
          // 抽离自己写的公共代码
          chunks: "initial",
          name: "common", // 打包后的文件名，任意命名
          minChunks: 2, //最小引用2次
          minSize: 0 // 只要超出0字节就生成一个新包

          // test: /jquery/,
          // name: 'jquery',
          // chunks: 'all'
        },
        styles: {
          name: "styles", // 抽离公用样式
          test: /\.css$/,
          chunks: "all",
          minChunks: 2,
          enforce: true
        },
        vendor: {
          // 抽离第三方插件
          test: /node_modules/, // 指定是node_modules下的第三方包
          chunks: "initial",
          name: "vendor", // 打包后的文件名，任意命名
          // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
          priority: 10
        }
      }
    },
    minimizer: [  //解决IE8“缺少标识符”错误
      new UglifyJsPlugin({
          uglifyOptions: {
            ie8: true
          }
      })
    ]
  },
};
