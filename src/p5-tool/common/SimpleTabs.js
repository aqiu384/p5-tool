import React from 'react'
import { Link } from 'react-router-dom'

function SimpleTabNavbar({ tabs, baseUrl }) {
  return (
    <div className="tab-group">
      {tabs.map( ({ name, label }) =>
        <div key={name} className="tab-option">
          <Link className="button" to={`${baseUrl}/${name}`}>{label}</Link>
        </div>
      )}
    </div>
  )
}

function SimpleTabs({ currTab, tabs, baseUrl }) {
  const tabLinks = <SimpleTabNavbar {...{ tabs, baseUrl }}/>
  return (
    <div>
      {tabs.map( ({ name, content }) =>
        <div key={name} className={name === currTab ? 'show' : 'hide'}>
          {React.cloneElement(content, { tabLinks })}
        </div>
      )}
    </div>
  )
}

export default SimpleTabs 
export { SimpleTabNavbar }
