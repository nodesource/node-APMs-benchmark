'use strict'

import React from 'react'

import Pane from '../Shared/Pane.js'

import { numberFormat } from '../../lib/utils'

const isNSolidReg = /ns-/

const PerformancePane = (props) => {
  const { apmsAverage, runtimes, metric } = props.requestsMetadata
  const runtimesMap = runtimes.entries()

  let nodeRuntimeMaxRequestAvg = 0
  let nsRuntimeMaxRequestAvg = 0
  let color = '#43965a'
  let nameRuntime = ''
  let noderuntime = ''

  for (const [runtime] of runtimesMap) {
    if (runtime.match(isNSolidReg)) {
      // This means we found the N|Solid runtime, not need more loop.
      // Rename 'ns' to 'nsolid'
      color = '#5ac878'
      const splitName = runtime.split('-')
      noderuntime = noderuntime.split('-')
      nameRuntime = `N|Solid v${splitName[1]} ${splitName[2]} (${noderuntime[1]})`
      nsRuntimeMaxRequestAvg = apmsAverage.get('nsolid') || apmsAverage.get('nsolid_tracing')
    } else {
      nameRuntime = runtime.split('-')
      noderuntime = runtime
      nameRuntime = `Node.js v${nameRuntime[1]}`
      nodeRuntimeMaxRequestAvg = apmsAverage.get('noop')
    }
  }

  return (
    <Pane>
      <div className='performance-pane'>
        <span className='title'>Performance - {metric} </span>
        <span className='nsolid-version' style={{ color }}>{nameRuntime}</span>
        <span className='requests-per-second'>{numberFormat(nsRuntimeMaxRequestAvg || nodeRuntimeMaxRequestAvg)} {props.metrics[metric]}</span>
      </div>
    </Pane>
  )
}

export default PerformancePane
