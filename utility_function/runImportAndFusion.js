const importAd = require("../imports/ad.import");
const importKaspersky = require("../imports/kaspersky.import");
const importGlpi = require("../imports/glpi.import")
const fusion = require("../fusion/fusion.fusion");
const noAD = require("../fusion/noAD.fusion")
const newImport = require("../imports.new/import")

const path = require('path');

//chemin vers le fichier json de configuration de la source de donnees
const configPath = path.join(__dirname, "../imports.new/configs/glpi.config.json");

// Fonction principale pour exécuter l'importation et la fusion
async function runImportAndFusion() {
  await importAd();
  await importKaspersky();
  await importGlpi();
  await fusion();
  await noAD();

  //Test
  const donnees = await newImport(configPath);
  console.log("✅ Données importées :", donnees);

  console.log("✅ Processus complet terminé.");
}

module.exports = runImportAndFusion;