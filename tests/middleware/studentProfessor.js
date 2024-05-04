const jwt = require('jsonwebtoken')
const { client } = require('../db/RedisClient')
const AppError = require('../utils/AppError')
const { JWT_ERROR } = require('../utils/ErrorNames')

const studentProfessor = async (req, res, next) => {
    try {
        const { token } = req.headers
        const { JWT_SECRET } = process.env

        if (token) {

            const { _id } = jwt.verify(token, JWT_SECRET)

            const studentCacheToken = await client.get(`StudentToken:${_id}`)

            if (studentCacheToken === null) {

                const professorCacheToken = await client.get(`ProfessorToken:${_id}`)

                if (professorCacheToken === token) {

                    req.professorId = _id
                    next()

                } else {

                    throw new AppError(JWT_ERROR, 'Permission Denied try logging again', 403)

                }

            } else {

                if (studentCacheToken === token) {

                    req.studentId = _id
                    next()

                } else {

                    throw new AppError(JWT_ERROR, 'Permission Denied try logging again', 403)

                }

            }

        } else {

            throw new AppError(JWT_ERROR, `Unauthorized`, 401)

        }

    } catch (error) {

        next(error)

    }
}

module.exports = studentProfessor