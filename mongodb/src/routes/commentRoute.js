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
const { isValidObjectId, startSession } = require("mongoose");
const { Blog } = require("./../models/Blog");
const { User } = require("./../models/User");
commentRouter.post("/", async (req, res) => {
    const session = await startSession();
    let comment
    try {
        // await session.withTransaction(async () => {
        const { blogId } = req.params;
        const { content, userId } = req.body;
        if (!isValidObjectId(blogId)) return res.status(400).send({ err: "blogId is invalid" })
        if (!isValidObjectId(userId)) return res.status(400).send({ err: "userId is invalid" })
        if (typeof content !== 'string') return res.status(400).send({ err: "content is required" })
        // const blog = await Blog.findById(blogId);
        // const user = await User.findById(userId);
        // promise를 통해 비동기 처리하면 훨씬 효과적임
        const [blog, user] = await Promise.all([
            // find에다 concurrency를 방지하기 위해 session을 추가해야 함.
            Blog.findById(blogId, {}, {}),
            User.findById(userId, {}, {}),
        ])
        if (!blog || !user) return res.status(400).send({ err: "blog or user does not exist" })
        if (!blog.islive) return res.status(400).send({ err: "blog is not available" })
        comment = new Comment({ content, user, userFullName: `${user.name.first} ${user.name.last}`, blog: blogId }); // .limit(5)

        // await session.abortTransaction() // transaction 발생하는 데이터 수정은 다 원복이 됨.
        // 개선(아래 코드로 개선)
        // await Promise.all([
        //     comment.save(),
        //     // DB에 일부 과부하를 주긴 함.
        //     // 100% 이것만 하라는 것은 아님. 
        //     // 1, 2번 쓸 때 10번,20번 읽기 작업이 필요할 수 있음.
        //     Blog.updateOne({ _id: blogId }, { $push: { comments: comment } })
        // ])
        // 자식 문서가 아니라 가공 문서를 내장하는 방식
        // blog.commentsCount++;
        // // blog안에 comments를 넣었는데 또 comment를 넣고 무한 루프 발생
        // blog.comments.push(comment);
        // if (blog.commentsCount > 3) blog.comments.shift();
        // // shift : a.shift 
        // await Promise.all([
        //     comment.save({}),
        //     // 아래는 필요 없음 이미 session을 통해서 불러오기 때문에
        //     blog.save()
        //     // Blog.updateOne({ _id: blogId }, { $inc: { commentsCount: 1 } })
        // ])
        // );
        // 개선 버전 2 
        // -3 : 제일 최근에 push된 3개만 살리고 다 뺴라 (우리가 원하는 구조)
        // +3 : 제일 오래전에 push된 3개만 살리고 다 뺴라
        await Promise.all([
            comment.save(),
            Blog.updateOne({ _id: blogId },
                // 내부 transaction 사이에서는 atomicity를 따라서 transaction을 굳이 사용하지 않아도 된다는 장점.
                // 내장을 잘하는 것이 중요함.
                {
                    $inc: { commentsCount: 1 },
                    $push: { comments: { $each: [comment], $slice: -3 } }
                }),])
        return res.send({ comment })
    } catch (err) {
        return res.status(400).send({ err: err.message })
    } finally {
        // await session.endSession();
    }

})

commentRouter.get('/', async (req, res) => {
    try {

        const { blogId } = req.params;
        let { page = 0 } = req.query
        page = parseInt(page);

        if (!isValidObjectId(blogId)) return res.status(400).send({ err: "blogId is invalid" })
        // pagination 작업 (indexling 필요)
        const comments = await Comment.find({ blog: blogId }).sort({ createdAt: -1 }).skip(page * 3).limit(3)
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