import React from 'react'

import { SimpleTable as Table, SortedTable } from '../common/SortedTable'
import BatchLoadTable from '../common/BatchLoadTable'

import { combineColumns, addColumnSuffix, compEntry, SpecialCondition } from '../DataFields'
import { calculateReverseFusions } from './FusionCalculations'
import PersonaData from '../data/PersonaData'

function SpecialFusionTable({ tabGroups, condition, url }) {
  return (<Table {...{
    headers: tabGroups,
    columns: SpecialCondition({ url }),
    data: [ { key: 0, condition } ]
  }}/>)
}

class ReverseFusionsTable extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.persona !== nextProps.persona
  }

  render() {
    const { persona: name, hasDlc, personasUrl, tabLinks, moreTabLinks } = this.props
    const compCols = compEntry({ url: personasUrl })
    const tabGroups = [ moreTabLinks, tabLinks ]

    const excludedNames = Object.keys(hasDlc)
      .reduce( (acc, dlc) => (!hasDlc[dlc] ? acc.concat(dlc.split(',')) : acc), [] )

    const { type: recipeType, recipes } = calculateReverseFusions(name, excludedNames)
    const data = PersonaData[name]
    const title = 'Ingredient 1 x Ingredient 2 = Lvl ' + data.lvl + ' ' + data.arcana + ' ' + name

    switch (recipeType) {
      case 'normal': 
        return (
          <BatchLoadTable {...{ 
            columns: combineColumns(compCols, addColumnSuffix(compCols, '2')),
            defaultSortCol: 'arcana',
            data: recipes.map( (recipe) => {
              const [ing1, ing2] = recipe.split(' x ')
              const i1 = PersonaData[ing1], i2 = PersonaData[ing2]
              return {
                key: ing1 + '-' + ing2,
                arcana: { arcana: i1.arcana, lvl: i1.lvl },
                lvl: i1.lvl,
                name: ing1,
                arcana2: { arcana: i2.arcana, lvl: i2.lvl },
                lvl2: i2.lvl,
                name2: ing2
              }
            })
          }} >
            <SortedTable {...{
              headers: tabGroups.concat(title),
              colGroups: [
                { header: 'Ingredient 1', colSpan: 3 },
                { header: 'Ingredient 2', colSpan: 3 }
              ]
            }} />
          </BatchLoadTable>
        )
      case 'notOwned':
        return <SpecialFusionTable {...{
          condition: [ 'DLC marked as not owned' ],
          url: personasUrl,
          tabGroups
        }}/>
      case 'special': 
        return <SpecialFusionTable {...{
          condition: recipes[0],
          url: personasUrl,
          tabGroups
        }}/>
      case 'recruit': 
        return <SpecialFusionTable {...{
          condition: [ 'Recruitment Only ' ],
          url: personasUrl,
          tabGroups
        }}/>
      default:
        return <SpecialFusionTable {...{
          condition: [ 'Unknown Entry' ],
          url: personasUrl,
          tabGroups
        }}/>
    }
  }
}

export default ReverseFusionsTable
