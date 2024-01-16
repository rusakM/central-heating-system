exports.ping = (req, res, next) => {
    res.status(200).json({
        status: "success",
        boardTime: new Date().toISOString(),
    });
};
