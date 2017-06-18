import React from 'react'
import { Link } from 'react-router-dom'
import ElementIcons from './img/elements/ElementIcons'

const CompareKeys = (keyOrder) => (key) => (a, b) => keyOrder[a[key]] - keyOrder[b[key]]
const CompareNums = (key) => (a, b) => a[key] - b[key]
const CompareStrings = (key) => (a, b) => a[key].localeCompare(b[key])
const CompareObjLens = (key) => (a, b) => Object.keys(a[key]).length - Object.keys(b[key]).length

// Resistances

const Elements = [
  'phys', 'gun',
  'fire', 'ice', 'elec', 'wind',
  'psy', 'nuke', 'bless', 'curse'
]

const ResistanceOrder = [
  'ab', 'rp', 'nu', 'rs', '-', 'wk'
].reduce((acc, val, ind) => { acc[val] = ind; return acc }, {})

const ResistanceTd = ({ val }) => (
  <td className={'resists ' + (val === '-' ? 'no' : val)}>{val}</td>
)

const SimpleTh = (val) => (val)

const Resistances = {
  colOrder: Elements,
  headerFormat: Elements.reduce( (acc, val) => {
    acc[val] = <img src={ElementIcons[val]} alt={val}/>; return acc
  }, {} ),
  rowFormat: Elements.reduce( (acc, val) => {
    acc[val] = ResistanceTd; return acc
  }, {} ),
  sortFun: Elements.reduce( (acc, val) => {
    acc[val] = CompareKeys(ResistanceOrder); return acc
  }, {} )
}

// Skills

const ElementOrder = Elements.concat([
  'almighty', 'ailment', 'healing', 'support', 'passive'
]).reduce((acc, val, ind) => { acc[val] = ind; return acc }, {})

const ElementIconTd = ({ val }) => (
  <td><img src={ElementIcons[val]} alt={val}/></td>
)

const SkillCostTd = ({ val }) => (
  <td>{val >= 100 ? val / 100 + ' SP' : (val > 0 ? val + '% HP' : '')}</td>
)

const SimpleTd = ({ val }) => (
  <td>{val}</td>
)

const Skills = {
  colOrder: [ 'element', 'name', 'cost', 'effect' ],
  headerFormat: {
    element: SimpleTh('Element'),
    name: SimpleTh('Name'),
    effect: SimpleTh('Effect'),
    cost: SimpleTh('Cost')
  },
  rowFormat: {
    element: ({ val }) => ElementIconTd({ val: val.element }), 
    name: SimpleTd,
    effect: SimpleTd,
    cost: SkillCostTd
  },
  sortFun: {
    element: (key) => (a, b) => (
      CompareKeys(ElementOrder)('element')(a[key], b[key]) * 10000 + 
      CompareNums('cost')(a[key], b[key])
    ),
    name: CompareStrings,
    effect: CompareStrings,
    cost: CompareNums
  }
}

const PersonaLinkTd = ({ url }) => (
  ({ val }) => (
    <td><Link to={`${url}/${val}`}>{val}</Link></td>
  )
)

const SkillLearnedByTd = ({ url }) => (
  ({ val }) => (
    <td><ul>{Object.keys(val).map( name => {
      const lvl = val[name] !== 0 ? ` (${val[name]})` : ''
      return <li key={name}><Link to={`${url}/${name}`}>{name}{lvl}</Link></li> 
    } )}</ul></td>
  )
)

const PersonaLinkListTd = ({ url }) => (
  ({ val }) => (
    <td><ul>{val.map( name => 
      <li key={name}><Link to={`${url}/${name}`}>{name}</Link></li> )}
    </ul></td>
  )
)

const SkillCards = ({ url }) => ({
  colOrder: [ 'personas', 'talk', 'fuse' ],
  headerFormat: {
    talk: SimpleTh('Negotiation'),
    fuse: SimpleTh('Skill Card'),
    personas: SimpleTh('Learned by')
  },
  rowFormat: {
    talk: PersonaLinkTd({ url }),
    fuse: ({ val }) => PersonaLinkListTd({ url })({ val: val.split(', ') }),
    personas: SkillLearnedByTd({ url })
  },
  sortFun: {
    talk: CompareStrings,
    fuse: CompareStrings,
    personas: CompareObjLens
  }
})

const SkillLevelTd = ({ val }) => (
  <td>{val > 0 ? val : 'Innate'}</td>
)

const SkillLevel = {
  colOrder: [ 'lvl' ],
  headerFormat: { lvl: SimpleTh('Level') },
  rowFormat: { lvl: SkillLevelTd },
  sortFun: { lvl: CompareNums }
}

// Base Stats

const Stats = [ 'st', 'ma', 'en', 'ag', 'lu' ]

const BaseStats = {
  colOrder: Stats,
  headerFormat: Stats.reduce( (acc, val) => { acc[val] = SimpleTh(val); return acc }, {} ),
  rowFormat: Stats.reduce( (acc, val) => { acc[val] = SimpleTd; return acc }, {} ),
  sortFun: Stats.reduce( (acc, val) => { acc[val] = CompareNums; return acc }, {} )
}

// Compendium Entry

const ArcanaOrder = [
  'Fool', 'Magician', 'Priestess', 'Empress',
  'Emperor', 'Hierophant', 'Lovers', 'Chariot',
  'Justice', 'Hermit', 'Fortune', 'Strength',
  'Hanged Man', 'Death', 'Temperance', 'Devil',
  'Tower', 'Star', 'Moon', 'Sun',
  'Judgement', 'World'
].reduce((acc, val, ind) => { acc[val] = ind; return acc }, {})

const compEntry = ({ url }) => ({
  colOrder: [ 'arcana', 'lvl', 'name' ],
  headerFormat: {
    arcana: SimpleTh('Arcana'),
    lvl: SimpleTh('Level'),
    name: SimpleTh('Name')
  },
  rowFormat: { 
    arcana: ({ val }) => SimpleTd({ val: val.arcana }), 
    lvl: SimpleTd, 
    name: PersonaLinkTd({ url })
  },
  sortFun: {
    arcana: (key) => (a, b) => (
      CompareKeys(ArcanaOrder)('arcana')(a[key], b[key]) * 100 + 
      CompareNums('lvl')(b[key], a[key])
    ),
    lvl: CompareNums,
    name: CompareStrings
  }
})

const Inherits = {
  colOrder: [ 'inherits' ],
  headerFormat: { inherits: SimpleTh('Inherit\nType') },
  rowFormat: { inherits: ElementIconTd },
  sortFun: { inherits: CompareKeys(ElementOrder) }
}

const SpecialConditionTd = ({ url }) => (
  ({ val }) => (
    val.length > 1 ?
      PersonaLinkListTd({ url })({ val }) :
      SimpleTd({ val })
  )
)

const SpecialCondition = ({ url }) => ({
  colOrder: [ 'condition' ],
  headerFormat: { condition: SimpleTh('Special Fusion Condition') },
  rowFormat: { condition: SpecialConditionTd({ url }) },
  sortFun: { condition: CompareStrings }
})

const DlcPersona = {
  colOrder: [ 'dlc' ],
  headerFormat: { dlc: SimpleTh('Available DLC Persona') },
  rowFormat: { dlc: SimpleTd },
  sortFun: { dlc: CompareStrings }
}

// Combines generic columns

const combineColumns = (...cols) => ({
  colOrder: cols.reduce( (acc, val) => acc.concat(val.colOrder), [] ),
  headerFormat: cols.reduce( (acc, val) => Object.assign(acc, val.headerFormat), {} ),
  rowFormat: cols.reduce( (acc, val) => Object.assign(acc, val.rowFormat), {} ),
  sortFun: cols.reduce( (acc, val) => Object.assign(acc, val.sortFun), {} ),
})

const addColumnSuffix = ({ colOrder, rowFormat, sortFun, headerFormat }, suffix) => ({
  colOrder: colOrder.map( (col) => (col + suffix) ),
  headerFormat: Object.keys(rowFormat).reduce(
    (acc, col) => { acc[col + suffix] = headerFormat[col]; return acc },
  {} ),
  rowFormat: Object.keys(rowFormat).reduce(
    (acc, col) => { acc[col + suffix] = rowFormat[col]; return acc },
  {} ),
  sortFun: Object.keys(sortFun).reduce(
    (acc, col) => { acc[col + suffix] = sortFun[col]; return acc },
  {} )
})

// Exports

export {
  combineColumns, addColumnSuffix, compEntry,
  BaseStats, Resistances, Skills, SkillCards, SkillLevel,
  ArcanaOrder, Inherits, SpecialCondition, DlcPersona
}
