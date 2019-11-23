const Comment = require('../models/comments');
const Question = require('../models/questions')
class CommentsCtl {
    async find(ctx) {
        const {per_page = 10} = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1 ;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q)
        const { questionId, answerId} = ctx.params;
        const { rootCommentId } = ctx.query;
        ctx.body = await Comment.find({content: q, questionId, answerId, rootCommentId }).populate('commentor replayTo')
        .limit(perPage).skip(perPage * page);
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('') ;
        console.log(selectFields);
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentor');
        ctx.body = comment
    }
    async checkCommentisExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentor');
        console.log(comment)
        if (!comment) {
            ctx.throw(404, '评论不存在');
        }
        // 只有在删改查答案的时候才检查此逻辑，赞和踩答案时候不检查
        if (ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId) { 
            ctx.throw(404, '该问题下没有此评论');
        }
        if (ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId) { 
            ctx.throw(404, '该问题下没有此评论');
        }
        ctx.state.comment = comment;
        await next();
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true},
            rootCommentId: { type: 'string', required: false},
            replayTo: { type: 'string', required: false},
        });
        const commentor = ctx.state.user._id;
        const { questionId, answerId } = ctx.params;
        const comment = await Comment({...ctx.request.body, commentor , questionId, answerId}).save();
        const question = await Question.findById(questionId);
        question.comments.push(comment._id);
        question.save();
        ctx.body = comment;
    }
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false},
        });
        const {content} = ctx.request.body;
         await ctx.state.comment.updateOne({content});
        ctx.body = ctx.state.comment;
    }

    async checkCommentor(ctx, next) {
        const {comment} = ctx.state;
        if(comment.commentor.toString() !== ctx.state.user._id) { ctx.throw(403, "没有权限")}
        await next()
    }

    async delete(ctx) {
        await Comment.findByIdAndRemove(ctx.params.id) ;
        ctx.status = 204; 
    }
}

module.exports = new CommentsCtl();