import castType from "./castType.js";

function mapFields(entry, fieldMapping) {
  const mapped = {};
  for (const [field, config] of Object.entries(fieldMapping)) {
    mapped[field] = castType(entry[config.source || field], config.type);
  }
  return mapped;
}

export default mapFields;