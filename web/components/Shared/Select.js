import React from 'react'
import Proptypes from 'prop-types'

import './styles/select.scss'

const renderSelectOptions = (options, selectedOpt) => {
  const selectOptions = [...options]
  return selectOptions.map((option, idx) => (
    <option value={option.value} key={idx}>{option.name}</option>
  ))
}

const Select = (props) => (
  <select className='select-wrapper' onChange={(e) => props.onChangeHandler(e.target.value)} value={props.selected}>
    {renderSelectOptions(props.options, props.selected)}
  </select>
)

Select.proptypes = {
  options: Proptypes.array.isRequired,
  onChangeHandler: Proptypes.func.isRequired,
  selected: Proptypes.any
}

export default Select
