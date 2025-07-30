const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const mapFields = require('../../utility_function/imports.new/mapFields');

/*
 * Import MySQL data, map fields, insert into MongoDB
 */
async function importMySQL(config) {
  const connection = await mysql.createConnection(config.connection);
  const [rows] = await connection.execute(config.query);
  await connection.end();

  const Model = mongoose.model(
    config.destinationCollection,
    new mongoose.Schema({}, { strict: false }),
    config.destinationCollection
  );

  let count = 0;
  for (const row of rows) {
    const doc = mapFields(row, config.fieldMapping);
    const filter = {};
    for (const key of config.uniqueKeys) {
      filter[key] = doc[key];
    }
    await Model.updateOne(filter, doc, { upsert: true });
    count++;
  }

  console.log(`✅ MySQL import terminé: ${count} enregistrements`);
  return count;
}

module.exports = importMySQL;
