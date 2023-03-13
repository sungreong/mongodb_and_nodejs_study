const {Schema, model,Types} = require("mongoose")
const BlogSchema = new Schema({
    title : {type : String, required : true},
    content : {type : String, required : true},
    islive : {type : Boolean, required : true ,default:false},
    // user collection 이름으로 맵핑해줌.
    user : {type : Types.ObjectId, required : true,ref:'user'},    
}, {timestamps : true});

const Blog = model('blog', BlogSchema)

module.exports = {Blog};