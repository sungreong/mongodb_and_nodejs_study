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
        const comment = new Comment({ content, user, userFullName: `${user.name.first} ${user.name.last}`, blog }); // .limit(5)

        // 개선
        await Promise.all([
            comment.save(),
            // DB에 일부 과부하를 주긴 함.
            // 100% 이것만 하라는 것은 아님. 
            // 1, 2번 쓸 때 10번,20번 읽기 작업이 필요할 수 있음.
            Blog.updateOne({ _id: blogId }, { $push: { comments: comment } })
        ])
        // await comment.save()
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

commentRouter.patch("/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (typeof content != 'string') return res.status(400).send({ err: "content is required" })
    // const comment = await Comment.findOneAndUpdate({ _id: commentId }, { content }, { new: true })
    // // mongodb 문법
    // // Blog 안에 있는 것 조회
    // // 
    // await Blog.findOneAndUpdate(
    //     { 'comments._id': commentId },
    //     { "comments.$.content": content })

    const [comment] = await Promise.all([
        Comment.findOneAndUpdate({ _id: commentId }, { content }, { new: true }),
        Blog.updateOne(
            // 많이 사용하는 문법
            // 복잡한 문서를 쉽게 업데이트하고 삭제가 가능함.
            { 'comments._id': commentId },
            { "comments.$.content": content }
        )

    ])
    return res.send({ comment })
})

commentRouter.delete("/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findOneAndDelete({ _id: commentId })
    // pull : 배열에서 빼는 행위
    await Blog.updateOne({ "comments._id": commentId }, { $pull: { comments: { _id: commentId } } })
    // await Blog.updateOne({"comments._id" : commentId}, {$pull : {comment : {content : "hellow"}}})
    // and 조건으로 뺴고 싶은 경우 
    // await Blog.updateOne({ "comments._id": commentId }, { $pull: { comment: { $elemMatch: { content: "hellow", state: true } } } })
    return res.send({ comment })

})

module.exports = { commentRouter };