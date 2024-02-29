module.exports = (fn) => async () => {
  if (!global.configSuccess) {
    return;
  }
  return await fn();
};
