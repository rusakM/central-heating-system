/*module.exports = async (fn) => async () => {
  if (!global.configSuccess) {
    return (() => {})();
  }
  return await fn();
};
*/

module.exports = (fn) => async () => {
  if (global.configSuccess) {
    await fn();
  }
};