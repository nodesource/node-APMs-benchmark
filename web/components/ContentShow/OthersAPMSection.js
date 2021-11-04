'use strict'

import React from 'react'

import Pane from '../Shared/Pane.js'

import { numberFormat } from '../../lib/utils'

const OthersAPMSection = (props) => {
  const { apmsAverage, metric } = props.requestsMetadata

  return (
    <Pane>
      <div className='others-apms-container'>
        <div className='others-apms-heading'>
          <div><span className='others-apms-heading-span'>Others APM's - {metric}</span></div>
        </div>
        <div className='others-apms-body'>
          {/* I know this could be better, in an array or something */}
          <div className='apm-overhead'>
            <span className='apm-overhead-name'>Datadog</span>
            <span className='apm-overhead-requests'>{numberFormat(apmsAverage.get('datadog'))} {props.metrics[metric]}</span>
          </div>
          <div className='apm-overhead'>
            <span className='apm-overhead-name'>New Relic</span>
            <span className='apm-overhead-requests'>{numberFormat(apmsAverage.get('newrelic'))} {props.metrics[metric]}</span>
          </div>
          <div className='apm-overhead'>
            <span className='apm-overhead-name'>Vanilla Node (Noop)</span>
            <span className='apm-overhead-requests'>{numberFormat(apmsAverage.get('noop'))} {props.metrics[metric]}</span>
          </div>
          <div className='apm-overhead'>
            <span className='apm-overhead-name'>Dynatrace</span>
            <span className='apm-overhead-requests'>{numberFormat(apmsAverage.get('dynatrace'))} {props.metrics[metric]}</span>
          </div>
          <div className='apm-overhead'>
            <span className='apm-overhead-name'>Instana</span>
            <span className='apm-overhead-requests'>{numberFormat(apmsAverage.get('instana'))} {props.metrics[metric]}</span>
          </div>
          <div className='apm-overhead'>
            <span className='apm-overhead-name'>Appdynamics</span>
            <span className='apm-overhead-requests'>{numberFormat(apmsAverage.get('appdynamics'))} {props.metrics[metric]}</span>
          </div>
          <div className='apm-overhead'>
            <span className='apm-overhead-name'>SignalFX</span>
            <span className='apm-overhead-requests'>{numberFormat(apmsAverage.get('signalfx'))} {props.metrics[metric]}</span>
          </div>
        </div>
      </div>
    </Pane>
  )
}

export default OthersAPMSection
