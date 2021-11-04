'use strict'

import React from 'react'
import Proptypes from 'prop-types'

import './styles/loading-bar.scss'

const BarBackground = (props) => (<div className='loading-bar-background' style={props.style}>{props.children}</div>)
const Bar = (props) => (<div className='loading-bar' style={props.style} />)

const LoadingBar = (props) => {
  const { width, height, percentage, color, backgroundColor } = props

  // Half of the height seems to get the rounded corners effect.
  const borderRadius = ((1 / 2) * height) + 'px'

  const backgroundStyle = {
    backgroundColor,
    borderRadius,
    height: height + 'px',
    width: width + 'px'
  }
  const barchartStyle = {
    borderRadius,
    backgroundColor: color,
    height: height + 'px',
    width: percentage + '%'
  }

  return (
    <div className='loading-bar-container' style={{ borderRadius }}>
      <BarBackground style={backgroundStyle}>
        <Bar style={barchartStyle} />
      </BarBackground>
    </div>
  )
}

LoadingBar.propTypes = {
  width: Proptypes.number.isRequired,
  height: Proptypes.number.isRequired,
  percentage: Proptypes.number.isRequired,
  color: Proptypes.string.isRequired,
  duration: Proptypes.number.isRequired,
  backgroundColor: Proptypes.string.isRequired
}

export default LoadingBar
