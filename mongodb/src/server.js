const express = require("express");
const app = express();
const mongoose = require('mongoose')
// shell에서 user.update find와 비슷한 개념이라고 보면 된다고 함.

// const { userRouter } = require("./routes/userRoute")
// const { blogRouter } = require("./routes/blogRoute")
// const { commentRouter } = require("./routes/commentRoute")
// index.js를 설정하면 다음과 같이 간소화 할 수 잇음. (routes/index.js)
const { userRouter, blogRouter, commentRouter } = require("./routes")


var db_config = require("./../db-config.json")
let MONGO_URL = `mongodb+srv://${db_config.id}:${db_config.pw}@cluster0.rcubev9.mongodb.net/BlogService?retryWrites=true&w=majority`
const server = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        mongoose.set("debug", true)
        console.log("MongoDB connected")
        app.use(express.json())
        // endpoint 가 user로 시작하면 저기로 연결해라
        app.use("/user", userRouter)
        app.use("/blog", blogRouter)
        // app.use("/blog/:blogId/comment", commentRouter)
        // blog 하위에 있으니 blog 하위에 추가해줘도 됨.

        // : 를 사용하면 변수로 받을 수 잇음
        app.get('/index', async (req, res) => {
            try {
                console.log({ __dirname })
                return res.sendFile(__dirname + '/html/index.html')
            } catch (err) {
                console.log({ err })
                return res.status(500).send({ err: err.message })
            }
        })
        app.listen(3000, () => console.log("server listening on port 3000"))
    } catch (err) {
        console.log(err)
    }
}

server();

