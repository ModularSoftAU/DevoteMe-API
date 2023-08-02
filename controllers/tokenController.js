export default function verifyToken(req, res, done) {
    var token = req.headers['x-access-token'];

    if (!token) {
        // Token not included
        return res.send({
            success: false,
            message: `No token provided`
        });
    }
  
    if (token === process.env.APIKEY) {
        // Passed
        done();
    } else {
        // Token was incorrect.
        return res.send({
            success: false,
            message: `This token is incorrect.`
        });
    }
}