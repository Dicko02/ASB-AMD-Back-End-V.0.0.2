const ldap = require('ldapjs');
const mongoose = require('mongoose');
const mapFields = require('../../utility_function/imports.new/mapFields');

/*
 * Import data from LDAP, map fields, insert into MongoDB
 */
async function importLDAP(config) {
  const client = ldap.createClient({
    url: config.connection.url
  });

  function search(client, base, options) {
    return new Promise((resolve, reject) => {
      const entries = [];
      client.search(base, options, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        res.on('searchEntry', (entry) => {
          entries.push(entry.object);
        });
        res.on('error', reject);
        res.on('end', (result) => {
          resolve(entries);
        });
      });
    });
  }

  // Bind LDAP client
  await new Promise((resolve, reject) => {
    client.bind(config.connection.bindDN, config.connection.bindCredentials, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // LDAP search options
  const opts = {
    scope: config.search.scope || 'sub',
    filter: config.search.filter || '(objectClass=*)',
    attributes: config.search.attributes || []
  };

  const entries = await search(client, config.search.base, opts);

  // Close LDAP connection
  client.unbind();

  const Model = mongoose.model(
    config.destinationCollection,
    new mongoose.Schema({}, { strict: false }),
    config.destinationCollection
  );

  let count = 0;
  for (const entry of entries) {
    const doc = mapFields(entry, config.fieldMapping);
    const filter = {};
    for (const key of config.uniqueKeys) {
      filter[key] = doc[key];
    }
    await Model.updateOne(filter, doc, { upsert: true });
    count++;
  }

  console.log(`✅ LDAP import terminé: ${count} enregistrements`);
  return count;
}

module.exports = importLDAP;
