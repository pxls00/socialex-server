// dotenv
require('dotenv').config()

// app config
const config = require('./lib/config')

// express
const express = require('express')

// cors 
const cors = require('cors')
const corsOptions = require("./middleware/cors");

// mongoose
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

// cookie-parser
const cookieParser = require('cookie-parser')

// routers
const authRouter = require('./routers/auth')
const userRouter = require('./routers/users')
const userSettings = require('./routers/settings')
const userFollow = require('./routers/follow')
const userSavedPosts = require('./routers/save-posts')
const postsRouter = require('./routers/posts')
const postLike = require('./routers/post-like')
const postComment = require('./routers/post-comment')
const commentReply = require('./routers/comment-reply')

const app = express()
app.use(express.json())
    .use(cors({
        origin: '*' 
    }))
    .use(cookieParser())
    .use('/api/auth', authRouter)
    .use('/api/users', userRouter)
    .use('/api/settings', userSettings)
    .use('/api/follow', userFollow)
    .use('/api/posts', postsRouter)
    .use('/api/posts/like', postLike)
    .use('/api/posts/comment', postComment)
    .use('/api/saved-posts', userSavedPosts)
    .use('/api/reply-comment', commentReply)

// start express server and mongoose database
try {
    mongoose.connect(config.mongoUri).then(() => {console.log('MongoDb has been connected')})
    app.listen(config.port, () => {
        console.log(`Server has been started on port:${config.port}`)
    })
} catch (e) {
    console.error(e)
}
