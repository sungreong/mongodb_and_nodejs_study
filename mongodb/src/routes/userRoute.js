const { Router } = require("express");
const userRouter = Router()
const { User } = require("./../models/User");
const mongoose = require('mongoose')
userRouter.get("", async (req, res) => {
    try {
        const users = await User.find({});
        return res.send({ users: users })
    }
    catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
})

// : 를 사용하면 변수로 받을 수 잇음
userRouter.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ err: "invalid userId" })
        const user = await User.findOne({ _id: userId });
        return res.send({ user });

    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
})
userRouter.post("", async (req, res) => {
    try {
        // descturected(한 버전)
        let { username, name } = req.body;
        // descturected(안한 버전)
        // let username = req.body.username;
        // let name = req.body.name;
        if (!username) return res.status(400).send({ err: "username is required" })
        if (!name || !name.first || !name.last) return res.status(400).send({ err: "Both first and last names are required" })
        // document 생성
        const user = new User(req.body);
        // save를 호출하면 promise에서 document를 돌려줌 
        await user.save();
        return res.send({ user })
    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }

})
userRouter.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ err: "invalid userId" })
        const user = await User.findOneAndDelete({ _id: userId })
        return res.send({ user })
    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
})
// update
userRouter.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ err: "invalid userId" })
        const { age, name } = req.body;
        if (!age && !name) return res.status(400).send({ err: 'age or name is required' })
        // if (!age) return res.status(400).send({ err: "age is required" })
        // if (age && typeof age !== 'number') return res.status(400).send({ err: "age must be a number" })
        // if (name && typeof name.first !== 'string' && typeof name.last !== 'string') return res.status(400).send({ err: "first and last name are strings" })
        // findByIdAndUpdate user id를 이용해서 바로 얻을 수 있음 (간결하게 할 수 있음)
        // const user = await User.findByIdAndUpdate(userId)
        // const user = await User.findByIdAndUpdate(userId, { $set: { age } }, { new: true })
        // let updateBody = {};
        // if (age) updateBody.age = age
        // if (name) updateBody.name = name
        // const user = await User.findByIdAndUpdate(userId, updateBody, { new: true })
        let user = await User.findById(userId)
        if(age) user.age = age;
        if(name) user.name = name;
        await user.save()
        return res.send({ user })
    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
}
)
// user router를 외부 노출
module.exports = {
    userRouter
}