import React from 'react'

const SortButtonTh = ({ val, callback, colWidth }) => (
  <th style={{ width: colWidth}} className="button" onClick={callback}>{val}</th>
)

const SortButtonTd = ({ val }) => (
  <td><label className="button">{val}<button className="invisible"/></label></td>
)

class Row extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data
  }

  render () {
    const { colOrder, rowFormat, data } = this.props
    return (<tr>{colOrder.map( (col) => React.createElement(rowFormat[col], { key: col, val: data[col], match: 'none' }) )}</tr>)
  }
}

function SimpleTable({ columns: { colOrder, rowFormat, headerFormat }, data = [], headers = [] }) {
  return (
    <table>
      <thead>
        {headers.map( (header, ind) => 
          <tr key={ind}><th colSpan={colOrder.length}>{header}</th></tr> 
        )}
        <tr>{colOrder.map( (col) => (<th key={col}>{headerFormat[col]}</th>) )}</tr></thead>
      <tbody>
        {data.map( (row) => (
          <Row {...{ key: row.key, colOrder, rowFormat, data: row }} />
        ) )}
      </tbody>
    </table>
  )
}

class SortedTable extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { 
      sortCol: props.initialSortCol ? props.initialSortCol : props.columns.colOrder[0],
      sortAsc: true,
      colWidths: props.columns.colOrder.map( () => -1 )
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.sortCol !== this.state.sortCol ||
      nextState.sortAsc !== this.state.sortAsc ||
      nextState.colWidths !== this.state.colWidths ||
      nextProps.data !== this.props.data
  }

  handleUpdateColWidths = (row) => {
    if (!row) {
      return
    }

    const { colWidths: currWidths } = this.state
    const nextWidths = []
    
    for (let i = 0; i < row.children.length; i++) {
      nextWidths.push(row.children[i].offsetWidth)
    }

    const widthsEqual = currWidths.reduce( (acc, w, ind) => w === nextWidths[ind] && acc, true)

    if (!widthsEqual) {
      this.setState( () => ({ colWidths: nextWidths }) )
    }
  }

  render () {
    const { sortCol, sortAsc, colWidths } = this.state
    const { 
      columns: { colOrder, rowFormat, sortFun, headerFormat },
      colGroups = [], data, headers = [], offset = -2
    } = this.props

    const sortBy = (col) => (
      (state, props) => {
        if (state.sortCol === col) { return { sortAsc: !state.sortAsc } }
        return { sortCol: col, sortAsc: true } 
      }
    )

    const sortedRows = data.slice()
    sortedRows.sort( sortAsc ? 
        sortFun[sortCol](sortCol) :
        (a, b) => sortFun[sortCol](sortCol)(b, a)
    )

    return (
      <table className="sorted">
        <thead>
          {headers.map( (header, ind) => 
            <tr key={ind}><th colSpan={colOrder.length}>{header}</th></tr> 
          )}
          {colGroups.length !== 0 && <tr>
            {colGroups.map( ({ header, colSpan }, ind) => 
              <th key={ind} colSpan={colSpan}>{header}</th> 
            )}
          </tr>}
          <tr>
            {colOrder.map( (col, ind) => (
              <SortButtonTh {...{ 
                colWidth: colWidths[ind] + offset,
                key: col, val: headerFormat[col],
                callback: () => this.setState(sortBy(col))
              }} />
            ) )}
          </tr>
        </thead>
        <tbody>
          <tr className="hidden" ref={ (row) => this.handleUpdateColWidths(row) }>
            {colOrder.map( (col) => (<SortButtonTd {...{ key: col, val: headerFormat[col] }} />) )}
          </tr>
          {sortedRows.map( (row) => (
            <Row {...{ key: row.key, colOrder, rowFormat, data: row }} />
          ) )}
        </tbody>
      </table>
    )
  }
}

export default SortedTable
export { SimpleTable, SortedTable }
