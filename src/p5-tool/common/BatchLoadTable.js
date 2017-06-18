import React from 'react'

class BatchLoadTable extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      currRowCount: props.batchSize
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState( () => ({ currRowCount: nextProps.batchSize }) )
  }

  incrementRowCount = () => {
    const { data, batchSize, updateInterval } = this.props
    const { currRowCount } = this.state
    const rowsLeft = data.length - currRowCount

    if (rowsLeft > 0) {
      setTimeout( () => { this.setState( () => ({ 
        currRowCount: currRowCount +
        (rowsLeft > batchSize ? batchSize : rowsLeft)
      }) ) }, updateInterval )
    }
  }

  render() {
    const { children, data, columns, defaultSortCol: sortCol } = this.props
    const { currRowCount } = this.state

    const customTable = React.Children.only(children)
    const sortedData = data.slice(); sortedData.sort(columns.sortFun[sortCol](sortCol))
    const currData = sortedData.slice(0, currRowCount)

    this.incrementRowCount()

    return (
      React.cloneElement(customTable, { 
        data: currData,
        columns, 
        initialSortCol: sortCol 
      })
    )
  }
}

BatchLoadTable.defaultProps = {
  data: [],
  batchSize: 20,
  updateInterval: 100
}

export default BatchLoadTable
