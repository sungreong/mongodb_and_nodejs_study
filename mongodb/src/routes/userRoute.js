const { Router } = require("express");
const userRouter = Router()

const mongoose = require('mongoose')
// const { User } = require("./../models/User");
const { User, Blog, Comment } = require("./../models");
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
        // const user = await User.findOneAndDelete({ _id: userId })
        // await Blog.deleteMany({ "user._id": userId })
        // await Blog.updateMany({ "comments.user": userId }, { $pull: { comments: { user: userId } } })
        // await Comment.deleteMany({ "user": userId })
        const [user] = await Promise.all([
            // 병렬로 가능함.
            User.findOneAndDelete({ _id: userId }),
            Blog.deleteMany({ "user._id": userId }),
            Blog.updateMany({ "comments.user": userId }, { $pull: { comments: { user: userId } } }),
            Comment.deleteMany({ "user": userId })

        ])
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
        if (age) user.age = age;
        console.log({ name }, req.body)
        if (name) {

            user.name = name;
            // 하나의 유저가 여러 블로그 수정 가능 
            // 
            // await Blog.updateMany({ "user._id": userId }, { "user.name": name })
            // 한명이 여러 후기 작성할 수 있으니 복잡함.
            // comment에 여러개가 있을텐데 그것만 수정해야 함.
            // arrayFilter 
            // await Blog.updateMany(
            //     {},
            //     // { "comment.$[comment].users.$[user].name": `$(name.first) $(name.last)` },
            //     { "comments.$[comment].userFullName": `${name.first} ${name.last}` },
            //     { arrayFilters: [{ "comment.user": userId }] })
            await Promise.all([
                Blog.updateMany({ "user._id": userId }, { "user.name": name }),
                // 한명이 여러 후기 작성할 수 있으니 복잡함.
                // comment에 여러개가 있을텐데 그것만 수정해야 함.
                // arrayFilter 
                Blog.updateMany(
                    {},
                    // { "comment.$[comment].users.$[user].name": `$(name.first) $(name.last)` },
                    { "comments.$[comment].userFullName": `${name.first} ${name.last}` },
                    { arrayFilters: [{ "comment.user": userId }] })
            ])

        }
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