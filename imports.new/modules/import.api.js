const axios = require('axios');
const mongoose = require('mongoose');
const mapFields = require('../../utility_function/imports.new/mapFields');

/*
 * Import data from API, map fields, insert into MongoDB
 */
async function importAPI(config) {
  const method = (config.request.method || 'GET').toUpperCase();
  const response = await axios({
    method,
    url: config.request.url,
    headers: config.request.headers || {},
    data: config.request.body || {},
    params: config.request.params || {},
  });

  // Suppose les données utiles sont dans response.data.items ou response.data
  const rawData = response.data.items || response.data;

  if (!Array.isArray(rawData)) {
    throw new Error('Données API non tabulaires (array attendu)');
  }

  const Model = mongoose.model(
    config.destinationCollection,
    new mongoose.Schema({}, { strict: false }),
    config.destinationCollection
  );

  let count = 0;
  for (const entry of rawData) {
    const doc = mapFields(entry, config.fieldMapping);
    const filter = {};
    for (const key of config.uniqueKeys) {
      filter[key] = doc[key];
    }
    await Model.updateOne(filter, doc, { upsert: true });
    count++;
  }

  console.log(`✅ API import terminé: ${count} enregistrements`);
  return count;
}

module.exports = importAPI;
