const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
    title: {
        type: String,
        trim: true
    },
    screenshot: {
        type: String
    },
    mdCont: {
        type: String,
        trim: true,
    },
    htmlCont: {
        type: String,
    },
    tags: {
        type: Array
    },
    colors: {
        type: Array
    }
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema);

module.exports = { Post }