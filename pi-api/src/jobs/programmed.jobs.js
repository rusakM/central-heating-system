exports.immediateTasks = async () => {
  while (global.immediateTasks.count > 0) {
    try {
      await global.immediateTasks.pull()();
    } catch (error) {
      console.log(error);
    }
  }
};
