'use strict'

import React from 'react'
import '../styles/content-show.scss'
import DashboardSection from './DashboardSection'
import OthersAPMSection from './OthersAPMSection'

const GraphsLayout = () => (<div className='graphs-container' />)

const ContentShow = (props) => {
  return (
    <div className='content'>
      <div className='row dashboard-panes-row'>
        <div className='column dashboard-section-container'>
          <DashboardSection runSelected={props.runSelected} runOptions={props.runOptions} onRunOptionChange={props.onRunOptionChange} requestsMetadata={props.requestsMetadata} metrics={props.metrics} />
        </div>
        <div className='column others-apm-section-container'>
          <OthersAPMSection requestsMetadata={props.requestsMetadata} metrics={props.metrics} />
        </div>
      </div>
      <div className='row'>
        <GraphsLayout />
      </div>
    </div>
  )
}

export default ContentShow
