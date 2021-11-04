'use strict'

import React from 'react'
import Proptypes from 'prop-types'

import '../styles/list-controller.scss'
import { colorsGroup } from '../../../lib/utils'

const Checkbox = (props) => {
  return (
    <div className='controller-wrapper'>
      <label className='controller-container' onClick={props.onChangeHandler}>
        <div className='legend' style={{ backgroundColor: colorsGroup[props.value] }} />
        {props.name}
        <input type={props.type} value={props.value} checked={props.checked} />
        <span className='checkmark' />
      </label>
    </div>
  )
}

Checkbox.propTypes = {
  value: Proptypes.string.isRequired,
  name: Proptypes.string.isRequired,
  onChangeHandler: Proptypes.func.isRequired,
  checked: Proptypes.bool
}

export default Checkbox
