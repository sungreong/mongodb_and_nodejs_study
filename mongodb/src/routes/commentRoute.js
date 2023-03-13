const { Router } = require("express");
const commentRouter = Router({ mergeParams: true });
//  블로그 아이디를 불러와주기 위해서는 true를 해주거나 blog router에 추가해주거나 하면 됨.
const { Comment } = require("./../models/Comment")

/* 
 /user
 /blog
 /blog/:blogId/comment
    - 특정 blog의 후기를 불러옴
    - 그러기 때문에 하위 개념
*/
const { isValidObjectId } = require("mongoose");
const { Blog } = require("./../models/Blog");
const { User } = require("./../models/User");
commentRouter.post("/", async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content, userId } = req.body;
        if (!isValidObjectId(blogId)) return res.status(400).send({ err: "blogId is invalid" })
        if (!isValidObjectId(userId)) return res.status(400).send({ err: "userId is invalid" })
        if (typeof content !== 'string') return res.status(400).send({ err: "content is required" })
        // const blog = await Blog.findById(blogId);
        // const user = await User.findById(userId);
        // promise를 통해 비동기 처리하면 훨씬 효과적임
        const [blog, user] = await Promise.all([
            Blog.findById(blogId),
            User.findById(userId),
        ])
        if (!blog || !user) return res.status(400).send({ err: "blog or user does not exist" })
        if (!blog.islive) return res.status(400).send({ err: "blog is not available" })
        const comment = new Comment({ content, user, blog });
        await comment.save();
        return res.send({ comment })
    } catch (err) {
        return res.status(400).send({ err: err.message })
    }

})

commentRouter.get('/', async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!isValidObjectId(blogId)) return res.status(400).send({ err: "blogId is invalid" })
        const comments = await Comment.find({ blog: blogId })
        return res.send({ comments });
    }
    catch (err) {
        return res.status(400).send({ err: err.message })
    }
})

module.exports = { commentRouter };