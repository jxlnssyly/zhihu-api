const Question = require('../models/questions');

class QuestionsCtl {
    async find(ctx) {
        const {per_page = 10} = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1 ;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q)
        ctx.body = await Question.find({$or:[{title: q}, {description: q}] }).populate('questioner topics answers')
        .limit(perPage).skip(perPage * page);
    }

    async findById(ctx) {
        const { fields } = ctx.query;
        const selectFields = fields ?  fields.split(';').filter(f => f).map(f => ' +' + f).join('') : '';
        console.log(selectFields);
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics answers');
        ctx.body = question
    }
    async checkQuestionisExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner');
        console.log(question)
        if (!question) {
            ctx.throw(404, '问题不存在');
        }
        ctx.state.question = question;
        await next();
    }

    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true},
            description: { type: 'string', required: false},
        });
        const question = await Question({...ctx.request.body, questioner: ctx.state.user._id}).save();
        ctx.body = question;
    }
    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: false},
            description: { type: 'string', required: false},
        });
         await ctx.state.question.updateOne(ctx.request.body);
        ctx.body = ctx.state.question;
    }

    async checkQuestioner(ctx, next) {
        const {question} = ctx.state;
        if(question.questioner.toString() !== ctx.state.user._id) { ctx.throw(403, "没有权限")}
        await next()
    }

    async delete(ctx) {
        await Question.findByIdAndRemove(ctx.params.id) ;
        ctx.status = 204; 
    }
}

module.exports = new QuestionsCtl();