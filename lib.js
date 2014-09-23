var crypto = require('crypto')

// md5
md5 = function (input) {
    return crypto.createHash('md5').update(input).digest('hex')
}

// bcrypt
bcrypt = require('bcrypt')

