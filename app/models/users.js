const mongoose = require('mongoose');

const {Schema, model} = mongoose;

const userSchema = new Schema({
    __v: {type: Number, select: false},
    name: { type: String, required: true},
    password: {type: String, required: true, select: false}, // select 隐藏这个字段不显示
    avatar_url: {type: String}, // 头像
    gender: { type: String, enum: ['male','female'], default: 'male', required: true}, // 性别
    headline: { type: String }, // 一句话介绍
    locations: { type: [{type: Schema.Types.ObjectId, ref: 'Topic'}] , select: false}, // 居住地
    business: { type: [{type: Schema.Types.ObjectId, ref: 'Topic'}] , select: false}, // 行业
    employments: { 
        type: [{
            company: {type: [{type: Schema.Types.ObjectId, ref: 'Topic'}]},
            job: {type: [{type: Schema.Types.ObjectId, ref: 'Topic'}]}
        }],
        select: false
     },
     educations: {
         type: [{
             school: { type: [{type: Schema.Types.ObjectId, ref: 'Topic'}] },
             major: { type: [{type: Schema.Types.ObjectId, ref: 'Topic'}] },
             diploma: { type: Number, enum: [1, 2, 3, 4, 5]},
             entrance_year: { type: Number }, // 入学年份
             graduation_year: { type: Number }, // 毕业年份
         }],
         select: false
     },
     following: {
         type: [{type: Schema.Types.ObjectId, ref: 'User'}],
         select: false
     },
     followingTopics: {
        type: [{type: Schema.Types.ObjectId, ref: 'Topic'}],
        select: false
     },
     likingAnswer: {
        type: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
        select: false
     },
     dislikingAnswer: {
        type: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
        select: false
     },
     collectingAnswers: {
        type: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
        select: false
     }

}, {timestamps: true});

module.exports = model('User', userSchema);