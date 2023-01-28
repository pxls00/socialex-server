module.exports = {
    port: process.env.SERVER_PORT || 8000,
    mongoUri: process.env.MONGO_URI,
    secret: process.env.SECRET || 'SECRET_KEY'
}