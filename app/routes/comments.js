const jwt = require('koa-jwt');
const Router = require('koa-router');
const {secret} = require('../config');
const router = new Router({prefix: '/questions/:questionId/answers/:answerId/comments'});
const {
    find, create, findById, update, 
    checkCommentisExist,
    delete: del,
    checkCommentor
} = require('../controllers/comments');

const auth = jwt({secret})

router.get('/', find);
router.post('/',auth, create);
router.get('/:id', findById);
router.patch('/:id', auth, checkCommentisExist, update);
router.delete('/:id', auth, checkCommentisExist, checkCommentor, del);

module.exports = router;