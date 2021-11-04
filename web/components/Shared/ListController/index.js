'use strict'

import React from 'react'
import Proptypes from 'prop-types'

import '../styles/list-controller.scss'
import Input from './Input'

const ListController = (props) => {
  const { icon, title, options, availableItems, type, onChangeHandler, selected } = props

  const optionsElements = options.map((opt, idx) => {
    const include = availableItems.includes(opt.value)
    const checked = type === 'checkbox' ? selected.includes(opt.value) : (props.selected === opt.value || false)
    return include ? <Input onChangeHandler={(e) => onChangeHandler(e)} type={type} value={opt.value} name={opt.name} key={idx} checked={checked} /> : null
  })
  return (
    <div className='list-wrapper'>
      <div className='list-icon-wrapper'>
        {icon}
        <span>{title}</span>
      </div>
      {optionsElements}
    </div>
  )
}

ListController.propTypes = {
  selected: Proptypes.any,
  autoSelection: Proptypes.bool,
  availableItems: Proptypes.array.isRequired,
  disableAll: Proptypes.bool,
  checkAll: Proptypes.bool,
  icon: Proptypes.node.isRequired,
  onChangeHandler: Proptypes.func,
  options: Proptypes.array.isRequired,
  title: Proptypes.string.isRequired
}

export default ListController
