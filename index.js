import fs from 'node:fs';
import util from 'node:util';
import { equals, filter, flatten, map, pipe, prop, propOr, slice } from 'ramda'
import { arrayWithNoDuplicates, deleteTablesWithoutScores, writeToCsv } from './helpers.js'

const czechRacesPath = `./mockData/czech_races_data.json`
const polishHorsesPath = `./mockData/polish_horses_data.json`

const czechRacesData = JSON.parse(fs.readFileSync(czechRacesPath, {encoding: 'utf8', flag: 'r'}))

//returns array of horses with their races scores
const transformCzechDataToHorsesList = (data) => {
 return  pipe(map(raceDay => {
    const {id, country, year, raceDateTitle} = raceDay
   const tables = propOr([], 'tables', raceDay)
   const filteredTables = deleteTablesWithoutScores(tables)
   const extendedTables = map(table => {
   const {tableTitle, tableRows} = table
     return map(row => ({raceId: id, country, year, raceDateTitle, tableTitle,...row}), tableRows)
   }, filteredTables)
   return extendedTables
 }), flatten)(data)

}
const data = transformCzechDataToHorsesList(czechRacesData)
console.log(util.inspect(data, {depth: null, colors: true}));

//filtered data without duplicates (by horse name - jméno koně)
const cleanData = (data) => {
  const filteredHorses = map(horse => {
    const filtered = filter(n => equals(prop('jméno koně', n), prop('jméno koně', horse)), data)
    return {'jméno koně': prop('jméno koně', horse), races: map(el => ({...el}), filtered)}
  },data)
  return arrayWithNoDuplicates(filteredHorses)

}

const cleanCzechData = cleanData(data)

await writeToCsv(cleanCzechData, 'czechHorses')
