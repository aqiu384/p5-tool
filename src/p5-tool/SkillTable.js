import React from 'react'

import SortedTable from './common/SortedTable'
import BatchLoadTable from './common/BatchLoadTable'

import { combineColumns, Skills, SkillCards } from './DataFields'
import PersonaData from './data/PersonaData'
import SkillData from './data/SkillData'

class SkillTable extends React.PureComponent {
  shouldComponentUpdate (nextProps, nextState) {
    return false
  }

  render () {
    const { personasUrl, tabLinks } = this.props

    const columns = combineColumns(Skills, SkillCards({ url: personasUrl }))

    const sPersonas = Object.keys(PersonaData).reduce( (acc, name) => {
      const pSkills = PersonaData[name].skills
      return Object.keys(pSkills).reduce( (acc, skill) => {
        acc[skill][name] = pSkills[skill]; return acc
      }, acc)
    }, Object.keys(SkillData).reduce( (acc, skill) => { acc[skill] = {}; return acc }, {} ) )

    const data = Object.keys(SkillData).map( (name) => { 
      const skill = Object.assign({ 
        key: name, cost: 0, talk: '', fuse: '', name, personas: sPersonas[name]
      }, SkillData[name])
      skill.element = { element: skill.element, cost: skill.cost }
      return skill
    }) 

    return (
      <BatchLoadTable {...{ data, columns, defaultSortCol: 'element' }} >
        <SortedTable {...{
          headers: [].concat(tabLinks, 'List of Skills'),
          colGroups: [
            { header: 'Skill', colSpan: 4 },
            { header: 'How to Obtain', colSpan: 3 }
          ]
        }} />
      </BatchLoadTable>
    )
  }
}

export default SkillTable
