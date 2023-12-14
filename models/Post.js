const mongoose = require('mongoose')
const {Schema, model}=mongoose

const PostSchema = new Schema({
    title: String,
    summary: String,
    content: String,
    cover:String,
    author:{type:Schema.ObjectId, ref:'User'},
},{
    timestamps: true, //we have extra 2 colums with updated at and created at
})

const PostModel = model('Post',PostSchema)
module.exports = PostModel