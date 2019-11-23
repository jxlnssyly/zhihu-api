const Koa = require('koa');
const app = new Koa();
const error = require('koa-json-error'); // 处理错误中间件
const koabody = require('koa-body'); // 获取请求body中间件
const koaStatic = require('koa-static')
const parameter = require('koa-parameter'); // 参数校验中间件
const mongoose = require('mongoose'); // MongoDB中间件
const path = require('path')
const routing = require('./routes');
const {connectionStr} = require('./config');

mongoose.connect(connectionStr, { useUnifiedTopology: true, useNewUrlParser: true }, () => console.log('MongoDB 连接成功'))
mongoose.connection.on('error', console.error);
mongoose.set('useFindAndModify', false)
app.use(koaStatic(path.join(__dirname, 'public')));
app.use(error({
    postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest: {stack, ...rest}
}));
app.use(koabody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true,
    }
})); // 需要写在routing前面
app.use(parameter(app));

routing(app);
app.listen(3000, () => console.log('程序启动在 3000 端口了'));