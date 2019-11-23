const jwt = require('koa-jwt');
const Router = require('koa-router');
const {secret} = require('../config');
const router = new Router({prefix: '/questions/:questionId/answers'});
const {
    find, create, findById, update, 
    checkAnswerisExist,
    delete: del,
    checkAnswerer
} = require('../controllers/answers');

const auth = jwt({secret})

router.get('/', find);
router.post('/',auth, create);
router.get('/:id', findById);
router.patch('/:id', auth, checkAnswerisExist, update);
router.delete('/:id', auth, checkAnswerisExist, checkAnswerer, del);

module.exports = router;