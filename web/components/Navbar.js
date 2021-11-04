'use strict'

import React from 'react'
import './styles/navbar.scss'
import * as Icons from './Icons/Icons.js'

const Navbar = (props) => {
  return (
    <nav className='navbar'>
      <div className='navbar-logo'>
        <a href='/'>
          {Icons.logo()}
        </a>
      </div>
      <div className='navbar-links'>
        <a href='/' className='active'>Dashboard</a>
        <a href='https://nodesource.com/blog/how-to-solve-your-nodejs-problems-up-to-4x-faster' target='_blank' rel='noreferrer'>Overview</a>
        <a href='https://github.com/nodesource/node-APMs-benchmark/blob/main/README.md' target='_blank' rel='noreferrer'>Docs</a>
        <a href='https://github.com/nodesource/node-APMs-benchmark/issues' target='_blank' rel='noreferrer'>Help ?</a>
      </div>
    </nav>
  )
}

export default Navbar
