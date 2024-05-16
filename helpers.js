import {filter, includes, keys, last, map, match, pipe, split, trim} from 'ramda';
import jsonexport from 'jsonexport';
import fs from 'node:fs';

export const deleteTablesWithoutScores = (tables) => {
  return filter((table) => includes('tableTitle', keys(table)), tables);
};

export const arrayWithNoDuplicates = (arr) => {
  const stringifiesSet = new Set(map((e) => JSON.stringify(e), arr));
  const arrFromSet = Array.from(stringifiesSet);
  return map((e) => JSON.parse(e), arrFromSet);
};

export const writeToCsv = async (data, text = 'data') => {
  const pathCsv = `./csvData/${text}.csv`;
  await jsonexport(data, function (err, csv) {
    if (err) return console.error(err);
    fs.writeFile(pathCsv, csv, 'utf-8', (err) => {
      if (err) {
        throw err;
      } else {
        console.log(`File written successfully with ${data.length} ${text}`);
      }
    });
  });
};

export const convertDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const cutDateFromTitle = (string) => {
  return match(/(0\d{1}|1[0-2]).([0-2]\d{1}|3[0-1]).(19|20)\d{2}/, string)[0];
};

export const cutCityFromTitle = (string) => {
  return pipe(split('-'), last, trim)(string);
};

export const cutCountryFromRaceId = (string) => {
  return pipe(split(' '), last)(string);
};
