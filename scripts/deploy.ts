import { ethers } from "hardhat"
import { Contract, Wallet, utils, ContractFactory, ContractTransaction } from 'ethers'
import fs = require('fs')
import path = require('path')

function _dir(d: string) {
    return path.join(__dirname, d)
}

const _dbFile = _dir('../local/deploy-db.json')

function dbSet(k: string, v: string) {
    const b = fs.existsSync(_dbFile)
    let o = b ? JSON.parse(
        fs.readFileSync(_dbFile, 'ascii')
    ) : {}

    o[k] = v
    fs.writeFileSync(_dbFile, JSON.stringify(o))
}

function dbGet(k: string): string {
    const b = fs.existsSync(_dbFile)
    if (!b)
        return ''

    let o = JSON.parse(fs.readFileSync(_dbFile, 'ascii'))
    return o[k]
}

async function deployContract(id: string, name: string, args: any[], libraries: Record<string, string> = {}): Promise<Contract> {
    let addr = dbGet(id)
  
    if (addr) {
      return (await ethers.getContractFactory(name, {
        libraries: libraries
      })).attach(addr)
    }
  
    const lib = await ethers.getContractFactory(name, {
      libraries: libraries
    })
  
    const r = await lib.deploy(...args)
    dbSet(id, r.address)
    return r
  }

async function main() {
    let ret: any = {}

    ret.owner = await deployContract('OWNER', 'Owner', [])
    ret.Storage = await deployContract('STORAGE', 'Storage', [])
}

main().catch(console.error)