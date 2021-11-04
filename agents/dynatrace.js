try {
  require('@dynatrace/oneagent')({
    ...require('./configs/dynatrace')
  })
} catch (err) {
  console.log('Failed to load OneAgent: ' + err)
}
