
function castType(value, type) {
  if (value == null) return null;
  if (type === 'date') return new Date(value);
  if (type === 'number') return Number(value);
  if (type === 'string') return String(value).trim();
  if (type === 'boolean') return value === 'true' || value === true || value === 1 || value === '1';
  return value;
}

export default castType;