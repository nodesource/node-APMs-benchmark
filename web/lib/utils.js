'use strict'

const margin = { top: 25, right: 60, bottom: 25, left: 60 }
const width = 500
const height = 350
const colorsSubgroup = ['#43965a', '#5ac878']
export const colorsGroup = {
  noop: '#43965a',
  datadog: '#b373ff',
  instana: '#c0891c',
  dynatrace: '#4cb5ff',
  newrelic: '#00bfc0',
  nsolid: '#5ac878',
  nsolid_tracing: '#4caa66',
  signalfx: '#b6effb',
  appdynamics: '#725eff',
  opentelemetry: '#f5a800'
}

export const numberFormat = (value = 0) => {
  const numberFormat = new Intl.NumberFormat('en-US')
  return numberFormat.format((value).toFixed(2))
}

export function getHostName () {
  const isProd = process.env.NODE_ENV === 'production'
  const hostName = isProd ? process.env.BENCHMARK_HOSTNAME : ''
  return hostName
}

let groups = []
let subgroups = []

export async function getMetadata (runId) {
  groups = []
  subgroups = []

  const data = await d3.json(`${getHostName()}/data/${runId}/meta.json`)
  for (const apm of data.apms) {
    groups.push(apm)
  }

  for (const runtime of data.runtimes) {
    subgroups.push(`node-${runtime.node}`)
    subgroups.push(`ns-${runtime.nsolid}`)
  }

  return data
}

export function graphMetricRuns (apm, metricName, data, el) {
  const parent = el.append('div').attr('class', 'graph-pane')
  parent.append('h4').attr('class', 'text-center').html(`${apm} (${metricName})`)

  const svg = parent
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')')

  const myColor = d3.scaleOrdinal().domain(subgroups).range(colorsSubgroup)

  const x = d3.scaleLinear()
    .domain([0, data[0].values.length])
    .range([0, width])

  const xAxis = svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))

  // Axis styling
  xAxis.select('.domain')
    .attr('stroke', '#89A19D')

  xAxis.selectAll('.tick text')
    .attr('stroke', '#89A19D')
    .attr('fill', '#89A19D')

  xAxis.selectAll('.tick line')
    .attr('stroke', '#89A19D')
    .attr('fill', '#89A19D')

  const max = d3.max(data.map(d => { return d3.max(d.values) }))

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, max])
    .range([height, 0])

  const yAxisGenerator = d3.axisLeft(y)
  yAxisGenerator.ticks(3)

  const yAxis = svg.append('g')
    .call(d3.axisLeft(y))

  yAxis.select('.domain')
    .attr('stroke', '#89A19D')

  yAxis.selectAll('.tick text')
    .attr('fill', '#89A19D')
    .attr('stroke', '#89A19D')

  yAxis.selectAll('.tick line')
    .attr('fill', '#89A19D')
    .attr('stroke', '#89A19D')

  // Add the lines
  const line = d3.line()
    .x(function (d, i) { return x(i + 1) })
    .y(function (d) { return y(+d) })

  svg.selectAll('myLines')
    .data(data)
    .enter()
    .append('path')
    .attr('d', function (d) { return line(d.values) })
    .attr('stroke', function (d) { return myColor(d.name) })
    .style('stroke-width', 4)
    .style('fill', 'none')

  // Add the points
  svg
    // First we need to enter in a group
    .selectAll('myDots')
    .data(data)
    .enter()
    .append('g')
    .style('fill', function (d) { return myColor(d.name) })
    // Second we need to enter in the 'values' part of this group
    .selectAll('myPoints')
    .data(function (d) { return d.values })
    .enter()
    .append('circle')
    .attr('cx', function (d, i) { return x(i + 1) })
    .attr('cy', function (d) { return y(d) })
    .attr('r', 5)
    .attr('stroke', 'white')
}

export function normalizeData (raw, typeGraph) {
  let dataset = []
  let min, max

  raw.forEach(entry => {
    const [g, sg] = entry[0].split(':')
    const idx = groups.indexOf(g)
    if (!dataset[idx]) dataset[idx] = { group: g }
    dataset[idx][sg] = entry[1]
    if (typeof min === 'undefined' || entry[1] < min) min = entry[1]
    if (typeof max === 'undefined' || entry[1] > max) max = entry[1]
  })
  if (typeGraph === 'apms') {
    dataset = dataset.map((d) => {
      const values = Object.values(d)
      const keys = Object.keys(d)
      return { group: values[0], value: values[1], key: keys[1] }
    })
  }
  return [min, max, dataset]
}

export function makeMetricGraph (metricName, statName, rawData, el, units, apms, typeGraph) {
  // eslint-disable-next-line
  const [min, max, dataset] = normalizeData(rawData, typeGraph)

  const data = dataset.filter(item => apms.includes(item.group)).slice().sort((a, b) => d3.descending(a.value, b.value))

  const parent = el.append('div').attr('class', 'graph-pane').attr('id', metricName.replace('.', ''))

  parent.append('h4').html(`${metricName} (${statName})`)

  const svg = parent
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 600 460')
    .attr('width', width)
    // .attr('height', height)
    .append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')')

  const tooltip = d3.select(`#${metricName.replace('.', '')}`)
    .append('div')
    .attr('class', 'tooltip')

  const x = d3.scaleBand()
    .range([0, width])
    .domain(data.map((d) => d.group))
    .padding(0.2)

  const xAxis = svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))

  // Axis styling
  xAxis.select('.domain')
    .attr('stroke', '#89A19D')

  xAxis.selectAll('.tick text')
    .attr('stroke', '#89A19D')
    .attr('fill', '#89A19D')
    .style('text-anchor', 'end')
    .attr('dx', '-2em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-55)')

  xAxis.selectAll('.tick line')
    .attr('stroke', '#89A19D')
    .attr('fill', '#89A19D')

  xAxis.selectAll('.tick')
    .each((d, i, list) => {
      d3.select(list[i])
        .append('circle')
        .attr('fill', colorsGroup[d])
        .attr('r', 5)
        .attr('transform', 'translate(0,10)')
    })

  const y = d3.scaleLinear()
    .domain([0, max])
    .range([height, 0])

  const yAxisGenerator = d3.axisLeft(y)
  yAxisGenerator.ticks(3)

  const yAxis = svg.append('g')
    .call(d3.axisLeft(y).tickFormat(d3.format('.2s')))

  yAxis.select('.domain')
    .attr('stroke', '#89A19D')

  yAxis.selectAll('.tick text')
    .attr('fill', '#89A19D')
    .attr('stroke', '#89A19D')

  yAxis.selectAll('.tick line')
    .attr('fill', '#89A19D')
    .attr('stroke', '#89A19D')

  if (units) {
    const unit = units.replace(/\(([^)]+)\)/, '')
    const legend = units.match(/\(([^)]+)\)/) || ''

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('fill', '#fff')
      .attr('stroke', '#fff')
      .attr('dy', '1em')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .style('text-anchor', 'middle')
      .style('letter-spacing', '0.05em')
      .text(unit)
      .append('tspan')
      .attr('fill', '#89A19D')
      .attr('stroke', '#89A19D')
      .text(legend[0])
  }

  const xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05])

  const colorSubgroup = d3.scaleOrdinal()
    .domain(subgroups)
    .range(colorsSubgroup)

  const graphDetail = (d) => {
    return {
      runtimes: {
        fill: colorSubgroup(d.key),
        width: xSubgroup.bandwidth(),
        x: xSubgroup(d.key)
      },
      apms: {
        fill: colorsGroup[d.group],
        width: x.bandwidth(),
        x: x(d.group)
      }
    }
  }

  let graph = svg
    .selectAll()
    .data(data)
    .enter()
    .append('rect')
  if (typeGraph === 'runtimes') {
    graph = svg.append('g')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', function (d) { return 'translate(' + x(d.group) + ',0)' })
      .selectAll('rect')
      .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key], group: d.group } }) })
      .enter()
      .append('rect')
  }

  graph
    .attr('x', function (d) { return graphDetail(d)[typeGraph].x })
    .attr('y', function (d) { return y(d.value) })
    .attr('width', function (d) { return graphDetail(d)[typeGraph].width })
    .attr('height', function (d) { return d.value && height - y(d.value) })
    .attr('fill', function (d) { return graphDetail(d)[typeGraph].fill })
    .on('mouseover', function (event, d) {
      d3.select(this)
        .transition()
        .style('opacity', 0.5)
      tooltip.transition()
        .duration(200)
        .style('opacity', 1)
      tooltip.html(metricName + ': ' + numberFormat(d.value) + '<br/>' + 'APM: ' + d.group + '<br/>' + 'version: ' + d.key)
        .style('right', '0')
        .style('top', '0')
    })
    .on('mouseout', function (d) {
      d3.select(this)
        .transition()
        .style('opacity', 1)
      tooltip.transition()
        .duration(500)
        .style('opacity', 0)
    })
}

export function normalizeRuns (data) {
  const dataset = {}
  data.forEach(run => {
    const [name, runtime] = run[0].split(':')
    const runs = run[1]
    if (!dataset[name]) dataset[name] = []
    dataset[name].push({ name: runtime, values: runs })
  })
  return dataset
}

export const sortBy = (order, data) => {
  const sortByObject = order.reduce((a, c, i) => {
    a[c] = i
    return a
  }, {})
  return data.sort((a, b) => sortByObject[a] - sortByObject[b])
}

export async function renderGraphs (runId, testCase, apms, metrics, typeGraph) {
  const data = await d3.json(`${getHostName()}/data/${runId}/${testCase}.json`)
  const parent = d3.select('.graphs-container')

  // Clean existing graphs.
  parent.html(null)
  const order = ['requests.p50', 'requests.p99', 'requests.max', 'requests.min', 'cpu', 'elu', 'rss', 'heapUsed', 'heapTotal', 'external', 'arrayBuffers', 'throughput.p50', 'throughput.p99', 'throughput.max', 'throughput.min', 'latency.p50', 'latency.p99', 'latency.max', 'latency.min', 'uptime', 'loadTime', 'errors']

  sortBy(order, Object.keys(data)).forEach(metric => {
    Object.keys(data[metric]).forEach(stat => {
      if (stat === 'runs') return
      makeMetricGraph(metric, stat, data[metric][stat], parent, metrics[metric], apms, typeGraph)
    })
  })

  // This is the "dots" graphs
  // Object.keys(data).forEach(metric => {
  //   const dataset = normalizeRuns(data[metric].runs)
  //   Object.keys(dataset).forEach(apm => {
  //     graphMetricRuns(apm, metric, dataset[apm], parent)
  //   })
  // })

  return { ...data, testCase }
}
