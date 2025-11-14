// small helper to map rows to objects when needed
function rowsToObjects(rows, fields) {
  return rows.map(r => {
    const obj = {};
    fields.forEach((f, i) => {
      obj[f.name] = r[i];
    });
    return obj;
  });
}

module.exports = { rowsToObjects };
