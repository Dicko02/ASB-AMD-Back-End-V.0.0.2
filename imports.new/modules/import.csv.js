const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const mapFields = require('../../utility_function/imports.new/mapFields');

/*
 * Import CSV, map fields, insert into MongoDB collection
 */
async function importCSV(config) {
  return new Promise((resolve, reject) => {
    const data = [];

    fs.createReadStream(config.filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const mapped = mapFields(row, config.fieldMapping);
          data.push(mapped);
        } catch (err) {
          console.warn('Mapping error:', err);
        }
      })
      .on('end', async () => {
        try {
          const Model = mongoose.model(
            config.destinationCollection,
            new mongoose.Schema({}, { strict: false }),
            config.destinationCollection
          );
          // Upsert each document based on uniqueKeys
          for (const doc of data) {
            const filter = {};
            for (const key of config.uniqueKeys) {
              filter[key] = doc[key];
            }
            await Model.updateOne(filter, doc, { upsert: true });
          }
          console.log(`✅ CSV import terminé: ${data.length} enregistrements`);
          resolve(data.length);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

module.exports = importCSV;
