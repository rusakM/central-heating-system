const superagent = require("superagent");

exports.loginAsAdmin = async () => {
  if (global.loginToken) {
    return global.loginToken;
  }
  const url = `${process.env.API}/api/users/login`;
  try {
    const loginData = await superagent
      .post(url)
      .send({
        email: process.env.API_USERNAME,
        password: process.env.API_PASSWORD,
      })
      .set("accept", "json");

    if (loginData) {
      return loginData._body.token;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

exports.getToken = async () => {
  if (global.loginToken) {
    return global.loginToken;
  }
  const token = await this.loginAsAdmin();
  global.loginToken = token;

  return token;
};

exports.addRequestTimestamp = (req, res, next) => {
	req.startTime = Date.now();
	next();
}