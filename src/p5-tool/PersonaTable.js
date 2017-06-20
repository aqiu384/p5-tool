import React from 'react'

import SortedTable from './common/SortedTable'
import BatchLoadTable from './common/BatchLoadTable'

import { combineColumns, compEntry, BaseStats, Resistances, Inherits } from './DataFields'
import PersonaData from './data/PersonaData'
import SpecialRecipes from './data/SpecialRecipes'

class PersonaTable extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.hasDlc !== this.props.hasDlc
  }

  render() {
    const { hasDlc, personasUrl, tabLinks } = this.props

    const excludedDlc = Object.keys(hasDlc).reduce( (acc, dlc) => (
      !hasDlc[dlc] ? acc.concat(dlc.split(',')) : acc
    ), [] )

    const personas = excludedDlc.reduce( (acc, name) => {
      delete acc[name]; return acc
    }, Object.assign({}, PersonaData) )

    const columns = combineColumns(
      compEntry({ url: personasUrl }), 
      Inherits, BaseStats, Resistances
    )

    const data = Object.keys(personas).map( (name) => {
      const { lvl, arcana, inherits, stats, resists } = personas[name]
      const row = {
        key: name, arcana: { arcana, lvl },
        lvl, name, inherits, ...stats
      }

      Resistances.colOrder.reduce( (acc, element) => {
        acc[element] = resists[element] ? resists[element] : 'no'; return acc
      }, row)

      if (SpecialRecipes.hasOwnProperty(name) && SpecialRecipes[name].length === 0) {
        row.rowClass = 'persona treasure'
      }

      return row
    } )

    return (
      <BatchLoadTable {...{ data, columns, defaultSortCol: 'arcana' }} >
        <SortedTable {...{
          headers: [].concat(tabLinks, 'List of Personas'),
          colGroups: [
            { header: 'Personas', colSpan: 4 },
            { header: 'Base Stats', colSpan: 5 },
            { header: 'Resistances', colSpan: 10 }
          ]
        }} />
      </BatchLoadTable>
    )
  }
}

export default PersonaTable
