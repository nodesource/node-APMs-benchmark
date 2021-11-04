import React from 'react'
import './styles/pane.scss'

export default (props) => (<div className={`shared-pane ${props.className || ''}`}>{props.children}</div>)
