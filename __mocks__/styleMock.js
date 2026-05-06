module.exports = new Proxy({}, {
  get: function(target, property) {
    if (property === '__esModule') {
      return false;
    }
    return property;
  }
});
