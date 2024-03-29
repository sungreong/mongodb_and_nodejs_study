const { Schema, model, Types } = require("mongoose");
const { CommentSchema } = require("./Comment");
const BlogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    islive: { type: Boolean, required: true, default: false },
    // user collection 이름으로 맵핑해줌.
    // user: { type: Types.ObjectId, required: true, ref: 'user' },
    user: {
        _id: { type: Types.ObjectId, required: true, ref: 'user', index: true },
        username: { type: String, required: true },
        name: {
            first: { type: String, required: true },
            last: { type: String, required: true },
        },
    },
    commentsCount: { type: Number, default: 0, required: true, },
    comments: [CommentSchema],

},
    { timestamps: true }
);

// index를 추가하고 싶은 경우 (복합키 포함) 
// BlogSchema.index({ 'user._id': 1, updatedAt: 1 }, { unique: true }) key 중복
// BlogSchema.index({ updatedAt: 1 })
// BlogSchema.index({ updatedAt: 1 })
// text index collection 당 1개씩 만들고 싶을 때
// BlogSchema.index({ title: "text" })
BlogSchema.index({ title: "text", content: "text" })


// 가상 데이터 쓰는 경우에만 해당함.
// BlogSchema.virtual("comments", {
//     ref: "comment",
//     localField: "_id",
//     foreignField: "blog",
// })
// BlogSchema.set("toObject", { virtuals: true })
// BlogSchema.set("toJSON", { virtuals: true })
const Blog = model('blog', BlogSchema)


module.exports = { Blog };