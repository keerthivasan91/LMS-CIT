module.exports = {
  makeInValues(array) {
    if (!Array.isArray(array) || array.length === 0) return "()";
    return "(" + array.map(() => "?").join(",") + ")";
  },

  flattenParams(array) {
    return array.flat(Infinity);
  },

  buildUpdateSet(obj) {
    const fields = Object.keys(obj)
      .map((k) => `${k}=?`)
      .join(", ");
    const values = Object.values(obj);
    return { fields, values };
  }
};
