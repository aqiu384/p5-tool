import PersonaData from '../data/PersonaData'
import FusionChart from '../data/FusionChart'
import SpecialRecipes from '../data/SpecialRecipes'
import ElementMods from '../data/ElementModifiers'

const NormalFusionExceptions = Object.keys(SpecialRecipes).reduce( (acc, nameR) => {
  const recipe = SpecialRecipes[nameR]
  if (recipe.length === 2) {
    const [ ing1, ing2 ] = recipe
    acc[ing1] = ing2
    acc[ing2] = ing1
  }

  return acc
}, {} )

const ArcanaOrder = [
  'Fool', 'Magician', 'Priestess', 'Empress',
  'Emperor', 'Hierophant', 'Lovers', 'Chariot',
  'Justice', 'Hermit', 'Fortune', 'Strength',
  'Hanged Man', 'Death', 'Temperance', 'Devil',
  'Tower', 'Star', 'Moon', 'Sun', 'Judgement'
]

const isTreasureDemon = (name) => {
  return SpecialRecipes.hasOwnProperty(name) && SpecialRecipes[name].length === 0
}

const ReverseFusionChart = ArcanaOrder.reduce( (acc, a1, row) => {
  return ArcanaOrder.slice(row + 1).reduce( (acc, a2, col) => {
    acc[FusionChart[row][row + 1 + col]].push(a1 + ' x ' + a2); return acc
  }, acc )
}, ArcanaOrder.concat('-').reduce( (acc, arcana) => { acc[arcana] = []; return acc }, {} ) )

const ReversePersonaLookup = Object.keys(PersonaData).reduce( (acc, name) => {
  if (!isTreasureDemon(name)) {
    acc[PersonaData[name].arcana][PersonaData[name].lvl] = name
  } return acc
}, ArcanaOrder.reduce( (acc, arcana) => { acc[arcana] = {}; return acc }, {} ) )

function calculateForwardNormalFusions(name1, ingredients, results) {
  if (isTreasureDemon(name1)) { return [] }

  const { arcana: arcana1, lvl: lvl1 } = PersonaData[name1]

  const recipes = ArcanaOrder
    .filter( (arcana2) => (arcana2 !== arcana1) )
    .reduce( (acc, arcana2) => {
      const arcanaR = FusionChart[ArcanaOrder.indexOf(arcana1)][ArcanaOrder.indexOf(arcana2)]

      if (arcanaR === '-') { return acc }

      const lvls2 = ingredients[arcana2]
      const lvlsR = results[arcanaR].map( lvlR => 2 * lvlR )

      return lvls2.reduce( (acc, lvl2) => {
        const indexR = lvlsR.reduce( (acc, lvlR) => (lvl1 + lvl2 <= lvlR ? acc : acc + 1), 0 )
        const lvlR = lvlsR[indexR === lvlsR.length ? lvlsR.length - 1 : indexR] / 2

        acc[ReversePersonaLookup[arcana2][lvl2]] = ReversePersonaLookup[arcanaR][lvlR]

        return acc
      }, acc )
    }, {} )

  if (NormalFusionExceptions.hasOwnProperty(name1)) {
    delete recipes[NormalFusionExceptions[name1]]
  }

  return Object.keys(recipes).map( lvl2 => lvl2 + ' = ' + recipes[lvl2] )
}

function calculateForwardSameArcanaFusions(name1, ingredients, results) {
  if (isTreasureDemon(name1)) { return [] }

  const { arcana: arcana1, lvl: lvl1 } = PersonaData[name1]

  const lvls2 = ingredients[arcana1]
    .filter( lvl2 => lvl2 !== lvl1 )

  const lvlsR = results[arcana1]
    .filter( lvlR => lvlR !== lvl1 )

  const recipes = lvls2.reduce( (acc, lvl2) => {
    const tindR = lvlsR.reduce( (acc, lvlR) => (lvl1 + lvl2 >= 2 * lvlR ? acc + 1 : acc), -1 )
    const lvlR = lvlsR[lvlsR[tindR] === lvl2 ? tindR - 1 : tindR]

    if (lvlR) { 
      acc[ReversePersonaLookup[arcana1][lvl2]] = ReversePersonaLookup[arcana1][lvlR]
    }

    return acc
  }, {} )

  if (NormalFusionExceptions.hasOwnProperty(name1)) {
    delete recipes[NormalFusionExceptions[name1]]
  }

  return Object.keys(recipes).map( lvl2 => lvl2 + ' = ' + recipes[lvl2] )
}

function calculateForwardElementFusions(name1, results) {
  if (isTreasureDemon(name1)) { return [] }

  const { arcana: arcana1, lvl: lvl1 } = PersonaData[name1]

  const lvlsR = [0, 0].concat(results[arcana1], [100, 100]); 
  if (lvlsR.indexOf(lvl1) < 0) {
    lvlsR.push(lvl1)
    lvlsR.sort( (a, b) => (a - b) )
  }

  const index1 = lvlsR.indexOf(lvl1)
  const modResults = [-2, -1, 1, 2].reduce( (acc, offset) => {
    const lvlR = lvlsR[index1 + offset]
    if (lvlR !== 0 && lvlR !== 100) {
      acc.push(offset + ' = ' + ReversePersonaLookup[arcana1][lvlR])
    }
    return acc
  }, [] )

  const modTargets = Object.keys(ElementMods[arcana1]).reduce(
    (acc, element) => {
      acc[ElementMods[arcana1][element]].push(element)
      return acc
    },
    { '-2': [], '-1': [], '1': [], '2': [] }
  )

  return modResults.reduce( (acc, modResult) => {
    const [ mod2, nameR ] = modResult.split(' = ')
    return modTargets[mod2].reduce ( (acc, name2) => {
      acc.push(name2 + ' = ' + nameR); return acc
    }, acc )
  }, [] )
}

function calculateNormalElementFusions(name1, results) {
  if (!isTreasureDemon(name1)) { return [] }

  return Object.keys(results).reduce( (acc, arcana2) => {
    const mod1 = ElementMods[arcana2][name1]
    if (mod1 === undefined) {
      return acc
    }

    const lvls1 = results[arcana2]
    const lvls2 = mod1 < 0 ? lvls1.slice(-1 * mod1) : lvls1.slice(0, -1 * mod1)
    const lvlsR = mod1 < 0 ? lvls1.slice(0, mod1) : lvls1.slice(mod1)

    return lvls2.reduce( (acc, lvl2, indR) => {
      acc.push(
        ReversePersonaLookup[arcana2][lvl2] + ' = ' +
        ReversePersonaLookup[arcana2][lvlsR[indR]]
      )
      return acc
    }, acc)
  }, [] )
}

function calculateSpecialElementFusions(name1, results) {
  if (!isTreasureDemon(name1)) { return [] }

  return Object.keys(SpecialRecipes)
    .filter( (name2) => !isTreasureDemon(name2) )
    .reduce( (acc, name2) => {
      const { arcana: arc2, lvl: lvl2 } = PersonaData[name2]

      const mod1 = ElementMods[arc2][name1]
      if (mod1 === undefined) {
        return acc
      }

      const lvlsR = results[arc2]
      const indR = mod1 + lvlsR.reduce( (acc, lvlR) => (lvl2 >= lvlR ? acc + 1 : acc), 0)

      if (indR < lvlsR.length) {
        acc.push(name2 + ' = ' + ReversePersonaLookup[arc2][lvlsR[indR]])
      }

      return acc
    }, [] )
}

function calculateDoubleElementFusions(name1, results) {
  if (!isTreasureDemon(name1)) { return [] }

  return Object.keys(SpecialRecipes)
    .filter( (name2) => isTreasureDemon(name2) && name2 !== name1 )
    .reduce( (acc, name2) => {
      const { arcana: arc1, lvl: lvl1 } = PersonaData[name1]
      const { arcana: arc2, lvl: lvl2 } = PersonaData[name2]

      const arcR = FusionChart[ArcanaOrder.indexOf(arc1)][ArcanaOrder.indexOf(arc2)]
      const lvlsR = results[arcR]

      const indR = lvlsR.reduce( (acc, lvlR) => (lvl1 + lvl2 >= 2 * lvlR ? acc + 1 : acc), 0)
      const nameR = ( indR === lvlsR.length ? ReversePersonaLookup[arcR][lvlsR[lvlsR.length - 1]] : ReversePersonaLookup[arcR][lvlsR[indR]] )

      acc.push(name2 + ' = ' + nameR); return acc
    }, [] )
}

function calculateNormalFusions(nameR, ingredients, results) {
  const { arcana: arcanaR, lvl: lvlR } = PersonaData[nameR]

  const lvlsR = results[arcanaR]
  const indexR = lvlsR.indexOf(lvlR)

  const prevLvl = lvlsR[indexR - 1] ? 2 * lvlsR[indexR - 1] : 0
  const currLvl = lvlsR[indexR + 1] ? 2 * lvlR: 200

  return ReverseFusionChart[arcanaR].reduce((acc, combo) => {
    const [ arcana1, arcana2 ] = combo.split(' x ')
    return ingredients[arcana1].reduce( (acc, lvl1) => {
      return ingredients[arcana2].reduce( (acc, lvl2) => {
        if (prevLvl < lvl1 + lvl2 && lvl1 + lvl2 <= currLvl) { 
          acc.push(
            ReversePersonaLookup[arcana1][lvl1] + ' x ' + 
            ReversePersonaLookup[arcana2][lvl2]
          )
        } return acc
      }, acc )
    }, acc )
  }, [] )
}

function calculateSameArcanaFusions(nameR, ingredients, results) {
  const { arcana: arcanaR, lvl: lvlR } = PersonaData[nameR]

  const lvlsR = results[arcanaR]
  const indexR = lvlsR.indexOf(lvlR)

  const nxnxLvl = lvlsR[indexR + 2] ? 2 * lvlsR[indexR + 2] : 200
  const nextLvl = lvlsR[indexR + 1] ? 2 * lvlsR[indexR + 1] : 200
  const currLvl = 2 * lvlR

  const lvls2 = ingredients[arcanaR]
    .filter( (lvl2) => (lvl2 !== lvlR) )

  const order = lvls2.reduce( (acc, lvl2) => {
    if (nextLvl / 2 < lvl2 && lvl2 + nextLvl / 2 < nxnxLvl) { 
      acc.push(
        ReversePersonaLookup[arcanaR][nextLvl / 2] + ' x ' + 
        ReversePersonaLookup[arcanaR][lvl2]) 
    } return acc
  }, [] )

  return lvls2.reduce( (acc, lvl1, index1) => {
    return lvls2.slice(index1 + 1).reduce( (acc, lvl2) => {
      if (currLvl <= lvl1 + lvl2 && lvl1 + lvl2 < nextLvl) {
        acc.push(
          ReversePersonaLookup[arcanaR][lvl1] + ' x ' +
          ReversePersonaLookup[arcanaR][lvl2]
        ) 
      } return acc
    }, acc )
  }, order )
}

function calculateElementFusions(nameR, ingredients, fullResults) {
  const { arcana: arcanaR, lvl: lvlR } = PersonaData[nameR]
  const offsets = [ -2, -1, 1, 2 ]
  const results = [0, 0].concat(fullResults[arcanaR], [100, 100])

  const modRecipes = ingredients[arcanaR].reduce( (acc, l1) => {
    const lvlsR = results.slice(); 
 
    if (lvlsR.indexOf(l1) < 0) { 
      lvlsR.push(l1) 
      lvlsR.sort( (a, b) => (a - b) )
    }

    const index = lvlsR.indexOf(l1)

    return offsets.reduce( (acc, offset) => {
      if (lvlsR[index + offset] === lvlR) { 
        acc.push(ReversePersonaLookup[arcanaR][l1] + ' x ' +  offset)
      } return acc
    }, acc )
  }, [] )

  const modTargets = Object.keys(ElementMods[arcanaR]).reduce(
    (acc, element) => {
      acc[ElementMods[arcanaR][element]].push(element)
      return acc
    },
    { '-2': [], '-1': [], '1': [], '2': [] }
  )

  return modRecipes.reduce( (acc, modRecipe) => {
    const [ name1, mod2 ] = modRecipe.split(' x ')
    return modTargets[mod2].reduce( (acc, name2) => {
      acc.push(name1 + ' x ' + name2); return acc
    }, acc )
  }, [] )
}

// Generate full skills

const NormalIngredients = Object.keys(PersonaData).reduce( (acc, name) => {
  if (!isTreasureDemon(name)) {
    acc[PersonaData[name].arcana].push(PersonaData[name].lvl)
  } return acc
}, ArcanaOrder.reduce( (acc, arcana) => { acc[arcana] = []; return acc }, {} ) )

const NormalResults = ArcanaOrder.reduce(
  (acc, arcana) => { acc[arcana].sort( (a, b) => (a - b) ); return acc },
  Object.keys(PersonaData).reduce( (acc, name) => {
    if (!SpecialRecipes.hasOwnProperty(name)) {
      acc[PersonaData[name].arcana].push(PersonaData[name].lvl)
    } return acc
  }, ArcanaOrder.reduce( (acc, arcana) => { acc[arcana] = []; return acc }, {} ) )
)

function calculateReverseFusions(name, excludedNames) {
  if (excludedNames.indexOf(name) !== -1) {
    return { type: 'notOwned', recipes: [] }
  }

  if (SpecialRecipes.hasOwnProperty(name)) {
    const recipe = SpecialRecipes[name]
    return recipe.length === 0 ?
      { type: 'recruit', recipes: [] } :
      { type: 'special', recipes: [ recipe ] }
  }

  const ingredients = excludedNames.reduce( (acc, name) => {
    const { arcana, lvl } = PersonaData[name]
    acc[arcana] = acc[arcana].filter( lvlI => lvlI !== lvl )
    return acc
  }, Object.assign({}, NormalIngredients) )

  const results = excludedNames.reduce( (acc, name) => {
    const { arcana, lvl } = PersonaData[name]
    acc[arcana] = acc[arcana].filter( lvlI => lvlI !== lvl )
    return acc
  }, Object.assign({}, NormalResults) )

  return { type: 'normal', recipes: [].concat(
    calculateNormalFusions(name, ingredients, results),
    calculateSameArcanaFusions(name, ingredients, results),
    calculateElementFusions(name, ingredients, results)
  )}
}

function calculateForwardFusions(name) {
  return [].concat(
    calculateForwardNormalFusions(name, NormalIngredients, NormalResults),
    calculateForwardSameArcanaFusions(name, NormalIngredients, NormalResults),
    calculateForwardElementFusions(name, NormalResults),
    calculateDoubleElementFusions(name, NormalResults),
    calculateNormalElementFusions(name, NormalResults),
    calculateSpecialElementFusions(name, NormalResults)
  )
}

export { calculateReverseFusions, calculateForwardFusions }
