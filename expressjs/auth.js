const {db} = require('./db')
const bcrypt = require("bcrypt");

async function isLoggedIn(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const foundUser = await db.User.findOne({
      where: {
        id: authHeader
      }
    });

    req.userId = foundUser.id
    return next()
  }

  return res.status(401).send({message: "no auth header found"})
}

async function login(req, res, next) {
  try {
    const {email, password} = req.body

    const foundUser = await db.User.findOne({
      where: {
        email
      }
    })

    bcrypt.compare(password, foundUser.password, (err, isEqual) => {
      if (err) {
        next(err)
      }

      if (isEqual) {
        return res.status(200).send({
          message: "Authenticated",
          token: foundUser.id
        })
      }

      return res.status(401).send({
        message: "Invalid credentials",
      })
    });
  } catch (e) {
    next(e)
  }
}

module.exports = {
  login,
  isLoggedIn
}