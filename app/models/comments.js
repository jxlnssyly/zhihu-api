const mongoose = require('mongoose');

const {Schema, model} = mongoose;

const commentSchema = new Schema({
    __v: {type: Number, select: false},
    content: { type: String, required: true},
    commentor: { type: Schema.Types.ObjectId, ref: 'User', select: false},
    questionId: { type: String, required: true},
    answerId: { type: String},
    replyTo:  { type: Schema.Types.ObjectId, ref: 'User'},
    
}, {timestamps: true});

module.exports = model('Comment', commentSchema);