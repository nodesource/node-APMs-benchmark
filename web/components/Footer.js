'use strict'

import React from 'react'
import './styles/footer.scss'
import * as Icons from './Icons/Icons.js'

const SidebarLinks = () => (
  <>
    <div>
      <a href='https://github.com/nodesource/node-APMs-benchmark' target='_blank' rel='noreferrer'>{Icons.github()}GitHub</a>
    </div>
    <div>
      <a href='https://nodesource.com/legal/product-tos' target='_blank' rel='noreferrer'>{Icons.terms()}Terms & Privacy</a>
    </div>
  </>
)

const Footer = () => (
  <footer className='footer'>
    {/* <div className='footer-offset' /> */}
    <div className='footer-message'>
      <span>Made with 💚 by NodeSource LLC</span>
    </div>
    <div className='sidebar-links-container'>
      <SidebarLinks />
    </div>
  </footer>
)

export default Footer
