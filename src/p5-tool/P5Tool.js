import React from 'react'

import SimpleTabs, { SimpleTabNavbar } from './common/SimpleTabs'
import PersonaTable from './PersonaTable'
import SkillTable from './SkillTable'
import PersonaEntry from './persona-entry/PersonaEntry'
import DlcTable from './DlcTable'

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import DlcPersonas from './data/DlcPersonas'
import './P5Tool.css'

class P5Tool extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hasDlc: DlcPersonas.reduce( (acc, dlc) => { acc[dlc] = false; return acc }, {} )
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.hasDlc !== this.state.hasDlc ||
      nextProps.match !== this.match
  }

  onDlcSubmit = (hasDlc) => {
    this.setState( () => ({ hasDlc: hasDlc }) )
  }

  render() {
    const { match } = this.props
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
