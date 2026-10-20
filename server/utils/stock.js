function stockKey(colorway, size) {
  return `${colorway}-${size.toString().replace('.', '_')}`;
}

module.exports = { stockKey };
