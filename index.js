const fastify = require('fastify');
const fastifyFormBody = require('fastify-formbody');
const searchFilter = require('./filters');

const app = fastify({ logger: true });
app.register(require('fastify-pug'), { views: 'views' });
app.register(fastifyFormBody)

app.get('/', (request, reply) => {
    reply.render('home.pug');
});
app.post('/search', async (request, reply) => {
    const searchRes = await searchFilter(request.body.productname);
    reply.send(searchRes);
})
app.listen(3000, (err, address) => {
    console.log(err, address)
})