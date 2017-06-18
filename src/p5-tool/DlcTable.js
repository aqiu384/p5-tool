import React from 'react'

import { SimpleTable as Table } from './common/SortedTable'
import { DlcPersona } from './DataFields'

class DlcTable extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hasDlc: Object.assign({}, props.initHasDlc)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.initHasDlc !== this.props.initHasDlc) {
      this.setState( () => ({ hasDlc: nextProps.initHasDlc }) )
    }
  }

  handleDlcToggle = (e) => {
    const { id: dlc, checked } = e.target
    this.setState( (prevState) => {
      const hasDlc = Object.assign({}, prevState.hasDlc); hasDlc[dlc] = checked
      return { hasDlc: hasDlc }
    } )
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.onSubmit(this.state.hasDlc)
  }

  render() {
    const { initHasDlc, tabLinks } = this.props
    const { hasDlc } = this.state

    const hasDlcSynced = Object.keys(hasDlc).reduce( (acc, dlc) => (
      initHasDlc[dlc] === hasDlc[dlc] ? acc : false
    ), true)

    if (!hasDlcSynced) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout( () => this.props.onSubmit(this.state.hasDlc), 500)
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <Table {...{
          headers: [
            tabLinks,
            'DLC Persona to Include in Fusions',
            hasDlcSynced ? 'DLC is up-to-date' : 'Updating DLC...'
          ],
          columns: DlcPersona,
          data: Object.keys(hasDlc).map( (dlc) =>
            ({ key: dlc, dlc: (
              <label htmlFor={dlc}>{dlc.replace(',', ' and ')}
                <input id={dlc} type="checkbox" checked={hasDlc[dlc]} 
                onChange={this.handleDlcToggle} />
              </label>
            )})
            )
        }}/>
      </form>
    )
  }
}

export default DlcTable
