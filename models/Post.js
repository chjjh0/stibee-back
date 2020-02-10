const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fs = require('fs');
const path = require('path');


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

postSchema.methods.encodeBase64Img = function(img, cb) {
	try {
		const imgPath = path.join(path.resolve(), `/upload/${img}`)
		// console.log('base64 변환 중', path.join(__dirname, `${img}`));
		const data = fs.readFileSync(imgPath, { encoding: 'base64' })
		cb(data);
	} catch {
		throw new Error('Post encodeBase64Img err')
	}
}

const Post = mongoose.model('Post', postSchema);

module.exports = { Post }