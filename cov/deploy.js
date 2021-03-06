const cp = require('child_process')
const fs = require('fs')
const CoverageAPI = require('solidity-coverage/api')
const instrument = require('./utils')
const ethers = require('ethers')

const api = new CoverageAPI()

// 读取原来的 hardhat.config.ts
const content = fs.existsSync('hardhat.config.ts') ? fs.readFileSync('hardhat.config.ts', 'utf-8') : ''

instrument(api)

cp.execSync('mv contracts contracts-temp')
cp.execSync('mv temp contracts')

console.log(`address of deployer = ${new ethers.Wallet(process.env.COV_KEY).address}`)

const covCfg = {
    solidity: {
        version: '0.8.0',
        settings: {
            optimizer: { enabled: false },
            evmVersion: 'istanbul',
        },
    },

    networks: {
        cov: {
            url: `http://${process.env.COV_HOST || 'localhost'}:${process.env.COV_PORT || '3000'}`,
            accounts: [process.env.COV_KEY],
        }
    }
}


const configTemplate = `
import "@nomiclabs/hardhat-ethers"

export default ${JSON.stringify(covCfg)};
`

const cwd = process.cwd()
async function main() {
    try {
        // 覆盖 hardhat.config.ts 禁用 evm 优化
        const fd = fs.openSync('hardhat.config.ts', 'w', '0666')
        fs.writeSync(fd, configTemplate)
        fs.closeSync(fd)   
        

        // 重新编译
        cp.execSync('npm run clean')

        // 部署
        cp.execSync('mkdir -p local')
        cp.execSync('./node_modules/.bin/hardhat run scripts/deploy.ts --network cov')
    } catch (e) {
        console.error(e)
    } finally {
        process.chdir(cwd)
        // 还原
        cp.execSync('mv contracts temp')
        cp.execSync('mv contracts-temp contracts')

        if (!content) {
            fs.unlinkSync('hardhat.config.ts')
            return
        }

        const fd = fs.openSync('hardhat.config.ts', 'w', '0666')
        fs.writeSync(fd, content)
        fs.closeSync(fd)        
    }
}


main()