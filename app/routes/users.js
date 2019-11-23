const jwt = require('koa-jwt');
const Router = require('koa-router');
const {secret} = require('../config');
const router = new Router({prefix: '/users'});
const {
    checkTopicisExist
} = require('../controllers/topics');
const {
    find, create, findById, update, 
    delete: del, login, checkOwner,
    listFollowing, follow, unfollow,
    checkUserExist,
    followTopic, unfollowTopic, listFollowingTopics,
    listQuestions,
    listLikingAnswers, likeAnswer, unlikeAnswer,
    listDislikingAnswers, dislikeAnswer, undislikeAnswer,
    listCollectingAnswers, collectAnswer, uncollectAnswer
} = require('../controllers/users');

const { checkAnswerisExist} = require('../controllers/answers');


// const auth = async (ctx, next) => { // JWT 里面把token放在请求头里
//     const {authorization = ''} = ctx.request.header;
//     const token = authorization.replace('Bearer ', '');
//     try {
//         const user = jsonwebtoken.verify(token, secret);
//         ctx.state.user = user;
//     } catch (e) {
//         ctx.throw(401, e.message);
//     }
//     await next();
// }
const auth = jwt({secret})

router.get('/', find);
router.post('/', create);
router.get('/:id', findById);
router.patch('/:id', auth, checkOwner, update);
router.delete('/:id', auth, checkOwner, del);
router.post('/login', login);
router.get('/:id/following', listFollowing);

router.put('/following/:id', auth, checkUserExist, follow);//关注某人
router.delete('/unfollowing/:id', auth, checkUserExist, unfollow);//取消关注某人

router.get('/:id/followingTopics', listFollowingTopics);// 某个人所有关注话题
router.put('/followingTopics/:id', auth, checkTopicisExist, followTopic);//关注某个话题
router.delete('/unfollowingTopics/:id', auth, checkTopicisExist, unfollowTopic);//取消关注某个话题
router.get('/:id/questions', listQuestions);// 某个人所有关注话题

router.get('/:id/likingAnswers', listLikingAnswers);// 列出喜欢的答案
router.put('/likingAnswers/:id', auth, checkAnswerisExist, likeAnswer, undislikeAnswer);//赞答案
router.delete('/likingAnswers/:id', auth, checkAnswerisExist, unlikeAnswer);//取消赞

router.get('/:id/dislikingAnswers', listDislikingAnswers);// 列出喜欢的答案
router.put('/dislikingAnswers/:id', auth, checkAnswerisExist, dislikeAnswer, unlikeAnswer);// 踩答案
router.delete('/dislikingAnswers/:id', auth, checkAnswerisExist, undislikeAnswer);// 取消踩答案

router.get('/:id/collectingAnswers', listCollectingAnswers);// 列出收藏的答案
router.put('/collectingAnswers/:id', auth, checkAnswerisExist, collectAnswer);// 收藏答案
router.delete('/collectingAnswers/:id', auth, checkAnswerisExist, uncollectAnswer);// 取消收藏答案


module.exports = router;