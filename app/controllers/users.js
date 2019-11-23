const User = require('../models/users');
const Question = require('../models/questions');
const Answer = require('../models/answers');
const jsonwebtoken = require('jsonwebtoken');
const {secret} = require('../config');

class UsersCtl {

    async find(ctx) { // 查
        const {per_page = 10} = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1 ;
        const perPage = Math.max(per_page * 1, 1);
        ctx.body = await User.find({name: new RegExp(ctx.query.q)}).limit(perPage).skip(page * perPage);
    }

    async findById(ctx) {// 查
        const { fields } = ctx.query;
        const selectFields = fields ? fields.split(';').filter(f => f).map(f => ' +' + f).join('') : '';
        const populaterStr = fields.split(';').filter(f => {
            if (f === 'employments') {
                return 'employments.company employments.job'
            } else if (f === 'educations') {
                return 'educations.school educations.major';
            }
            return f;
        } ).join(' ');
        const user = await User.findById(ctx.params.id).select(selectFields).populate(populaterStr);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = await User.findById(ctx.params.id);
    }

    async create(ctx) { // 增
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        });
        const {name} = ctx.request.body;
        const repeatedUser = await User.findOne({name});
        if (repeatedUser) {
            ctx.throw(409, '用户已存在');
        }
        const user = await new User(ctx.request.body).save();
        
        ctx.body = await User.findById(user._id);
    }
    
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {ctx.throw(403, '没有权限');}
        await next();
    }
    
    async update(ctx) { // 修改
        ctx.verifyParams({
            name: {type: 'string', required: false},
            password: {type: 'string', required: false},
            avatar_url: { type: 'string', require: false},
            gender: {type: 'string', required: false},
            headline: {type: 'string', required: false},
            locations: {type: 'array', itemType: 'string', required: false},
            business: { type: 'string', required: false},
            employments: { type: 'array', itemType: 'object', required: false},
            educations: { type: 'array', itemType: 'object', required: false},
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user;
    }

    async delete(ctx) { // 删
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.status = 204;
    }

    async login(ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        });

        const user = await User.findOne(ctx.request.body);
        if (!user) {
            ctx.throw(401, '用户名或密码不正确');
        }
        const {_id, name} = user;
        const token = jsonwebtoken.sign({_id, name}, secret, {expiresIn: '1d'});
        ctx.body = {token};

    }

    async listFollowing(ctx) { // 获取关注
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.following;
    }

    async checkUserExist(ctx) { // 检查用户存在
        try {
            const user = await User.findById(ctx.params.id);
            console.log(user)
            if (!user) {
                ctx.throw(404, '用户不存在');
            }
            await next();

        } catch (e) {
            ctx.throw(404, '用户不存在');

        }
        
    }

    async follow(ctx) { // 添加关注
        const me = await User.findById(ctx.state.user._id).select('+following');
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }
    async unfollow(ctx) { // 取消关注
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { // 索引 > -1 说明关注过
            me.following.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async listFollowingTopics(ctx) { // 获取话题
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
        if (!user) {
            ctx.throw(404, '话题不存在');
        }
        ctx.body = user.followingTopics;
    } 

    async followTopic(ctx) { // 关注话题
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        console.log(me);
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }
    async unfollowTopic(ctx) { // 取消关注
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { // 索引 > -1 说明关注过
            me.followingTopics.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }
    async listQuestions(ctx) {
        const questions = await Question.find({questioner: ctx.params.id});
        ctx.body = questions;
    }

    async listLikingAnswers(ctx) { // 赞
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.likingAnswers;
    } 

    async likeAnswer(ctx, next) { // 关注话题
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        console.log(me);
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: 1}});
        }
        ctx.status = 204;
        await next()
    }
    async unlikeAnswer(ctx) { // 取消关注
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { // 索引 > -1 说明关注过
            me.likingAnswers.splice(index, 1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: -1}});
        }
        ctx.status = 204;
    }

    async listDislikingAnswers(ctx) { // 赞
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.dislikingAnswers;
    } 

    async dislikeAnswer(ctx, next) { // 关注话题
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        console.log(me);
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
        await next();
    }
    async undislikeAnswer(ctx) { // 取消关注
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { // 索引 > -1 说明关注过
            me.dislikingAnswers.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async listCollectingAnswers(ctx) { // 赞
        const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.collectingAnswers;
    } 

    async collectAnswer(ctx, next) { // 关注话题
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
        console.log(me);
        if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.collectingAnswers.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
        await next();
    }
    async uncollectAnswer(ctx) { // 取消关注
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { // 索引 > -1 说明关注过
            me.collectingAnswers.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }
}

module.exports = new UsersCtl();