import React from 'react'

import { SortedTable } from '../common/SortedTable'
import BatchLoadTable from '../common/BatchLoadTable'

import { combineColumns, addColumnSuffix, compEntry } from '../DataFields'
import { calculateForwardFusions } from './FusionCalculations'
import PersonaData from '../data/PersonaData'

class ForwardFusionsTable extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.persona !== nextProps.persona
  }

  render() {
    const { persona: name, personasUrl, tabLinks, moreTabLinks } = this.props
    const compCols = compEntry({ url: personasUrl })
    const recipes = calculateForwardFusions(name)
    const data = PersonaData[name]
    const title = 'Lvl ' + data.lvl + ' ' + data.arcana + ' ' + name + ' x Ingredient 2 = Result'

    return (
      <BatchLoadTable {...{ 
        columns: combineColumns(compCols, addColumnSuffix(compCols, '2')),
        defaultSortCol: 'arcana',
        data: recipes.map( (recipe) => {
          const [ing1, ing2] = recipe.split(' = ')
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
      }}>
        <SortedTable {...{
          headers: [].concat(moreTabLinks, tabLinks, title),
          colGroups: [
            { header: 'Ingredient 2', colSpan: 3 },
            { header: 'Result', colSpan: 3 }
          ]
        }} />
      </BatchLoadTable>
    )
  }
}

export default ForwardFusionsTable
