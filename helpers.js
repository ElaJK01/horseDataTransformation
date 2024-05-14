import { map } from 'ramda';
import jsonexport from 'jsonexport';
import fs from 'node:fs';

export const arrayWithNoDuplicates = (arr) => {
  const stringifiesSet = new Set(map(e => JSON.stringify(e), arr))
  const arrFromSet = Array.from(stringifiesSet)
  return map(e => JSON.parse(e), arrFromSet)
}

export const writeToCsv = async (data, text='data') => {
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
