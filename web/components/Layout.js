import React from 'react'

import Navbar from './Navbar.js'
import Sidebar from './Sidebar.js'
import ContentShow from './ContentShow'
import Footer from './Footer.js'

// TODO: support select metrics to show
const availableMetrics = ['loadtime', 'rss', 'heaptotal', 'heapused', 'external', 'uptime', 'arraybuffers']

const OverViewLayout = (
  <div className='overview-container'>
    <h3>About NodeSource & N|Solid.</h3>
    <p>NodeSource spends a lot of time helping the enterprise use a whole set of tooling to consume Node.js as a base technology. However, NodeSource also provides an incredible console with the most advanced features called N|Solid; An augmented version of the Node.js runtime, enhanced to deliver low-impact performance insights and greater security for mission-critical Node.js applications.</p>
    <p>Wanting to go further, we have developed a tool that allows the ecosystem to know more information and insights into how vanilla node.js performs in various scenarios. We created a control test that you will see in the data referred to as noop | (no operation). This acts as our control group to compare tooling.</p>
    <p>NodeSource, as a provider of a drop-in replacement for node.js all tests, is duplicated across the node.js runtime along with N|Solid; One in its full version and the other with its tracing feature that also allows low-impact performance monitoring and enhanced security.</p>
    <a href='/'>See the benchmark results here</a>
  </div>
)

const TestsLayout = (props) => {
  return (
    <div className='content-container'>
      <Sidebar
        availableTests={props.tests} availableAPMs={props.apms} availableMetrics={availableMetrics}
        testSelected={props.testSelected} apmsSelected={props.apmsSelected} onTestChange={props.handleTestChange}
        onAPMChange={props.handleAPMChange} onGraphChange={props.handleGraphChange} graphSelected={props.graphSelected}
      />
      <ContentShow onRunOptionChange={props.handleRunOptionChange} runOptions={props.runOptions} requestsMetadata={props.requestsMetadata} runSelected={props.runSelected} metrics={props.metrics} />
    </div>
  )
}

const Layout = (props) => {
  const children = props.shouldRenderOverview ? OverViewLayout : TestsLayout(props)
  return (
    <div className='main-container'>
      <div className='navbar-container'>
        <Navbar />
      </div>
      {children}
      <div className='footer-container'>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
