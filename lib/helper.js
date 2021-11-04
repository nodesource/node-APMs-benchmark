'use strict'

const fs = require('fs')
const os = require('os')
const { green } = require('colorette')
const semverMajor = require('semver/functions/major')
const tar = require('tar')
const { request, stream } = require('undici')

const CACHE_DIR = `${os.homedir()}/.nsolid-benchmark`
const NODE_CACHE_DIR = `${CACHE_DIR}/node`
const NSOLID_CACHE_DIR = `${CACHE_DIR}/nsolid`
const NODE_BASE_URL = 'https://nodejs.org/dist'
const NODE_URL = `${NODE_BASE_URL}/index.json`
const NSOLID_URL = 'https://nsolid-download.nodesource.com/download/metadata.json'

let NSolidVersions

const LTSNames = {
  12: 'erbium',
  14: 'fermium',
  16: 'gallium'
}

const AgentOpts = {
  NODE: 0,
  NSOLID: 1,
  NSOLID_TRACING: 2,
  APM: 3,
  NSOLID_APM: 4
}

const HTTPTests = [
  'express',
  'fastify',
  'hapi',
  'http',
  'http_loose_loop'
]

function ltsNameFromVersion (version) {
  return LTSNames[version.split('.')[0]]
}

async function getNodeVersions (major) {
  const { body } = await request(NODE_URL)
  let versions = ''
  for await (const data of body) {
    versions += data
  }

  let start = false
  const ret = []
  const verArray = JSON.parse(versions)
  for (const v of verArray) {
    if (semverMajor(v.version) === major && v.lts) {
      ret.push({
        name: v.version,
        value: v.version.substring(1)
      })
      start = true
    } else if (start) {
      break
    }
  }

  return ret
}

function getNodeURL (version) {
  let url = `${NODE_BASE_URL}/v${version}/`
  switch (process.platform) {
    case 'darwin':
    case 'linux':
      url += `node-v${version}-${process.platform}-${process.arch}.tar.gz`
      break
    case 'win32':
      url += `win-${process.arch}/node.exe`
      break
    default:
      return null
  }
  return url
}

async function getNSolidVersions () {
  const { body } = await request(NSOLID_URL)
  let versions = ''
  for await (const data of body) {
    versions += data
  }

  return JSON.parse(versions)
}

async function getNSolidVersion (nodeVersion) {
  if (!NSolidVersions) {
    NSolidVersions = await getNSolidVersions()
  }

  for (const [version, value] of Object.entries(NSolidVersions)) {
    if (Object.keys(value.versions).includes(nodeVersion)) {
      return {
        version,
        url: value.artifacts[process.platform][`nsolid-${ltsNameFromVersion(nodeVersion)}`]
      }
    }
  }

  return null
}

async function downloadBinary (url, destPath, isNSolid) {
  try {
    await fs.promises.mkdir(destPath, { recursive: true })
  } catch (e) {
  }

  const binary = isNSolid ? 'nsolid' : 'node'
  switch (process.platform) {
    case 'darwin':
    case 'linux':
      {
        let downloaded = 0
        let percent = 0
        const tmpDir = fs.mkdtempSync('/tmp/benchmark-')
        const { body, headers } = await request(url)
        const len = parseInt(headers['content-length'], 10)
        const tarStream = tar.x({ C: tmpDir })
        body.on('data', (chunk) => {
          downloaded += chunk.length
          percent = (100.0 * downloaded / len).toFixed(2)
          process.stdout.write(`Downloading ${url} ${green(percent)}% - ${green((downloaded / 1048576).toFixed(2))} MB\r`)
        })
        body.pipe(tarStream)
        await new Promise((resolve, reject) => {
          tarStream.on('end', resolve)
          tarStream.on('error', reject)
        })
        process.stdout.write('\n')
        await moveFile(`${tmpDir}/${url.split('/').pop().split('.tar')[0]}/bin/${binary}`,
                       `${destPath}/${binary}`)
      }
      break

    case 'win32':
      await stream(url, () => {
        return fs.createWriteStream(`${destPath}/${binary}.exe`)
      })
      break
  }
}

async function downloadNodeBinary (nodeUrl, destPath) {
  return downloadBinary(nodeUrl, destPath, false)
}

async function downloadNSolidBinary (nodeUrl, destPath) {
  return downloadBinary(nodeUrl, destPath, true)
}

async function moveFile (src, dest) {
  try {
    await fs.promises.rename(src, dest)
  } catch (err) {
    await fs.promises.copyFile(src, dest)
  }
}

function runHttpTests (tests) {
  return tests.some(test => HTTPTests.includes(test))
}

async function setupNodeVersion (nodeVersion, nodeUrl, dir) {
  // Check if in cache. If not download, store in cache and put it there!
  const cachePath = `${NODE_CACHE_DIR}/${nodeVersion}`
  if (!fs.existsSync(`${cachePath}/node`)) {
    await downloadNodeBinary(nodeUrl, cachePath)
  }

  try {
    await fs.promises.mkdir(`${dir}/${nodeVersion}`)
  } catch (e) {
  }

  await fs.promises.copyFile(`${cachePath}/node`, `${dir}/${nodeVersion}/node`)
}

async function setupNSolidVersion (nodeVersion, nsolidVersion, nsolidUrl, dir) {
  // Check if in cache. If not download, store in cache and put it there!
  const cachePath = `${NSOLID_CACHE_DIR}/${nsolidVersion}/${ltsNameFromVersion(nodeVersion)}`
  if (!fs.existsSync(`${cachePath}/nsolid`)) {
    await downloadNSolidBinary(nsolidUrl, cachePath)
  }

  await fs.promises.copyFile(`${cachePath}/nsolid`, `${dir}/${nodeVersion}/nsolid`)
}

function usesApms (opts) {
  for (const opt of opts) {
    if (opt === AgentOpts.APM || opt === AgentOpts.NSOLID_APM) {
      return true
    }
  }

  return false
}

function usesNSolid (opts) {
  for (const opt of opts) {
    if (opt === AgentOpts.NSOLID ||
        opt === AgentOpts.NSOLID_TRACING ||
        opt === AgentOpts.NSOLID_APM) {
      return true
    }
  }

  return false
}

module.exports = {
  AgentOpts,
  getNodeVersions,
  getNodeURL,
  getNSolidVersion,
  HTTPTests,
  ltsNameFromVersion,
  runHttpTests,
  setupNodeVersion,
  setupNSolidVersion,
  usesApms,
  usesNSolid
}
