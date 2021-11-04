'use strict'

import React from 'react'

import Select from '../Shared/Select.js'
import PerformancePane from './PerformancePane'

const DashboardSection = (props) => (
  <div className='dashboard-section'>
    <div className='row'>
      <div className='column'>
        <span className='dashboard-title'><strong>{'APM\'s'}</strong> performance dashboard</span>
      </div>
    </div>
    <div className='row'>
      <div className='column'>
        <span className='version-selector-span'>Test run</span>
        <Select selected={props.runSelected} options={props.runOptions} onChangeHandler={props.onRunOptionChange} />
      </div>
      <div className='column'>
        <PerformancePane className='performance-pane' requestsMetadata={props.requestsMetadata} metrics={props.metrics} />
      </div>
    </div>
  </div>
)

export default DashboardSection
