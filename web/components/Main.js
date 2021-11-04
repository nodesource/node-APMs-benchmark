import React from 'react'
import { render } from 'react-dom'
import './main.scss'

import Layout from './Layout'

import { getMetadata, renderGraphs, getHostName } from '../lib/utils.js'

const nonHttpTests = ['basic', 'block']

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      shouldRenderOverview: false,
      runOptions: [],
      runSelected: '',
      tests: [],
      runtimes: [],
      apms: [],
      apmsSelected: [],
      testSelected: '',
      graphSelected: 'apms',
      requestsMetadata: {
        runtimes: new Map(),
        apmsAverage: new Map()
      },
      metrics: {

      }
    }

    this.formatRunOptions = this.formatRunOptions.bind(this)
    this.onRunOptionChange = this.onRunOptionChange.bind(this)
    this.onChangeTest = this.onChangeTest.bind(this)
    this.onChangeAPM = this.onChangeAPM.bind(this)
    this.onChangeGraph = this.onChangeGraph.bind(this)
    this.renderUrlBasedTest = this.renderUrlBasedTest.bind(this)
    this.fetchAllTests = this.fetchAllTests.bind(this)
    this.shouldRenderOverview = this.shouldRenderOverview.bind(this)

    this.fetchAllTests()
      .then(() => {
        this.shouldRenderOverview()
        this.renderUrlBasedTest()
      })
  }

  shouldRenderOverview () {
    const urlSearchParams = new URL(window.location).searchParams
    if (urlSearchParams.get('renderOverview')) {
      this.setState({ shouldRenderOverview: true })
    } else {
      this.setState({ shouldRenderOverview: false })
    }
  }

  async fetchAllTests () {
    return fetch(`${getHostName()}/runs`)
      .then(response => response.json())
      .then(parsedResponse =>
        parsedResponse.map(option => ({
          name: option[1],
          value: option[0],
          seleted: false
        }))
      )
      .then(parsedRunOptions => this.setState({ runOptions: parsedRunOptions, runSelected: parsedRunOptions[0].value }))
      .catch(console.error)
  }

  renderUrlBasedTest () {
    const urlSearchParams = new URL(window.location).searchParams
    const runId = urlSearchParams.get('runId')
    if (runId) {
      this.onRunOptionChange(runId)
    } else if (!runId && !urlSearchParams.get('renderOverview')) {
      this.onRunOptionChange(this.state.runSelected)
      this.setState({ shouldRenderOverview: false })
    }
  }

  formatRunOptions (options, seleted) {
    return options.map(option => ({ ...option, seleted: option.value === seleted }))
  }

  onChangeTest (event) {
    const target = event.target
    this.setState({ testSelected: target.value })
    this.renderGraph(this.state.runSelected, target.value, this.state.apmsSelected, this.state.metrics, this.state.graphSelected)
  }

  onChangeGraph (event) {
    const target = event.target
    this.setState({ graphSelected: target.value })
    console.log(target.value)
    this.renderGraph(this.state.runSelected, this.state.testSelected, this.state.apmsSelected, this.state.metrics, target.value)
  }

  onChangeAPM (event) {
    const target = event.target
    let items = [...this.state.apmsSelected]
    if (target.checked) {
      items.push(target.value)
    } else {
      items = items.filter((item) => item !== target.value)
    }
    this.setState({
      apmsSelected: items
    })
    this.renderGraph(this.state.runSelected, this.state.testSelected, items, this.state.metrics, this.state.graphSelected)
  }

  onRunOptionChange (run) {
    const url = new URL(window.location)
    url.searchParams.set('runId', run)
    window.history.pushState({}, '', url)

    this.setState({
      runOptions: this.formatRunOptions([...this.state.runOptions], run),
      runSelected: run
    })

    getMetadata(run)
      .then(({ tests, runtimes, apms, metrics }) => {
        const test = tests.find(element => element === 'http') || tests[0]
        this.setState({
          tests,
          runtimes,
          apms,
          apmsSelected: apms,
          metrics,
          testSelected: test
        })
        this.renderGraph(run, test, apms, metrics, this.state.graphSelected)
      })
  }

  renderGraph (run, test, apms, metrics, graph) {
    renderGraphs(run, test, apms, metrics, graph)
      .then(graphsMetada => {
        const runtimes = new Map()
        const apmsAverage = new Map()

        let metric
        const isHttpTest = nonHttpTests.indexOf(graphsMetada.testCase) === -1
        if (isHttpTest) {
          if (graphsMetada.testCase === 'http_loose_loop') { metric = 'elu' } else { metric = 'requests.p50' }

          const { [metric]: { avg } } = graphsMetada
          // Iterate all the Node/NSolid versions and save them
          // TODO: extract runtime versions for version picker.
          avg.forEach(runtimeAverage => {
            // The string will be something like 'noop:node-vx.y.z'
            const splitString = runtimeAverage[0].split(':')
            const apm = splitString[0]
            const runtime = splitString[1]
            const apmAndRuntimeAverage = runtimeAverage[1]

            runtimes.set(runtime, apmAndRuntimeAverage)
            apmsAverage.set(apm, apmAndRuntimeAverage)
          })
        }
        this.setState({ requestsMetadata: { runtimes, apmsAverage, metric } })
      }).catch(console.error)
  }

  render () {
    return (
      <Layout
        apms={this.state.apms}
        handleRunOptionChange={this.onRunOptionChange}
        runOptions={this.state.runOptions}
        runSelected={this.state.runSelected}
        graphSelected={this.state.graphSelected}
        tests={this.state.tests}
        requestsMetadata={this.state.requestsMetadata}
        testSelected={this.state.testSelected}
        apmsSelected={this.state.apmsSelected}
        handleAPMChange={this.onChangeAPM}
        handleTestChange={this.onChangeTest}
        handleGraphChange={this.onChangeGraph}
        shouldRenderOverview={this.state.shouldRenderOverview}
        metrics={this.state.metrics}
      />
    )
  }
}

render(<Main />, document.getElementById('root'))
