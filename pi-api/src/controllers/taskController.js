exports.addImmediateTask = (task) => {
  return (req, res, next) => {
    global.immediateTasks.push(task);
    next();
  };
};

exports.sendSuccessResponse = (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Task created successfully",
  });
};
