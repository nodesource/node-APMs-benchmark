'use strict'

import React from 'react'
import './styles/sidebar.scss'

import ListController from './Shared/ListController'

import { apmOpts, testsOpts, graphOpts } from './Shared/default-options.js'

const Sidebar = (props) => {
  return (
    <div className='sidebar'>
      <div className='list-controllers-container'>
        <ListController {...testsOpts} availableItems={props.availableTests} type='radio' selected={props.testSelected} onChangeHandler={props.onTestChange} />
        <ListController {...apmOpts} availableItems={props.availableAPMs} type='checkbox' selected={props.apmsSelected} onChangeHandler={props.onAPMChange} />
        {/**
          This is not currently supported
          <ListController {...metricsOpts} availableItems={props.availableMetrics} disableAll checkAll />
        */}
        <ListController {...graphOpts} availableItems={['apms', 'runtimes']} type='radio' selected={props.graphSelected} onChangeHandler={props.onGraphChange} />
      </div>
    </div>
  )
}

export default Sidebar
