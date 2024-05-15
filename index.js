import fs from 'node:fs';
import util from 'node:util';
import {equals, filter, flatten, map, pipe, prop, propOr, slice} from 'ramda';
import {arrayWithNoDuplicates, deleteTablesWithoutScores, writeToCsv} from './helpers.js';

const czechRacesPath = `./mockData/czech_races_data.json`;
const polishHorsesPath = `./mockData/polish_horses_data.json`;

const czechRacesData = JSON.parse(fs.readFileSync(czechRacesPath, {encoding: 'utf8', flag: 'r'}));

//returns array of horses with their races scores
const transformCzechDataToHorsesList = (data) => {
  return pipe(
    map((raceDay) => {
      const {id, country, year, raceDateTitle} = raceDay;
      const tables = propOr([], 'tables', raceDay);
      const filteredTables = deleteTablesWithoutScores(tables);
      const extendedTables = map((table) => {
        const {tableTitle, tableRows} = table;
        return map((row) => ({raceId: id, country, year, raceDateTitle, tableTitle, ...row}), tableRows);
      }, filteredTables);
      return extendedTables;
    }),
    flatten
  )(data);
};
const data = transformCzechDataToHorsesList(czechRacesData);
//console.log(util.inspect(data, {depth: null, colors: true}));

//filtered data without duplicates (by horse name - jméno koně)
const cleanData = (data) => {
  const filteredHorses = map((horse) => {
    const filtered = filter((n) => equals(prop('jméno koně', n), prop('jméno koně', horse)), data);
    return {'jméno koně': prop('jméno koně', horse), races: map((el) => ({...el}), filtered)};
  }, data);
  return arrayWithNoDuplicates(filteredHorses);
};

const cleanCzechData = cleanData(data);

await writeToCsv(cleanCzechData, 'czechHorses');

//simplifies polish horses data
const transformPolishData = (data) => {
  return map(({horseData, horseScores}) => {
    const {horseCareerData, horseRacesData} = horseScores;
    const {
      id,
      name,
      suffix,
      dateOfBirth,
      sex,
      sexForStatistics,
      breed,
      horseFromPolishBreeding,
      note,
      mother,
      father,
      color,
      trainer,
      raceOwners,
      breeders,
      raceSex,
    } = horseData;
    const basicInfo = {
      id,
      name,
      dateOfBirth,
      sex,
      breed,
      horseFromPolishBreeding,
      breeders,
      suffix,
      mother: {name: mother.name, sex: mother.sex, breed: mother.breed, suffix: mother.suffix},
      father: {name: father.name, sex: father.sex, breed: father.breed, suffix: father.suffix},
      color,
      trainer: `${propOr('', 'firstName', trainer)} ${propOr('', 'lastName', trainer)}`,
      raceOwners,
    };

    const races = map((data) => {
      const {id, name, order, place, placeBefore, jockeyWeight, record, prize, jockey, horse, trainer, race} = data;
      const {date, prizes, currency, temperature, weather, description, country, category, city, style, trackType} =
        race;
      const jockeyName = `${propOr('', 'firstName', jockey)} ${propOr('', 'lastName', jockey)}`;
      const trainerName = `${propOr('', 'firstName', trainer)} ${propOr('', 'lastName', trainer)}`;
      const raceCountry = propOr('', 'englishName', country);
      const raceCity = propOr('', 'name', city);

      return {
        raceId: id,
        raceDate: date,
        name: name || '',
        order: order || '',
        place: place || '',
        prize: prize || '',
        jockey: jockeyName,
        trainer: trainerName,
        country: raceCountry,
        city: raceCity,
      };
    }, horseRacesData);

    return {...basicInfo, horseCareerData, races: races};
  }, data);
};

const polishRacesData = JSON.parse(fs.readFileSync(polishHorsesPath, {encoding: 'utf8', flag: 'r'}));

const polishHorsesDataExtended = transformPolishData(polishRacesData);

console.log(util.inspect(polishHorsesDataExtended, {depth: null, colors: true}));

await writeToCsv(polishHorsesDataExtended, 'polishHorses');
