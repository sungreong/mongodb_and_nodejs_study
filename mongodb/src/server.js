const express = require("express");
const app = express();
const mongoose = require('mongoose')
// shell에서 user.update find와 비슷한 개념이라고 보면 된다고 함.
const { userRouter } = require("./routes/userRoute")

const MONGO_URL = 'mongodb+srv://admin:admin1!1@cluster0.rcubev9.mongodb.net/BlogService?retryWrites=true&w=majority'

const server = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        mongoose.set("debug", true)
        console.log("MongoDB connected")
        app.use(express.json())
        // endpoint 가 user로 시작하면 저기로 연결해라
        app.use("/user", userRouter)

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

