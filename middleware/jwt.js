const jwt = require("jsonwebtoken")
const jwt_auth = process.env.JWT_SECRET_KEY || ''
class JWTService{

    static generateToken(id) {
        return jwt.sign({ id }, jwt_auth, { expiresIn: '1d' })
    }

    static verifyToken(token) {
        return jwt.verify(token, jwt_auth)
    }

}

module.exports = JWTService