
export default function verifyToken(req, res, done) {
  var token = req.headers["x-access-token"];

  if (!token) {
    // Token not included
    return res.send({
      success: false,
      message: `lang.api.noToken`,
    });
  }

  if (token === process.env.APIKEY) {
    // Passed
    done();
  } else {
    // Token was incorrect.
    return res.send({
      success: false,
      message: `lang.api.invalidToken`,
    });
  }
}
