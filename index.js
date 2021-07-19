const fastify = require('fastify');
const fastifyFormBody = require('fastify-formbody');
const path = require('path');
const searchFilter = require('./filters');

const app = fastify({ logger: true });
app.register(require('fastify-pug'), { views: 'views' });
app.register(fastifyFormBody);
app.register(require('fastify-static'), { root: path.join(__dirname, './', 'assets') });


app.get('/', (request, reply) => {
    reply.render('home.pug');
});

app.get('/assets/index.css', (request, reply) => {
    return reply.sendFile('index.css');
})
app.post('/search', async (request, reply) => {
    const productname = request.body.productname;
    const filterRes = await searchFilter(productname);
    const searchRes = { grofers: filterRes.grofers[productname], jioMart: filterRes.jioMart[productname] };
    console.log(searchRes);
    // console.log(JSON.stringify(searchRes));
    reply
        .code(200)
        .render('search-result.pug', { searchRes });
});
app.post('/add', (request, reply) => {
    const addReq = request.body;
    console.log(addReq);
})


app.listen(3000, (err, address) => {
    console.log(err, address)
})