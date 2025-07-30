require("dotenv").config();
const fs = require("fs");
const path = require("path");
const importCSV = require("./modules/import.csv");
const importMySQL = require("./modules/import.mysql");
const importAPI = require("./modules/import.api");
const importLDAP = require("./modules/import.ldap");

function importer(configPath) {
  const absolutePath = path.resolve(configPath);
  console.log("⛳️ Chemin absolu du fichier de config :", absolutePath);
  if (!fs.existsSync(absolutePath)) throw new Error("Fichier de configuration introuvable");

  const config = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));

  switch (config.sourceType.toLowerCase()) {
    case "csv":
      return importCSV(config);
    case "mysql":
      return importMySQL(config);
    case "api":
      return importAPI(config);
    case "ldap":
      return importLDAP(config);
    default:
      throw new Error(`Type de source non pris en charge: ${config.sourceType}`);
  }
}

module.exports = importer;

// Pour test CLI : node importer.js configs/test-csv.json
if (require.main === module) {
  const configFile = process.argv[2];
  importer(configFile)
    .then((data) => {
      console.log("Importation réussie:\n", data);
    })
    .catch((err) => {
      console.error("Erreur lors de l'import:", err);
    });
}
