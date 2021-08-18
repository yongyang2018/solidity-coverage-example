const CoverageAPI = require('solidity-coverage/api');
const fs = require('fs')
const ganache = require('ganache-cli')
const express = require('express')
const instrument = require('./utils')

const { createProxyMiddleware } = require('http-proxy-middleware');

const ganacheCfg = process.env.GANACHE_CONFIG
let apiCfg = {}
if(ganacheCfg && fs.existsSync(ganacheCfg)) {
    apiCfg = JSON.parse(fs.readFileSync(ganacheCfg, 'utf-8'))
}

// 读取 contracts 目录下所有以 .sol 结尾的文件
const api = new CoverageAPI(apiCfg)

// 对代码进行插桩，把插桩后的 solidity 代码写入到 temp 文件夹下面
instrument(api)

// 启动 ganache 
api.ganache(ganache).catch(console.error)

// 启动 express
const app = express()

// 把 jsonrpc 请求转发到 ganache
app.use(createProxyMiddleware((p) => p === '/', {
    target: `http://localhost:${api.port}`, // target host
    changeOrigin: true, // needed for virtual hosted sites
    ws: true, // proxy websockets
}));

app.use('/coverage', express.static('coverage'))

// 收到 /coverage.x 后重定向到报告页面
app.get('/coverage.x', (req, res) => {
    api.report('coverage').then(
        () => res.redirect('/coverage/index.html')
    )
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`server listen on ${port}`))