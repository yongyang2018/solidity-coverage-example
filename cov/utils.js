const glob = require("glob")
const fs = require('fs')
const cp = require('child_process')
const path = require('path')

// 对 contracts 下的 solidity 代码进行插桩，把插桩后的 solidity 代码写入到 temp 文件夹下面
function instrument(api) {
    // 读取 contracts 目录下所有以 .sol 结尾的文件
    const files = glob.sync('contracts/**/*.sol')


    cp.execSync('mkdir -p temp')
    const inputs = files.map(f => ({ source: fs.readFileSync(f, 'utf-8'), canonicalPath: path.resolve(f) }))
    const outputs = api.instrument(inputs)

    for (let o of outputs) {
        // get relative path 
        const rel = path.relative('contracts', o.canonicalPath)

        // join temp
        const dst = path.join('temp', rel)

        // assert parent directory exists
        const dir = path.dirname(dst)
        cp.execSync(`mkdir -p ${dir}`)

        const fd = fs.openSync(dst, 'w', '0666')
        fs.writeSync(fd, o.source, 'utf-8')
        fs.closeSync(fd)
    }
}

module.exports = instrument
