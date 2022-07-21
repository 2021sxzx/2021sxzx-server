# 2021sxzx-server
## 前置知识

- 首先对js包括es6有一定的学习
- 对node环境的js运行有一定的了解
- 学习过express框架的基本操作，b站上有很多的教程，也可以直接看express的官方文档
- 对mongodb有一定的了解，使用mongoose来对mongodb进行操作，b站也有资源，mongoose的文档也比较容易懂

## 操作代码

- 去学一下git的操作流程

- 克隆仓库代码，设置自己的username和email方便知道提交人是谁（出bug背锅
- 切换到dev分支

```git
git checkout dev #注意看git bash命令行上显示的分支是否是dev
```

- 安装依赖

```js
npm install
```

- 目录结构

```
├─node_modules/   # 模块
├─package.json    # 配置文件
├─package-lock.json # 版本配置文件
├─app.js          # 程序的入口，做相关的中间件配置或者路由的注册
├─model           # 数据库表的信息
├─routes          # 路由模块
├─controller      # 控制层，做数据业务处理
├─service         # 操作数据库，然后数据给controller
├─utils			  # 工具函数包
├─config		  # 数据库等的全局配置信息
├─middleware      # 自定义的中间件
```

- 编写自己的模块业务逻辑

```
1.首先连接数据库，具体的连接方法私聊，因为不好把服务器的东西放上来
2.首先再routes里面创建自己模块的js文件，然后根据restful api的风格定义url
3.然后再controller层中同样创建自己的js文件，然后处理相关的业务逻辑
4.到service同样创建自己的js文件，然后操作数据库，根据model中查看自己需要哪些表和数据，然后进行操作
5.如果需要添加utils或者中间件或者第三方库要事先跟其他成员确认，同时尽量不要在全局文件中定义变量，除非事先协商
```

- 自己本地测试(使用postman或者其他模拟网络请求的工具)

- 代码提交

```
1、git add .
2、git commit -m"更新的信息"
3、git push(事先要切换到dev，如果产生冲突，要先pull然后根据>>>>>>>>>这个标记检查冲突代码，解决冲突后再push)
```

- 编写接口文档（一定要写好写具体，不然会给前端骂，也不要随便改请求地址，具体可以参考已存在的接口文档

## 启动项目

启动命令详见 ./package.json 中的 script 部分。不同环境下连接的服务配置见 ./config/config.js


- 本地开发环境，连接本地的数据库和Redis`npm run start:local`
- 开发环境下启动，连接阿里云上的数据库和Redis`npm run start:dev`
- 生产环境下启动，连接政务云的数据库和Redis`npm run start:pro`


## 一些推荐的工具

- 开发工具：vscode/webstorm
- 数据库可视化工具：首推navicat，其他也行
- 模拟网络请求：postman等

## 一些好用的网站

stackoverflow、csdn、npm官网、框架官方文档
