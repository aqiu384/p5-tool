import React from 'react'

import SimpleTabs, { SimpleTabNavbar } from './common/SimpleTabs'
import PersonaTable from './PersonaTable'
import SkillTable from './SkillTable'
import PersonaEntry from './persona-entry/PersonaEntry'
import DlcTable from './DlcTable'
import Footer from './Footer'

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import DlcPersonas from './data/DlcPersonas'
import './P5Tool.css'

const HAS_DLC_KEY = 'p5-tool/hasDlc'

class P5Tool extends React.PureComponent {
  constructor(props) {
    super(props)

    let hasDlc = JSON.parse(localStorage.getItem(HAS_DLC_KEY))
    if (!hasDlc) {
      hasDlc = DlcPersonas.reduce( (acc, dlc) => { acc[dlc] = false; return acc }, {} )
      localStorage.clear()
      localStorage.setItem(HAS_DLC_KEY, JSON.stringify(hasDlc))
    }
    window.addEventListener('storage', this.onStorageUpdated)

    this.state = {
      hasDlc
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.hasDlc !== this.state.hasDlc ||
      nextProps.match !== this.match
  }

  onStorageUpdated = (e) => {
    switch (e.key) {
      case HAS_DLC_KEY:
        this.setState( () => ({ hasDlc: JSON.parse(e.newValue) }) )
        break
      default:
        break
    }
  }

  onDlcSubmit = (hasDlc) => {
    localStorage.setItem(HAS_DLC_KEY, JSON.stringify(hasDlc))
    this.setState( () => ({ hasDlc: hasDlc }) )
  }

  render() {
    const { match, location } = this.props
    const { hasDlc } = this.state

    const baseUrl = match.url === '/' ? '' : match.url
    const personasUrl = baseUrl + '/personas'

    const tabs = [
      {
        name: 'personas',
        label: 'List of Personas',
        content: <PersonaTable {...{ personasUrl, match, hasDlc }}/>
      },
      {
        name: 'skills',
        label: 'List of Skills',
        content: <SkillTable {...{ personasUrl, match }}/>
      },
      {
        name: 'dlc',
        label: 'Enter Purchased DLC',
        content: <DlcTable {...{ initHasDlc: hasDlc, onSubmit: this.onDlcSubmit }}/>
      }
    ]

    const tabLinks = SimpleTabNavbar({ tabs, baseUrl })

    return (
      <Switch>
        <Route exact path={match.url} render={ () => <Redirect to={personasUrl}/> }/>
        <Route path="/index.html" render={ () => <Redirect to={`${baseUrl}/personas`}/> }/> 
        <Route path="/skills.html" render={ () => <Redirect to={`${baseUrl}/skills`}/> }/> 
        <Route path="/personas.html" render={ () => {
          const nameParam = 'persona'
          const nameBegin = location.search.indexOf(nameParam + '=')

          let name = ''
          if (nameBegin !== -1) {
            const nameSuffix = location.search.substring(nameBegin + nameParam.length) + '&'
            console.log(nameSuffix)
            name = '/' + nameSuffix.substring(1, nameSuffix.indexOf('&'))
          }

          return <Redirect to={`${baseUrl}/personas${name}`}/>
        } }/> 
        <Route path={`${baseUrl}/:tab`} render={ ({ match }) => (
          <div className="compendium">
            <div className={match.isExact ? 'show' : 'hide'}>
              <SimpleTabs currTab={match.params.tab} tabs={tabs} baseUrl={baseUrl}/>
            </div>
            { match.params.tab === 'personas' &&
              <Route path={`${match.url}/:name`} render={ ({ match, location }) => 
                <PersonaEntry tabLinks={tabLinks} location={location} 
                personasUrl={personasUrl} match={match} hasDlc={hasDlc}/> 
              }/>
            }
            <Footer/>
          </div>
        ) }/>
      </Switch>
    )
  }
}

function App() {
  return (
    <Router basename={process.env.REACT_APP_BASE_PATHNAME}>
      <Route path="/" component={P5Tool}/>
    </Router>
  )
}

export default App
