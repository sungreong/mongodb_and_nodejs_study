const express = require("express");
const app = express();
const mongoose = require('mongoose')
// shell에서 user.update find와 비슷한 개념이라고 보면 된다고 함.

// const { userRouter } = require("./routes/userRoute")
// const { blogRouter } = require("./routes/blogRoute")
// const { commentRouter } = require("./routes/commentRoute")
// index.js를 설정하면 다음과 같이 간소화 할 수 잇음. (routes/index.js)
const { userRouter, blogRouter, commentRouter } = require("./routes")

// const { generateFakeData } = require("../faker");
const { generateFakeData } = require("../faker2");


// var db_config = require("./../db-config.json")


const server = async () => {
    try {
        const { id, pw, service, port } = process.env;
        let MONGO_URL = `mongodb+srv://${id}:${pw}@cluster0.rcubev9.mongodb.net/${service}?retryWrites=true&w=majority`
        if (!MONGO_URL) throw new Error("MONGO_URL is not defined")
        if (!port) throw new Error("PORT is not defined")
        console.log({ MONGO_URL })
        await mongoose.connect(MONGO_URL);
        // mongoose.set("debug", true)
        console.log("MongoDB connected")
        app.use(express.json())
        // endpoint 가 user로 시작하면 저기로 연결해라
        app.use("/user", userRouter)
        app.use("/blog", blogRouter)
        // app.use("/blog/:blogId/comment", commentRouter)
        // blog 하위에 있으니 blog 하위에 추가해줘도 됨.
        // generateFakeData(100, 10, 300) (faker.js는 여기서)
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
        // listen 이후에 서버가 켜짐
        app.listen(port, async () => {
            // console.time("insert time :")
            // await generateFakeData(10, 3, 20);
            // console.timeEnd("insert time :")
            console.log(`server listening on port ${port}`)
            // 트패릭 부하 상태를 방지하기 위해 loop 사용 
            // 한 iter에는 병령이지만 루피에서는 병령이 아님 
            // for (let i = 0; i < 10; i++) {
            //     await generateFakeData(10, 5, 10);
            // }
        })
    } catch (err) {
        console.log(err)
    }
}

server();

