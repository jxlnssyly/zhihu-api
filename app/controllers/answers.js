const Answer = require('../models/answers');
const Question = require('../models/questions')
class AnswersCtl {
    async find(ctx) {
        const {per_page = 10} = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1 ;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q)
        ctx.body = await Answer.find({content: q, questionId: ctx.params.questionId }).populate('answerer topics')
        .limit(perPage).skip(perPage * page);
    }

    async findById(ctx) {
        const { fields } = ctx.query;
        const selectFields = fields ?  fields.split(';').filter(f => f).map(f => ' +' + f).join('') : '';
        console.log(selectFields);
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer');
        ctx.body = answer
    }
    async checkAnswerisExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer');
        console.log(answer)
        if (!answer) {
            ctx.throw(404, '答案不存在');
        }
        // 只有在删改查答案的时候才检查此逻辑，赞和踩答案时候不检查
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) { 
            ctx.throw(404, '该问题下没有此答案');
        }
        ctx.state.answer = answer;
        await next();
    }

    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true},
        });
        const answerer = ctx.state.user._id;
        const { questionId} = ctx.params;
        const answer = await Answer({...ctx.request.body, answerer , questionId}).save();
        const question = await Question.findById(questionId);
        question.answers.push(answer._id);
        question.save();
        ctx.body = answer;
    }
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false},
        });
         await ctx.state.answer.updateOne(ctx.request.body);
        ctx.body = ctx.state.answer;
    }

    async checkAnswerer(ctx, next) {
        const {answer} = ctx.state;
        if(answer.answerer.toString() !== ctx.state.user._id) { ctx.throw(403, "没有权限")}
        await next()
    }

    async delete(ctx) {
        await Answer.findByIdAndRemove(ctx.params.id) ;
        ctx.status = 204; 
    }
}

module.exports = new AnswersCtl();