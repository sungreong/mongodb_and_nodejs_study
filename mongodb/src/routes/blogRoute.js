const { Router } = require("express");
const blogRouter = Router();
// const { Blog } = require("./../models/Blog");
// const { User } = require("./../models/User")
const { Blog, User } = require("./../models");

// model을 가져온다는 뜻
const { isValidObjectId } = require('mongoose')

const mongoose = require('mongoose')
const { commentRouter } = require("./commentRoute");
blogRouter.use("/:blogId/comment", commentRouter)
// blogRouter에 use 를 추가해주면 mergerd parameter를 하지 않아도 잘 된다고 함.

blogRouter.post("/", async (req, res) => {
    try {
        const { title, content, islive, userId } = req.body
        if (typeof title !== 'string') {
            return res.status(400).send({ err: "title is required" })
        }
        if (typeof content !== 'string') {
            return res.status(400).send({ err: "content is required" })
        }
        if (islive && typeof islive !== 'boolean') {
            return res.status(400).send({ err: "islive must be a boolean" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ err: "userId is invalid" })
        }
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).send({ err: "user does not ecist" })
        }
        let blog = new Blog({ ...req.body, user })
        await blog.save();
        return res.send({ blog });
    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
});
// blogRouter.get("/", async (req, res) => {
//     try {
//         // const blogs = await Blog.find({})
//         const blogs = await Blog.find({}).limit(20);
//         return res.send({ blogs });

//     } catch (err) {
//         console.log({ err })
//         return res.status(500).send({ err: err.message })
//     }
// });
blogRouter.get("/", async (req, res) => {
    try {
        // comments는 스키마에 없음.
        // 가상의 키 필요함.
        let { page } = req.query
        page = parseInt(page)
        const blogs = await Blog.find({}).sort({ updatedAt: -1 }).skip(page * 3).limit(3).populate([{ path: "user" }, { path: "comments", populate: { path: "user" } }]);
        // Blog에 user라는 reference를 추가함.
        return res.send({ blogs });

    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
});
blogRouter.get("/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid" })
        }
        const blog = await Blog.findOne({ _id: blogId })
        return res.send({ blog })

    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
});
blogRouter.put("/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid" })
        }
        const { title, content } = req.body;
        if (typeof title !== 'string') {
            return res.status(400).send({ err: "title is required" })
        }
        if (typeof content !== 'string') {
            return res.status(400).send({ err: "content is required" })
        }
        const blog = await Blog.findOneAndUpdate(
            { _id: blogId }, { title, content }, { new: true },)
        return res.send({ blog })
    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
});
// put이란 비슷한 개념 patch는 특정한 부분을 수정할 떄 쓰는 것
blogRouter.patch("/:blogId/live", async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid" })
        }
        const { islive } = req.body;
        if (typeof islive != "boolean") {
            return res.status(400).send({ err: "islive is required" })
        }
        const blog = await Blog.findByIdAndUpdate(blogId, { islive }, { new: true })
        return res.send({ blog })
    } catch (err) {
        console.log({ err })
        return res.status(500).send({ err: err.message })
    }
});



module.exports = { blogRouter }