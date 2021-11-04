const binary = { version: process.versions.node, nsolid: process.versions.nsolid || false }

module.exports = (name, val) => {
  console.log(JSON.stringify(Object.assign({ name: name }, val, binary)))
}
