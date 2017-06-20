import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import SortedTable, { SimpleTable as Table } from '../common/SortedTable'
import SimpleTabs from '../common/SimpleTabs'

import { combineColumns, BaseStats, Resistances, Skills, SkillLevel } from '../DataFields'
import ForwardFusionsTable from './ForwardFusionsTable'
import ReverseFusionsTable from './ReverseFusionsTable'

import PersonaData from '../data/PersonaData'
import SkillData from '../data/SkillData'

function Persona({ match, hasDlc, personasUrl, tabLinks }) {
  const name = match.params.name

  if (!PersonaData.hasOwnProperty(name)) {
    return <h2>Could not find {name} in compendium</h2>
  }

  const data = PersonaData[name]
  const baseUrl = match.url
  const title = 'Lvl ' + data.lvl + ' ' + data.arcana + ' ' + name

  const skills = Object.keys(data.skills).map( (name) => {
    const skill = Object.assign({ 
      key: name, name, cost: 0, lvl: data.skills[name] 
    }, SkillData[name])
    skill.element = { element: skill.element, cost: skill.cost }
    return skill
  } )

  const tabs = [
    {
      name: 'reverse-fusions',
      label: 'List of Reverse Fusions',
      content: <ReverseFusionsTable {...{
        persona: name,
        moreTabLinks: tabLinks,
        hasDlc, personasUrl
      }} />
    },
    {
      name: 'forward-fusions',
      label: 'List of Forward Fusions',
      content: <ForwardFusionsTable {...{
        persona: name,
        moreTabLinks: tabLinks,
        hasDlc, personasUrl
      }} />
    }
  ]

  return (
    <div>
      <BaseStatsTable title={title} stats={data.stats}/>
      <ResistancesTable resists={data.resists}/>
      <SkillsTable skills={skills}/>
      <Switch>
        <Route exact path={match.url} render={ 
          () => <Redirect to={`${match.url}/reverse-fusions`}/>
        }/>
        <Route path={`${match.url}/:tab`} render={ ({ match }) => (
          <SimpleTabs currTab={match.params.tab} tabs={tabs} baseUrl={baseUrl}/>
        ) }/>
      </Switch>
    </div>
  )
}

function BaseStatsTable({ title, stats }) {
  return (
    <Table {...{
      columns: BaseStats,
      data: [ { key: 0, ...stats } ],
      headers: [ title, 'Base Stats' ]
    }} />
  )
}

function ResistancesTable({ resists }) {
  const data = Resistances.colOrder
    .reduce( (acc, element) => {
       acc[element] = resists[element] ? resists[element] : 'no'
       return acc
    }, {} )
  return (
    <Table {...{
      columns: Resistances,
      data: [ { key: 0, ...data } ],
      headers: [ 'Resistances' ]
    }} />
  )
}

function SkillsTable({ skills }) {
  return (
    <SortedTable {...{ 
      columns: combineColumns(Skills, SkillLevel),
      initialSortCol: 'lvl',
      headers: [ 'Learnable Skills' ],
      data: skills
    }} />
  )
}

export default Persona
