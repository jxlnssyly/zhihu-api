const jwt = require('koa-jwt');
const Router = require('koa-router');
const {secret} = require('../config');
const router = new Router({prefix: '/topics'});
const {
    find, create, findById, update, 
    checkTopicisExist,
    listTopicFollowers,
    listQuestions
} = require('../controllers/topics');

const auth = jwt({secret})

router.get('/', find);
router.post('/',auth, create);
router.get('/:id', findById);
router.patch('/:id', auth, checkTopicisExist, update);
router.get('/:id/followers', checkTopicisExist,listTopicFollowers);
router.get('/:id/questions', checkTopicisExist,listQuestions);


module.exports = router;