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
    mongoose.connect("mongodb+srv://Abdurahim:abu.2006@cluster0.bphmlsu.mongodb.net/socialex?retryWrites=true&w=majority").then(() => {console.log('MongoDb has been connected')})
    app.listen(80, () => {
        console.log(`Server has been started on port:${80}`)
    })
} catch (e) {
    console.error(e)
}
