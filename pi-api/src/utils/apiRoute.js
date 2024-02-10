const route = () => {
    const apiAddress = `${process.env.PROTOCOL}://${process.env.API_ADDRESS}:${process.env.API_PORT}/api`;

    return {
        api: apiAddress,
        users: {
            login: `${apiAddress}/users/login`, //POST
        },
        board: {
            getBoard: `${apiAddress}/boards/${process.env.BOARD_ID}`, //GET
        },
        sensors: {
            initialize: `${apiAddress}/boards/${process.env.BOARD_ID}/sensors/initialize`, //POST
        },
    };
};

module.exports = route;
