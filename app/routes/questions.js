const jwt = require('koa-jwt');
const Router = require('koa-router');
const {secret} = require('../config');
const router = new Router({prefix: '/questions'});
const {
    find, create, findById, update, 
    checkQuestionisExist,
    delete: del,
    checkQuestioner
} = require('../controllers/questions');

const auth = jwt({secret})

router.get('/', find);
router.post('/',auth, create);
router.get('/:id', findById);
router.patch('/:id', auth, checkQuestionisExist, update);
router.delete('/:id', auth, checkQuestionisExist, checkQuestioner, del);

module.exports = router;