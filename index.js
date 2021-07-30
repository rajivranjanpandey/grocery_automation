const fastify = require('fastify');
const fastifyFormBody = require('fastify-formbody');
const path = require('path');
const fs = require('fs');
const searchFilter = require('./filters');
const utilityFns = require('./misc/utility-fns');
const filePath = 'cart.json'

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
    return reply
        .code(200)
        .render('search-result.pug', { searchRes });
});
app.post('/add', async (request, reply) => {
    const addReq = JSON.parse(request.body);
    try {
        let writeObj;
        fs.access(filePath, async (err) => {
            try {
                const toAddObj = utilityFns.getFormattedText(addReq.item);
                if (err) {
                    writeObj = { [addReq.platform]: { [addReq.item.productId]: toAddObj } };
                    console.log(writeObj)
                } else {
                    let fileDt = await fs.promises.readFile('cart.json');
                    try {
                        fileDt = JSON.parse(fileDt);
                    } catch (e) {
                        fileDt = {};
                    }
                    const platformDt = fileDt[addReq.platform];
                    if (platformDt) {
                        if (!platformDt[addReq.item.productId])
                            platformDt[addReq.item.productId] = toAddObj;
                        writeObj = fileDt;
                    } else {
                        fileDt[addReq.platform] = { [addReq.item.productId]: toAddObj };
                        writeObj = fileDt;
                    }
                }
                if (writeObj) {
                    const writeRes = await fs.promises.writeFile(filePath, JSON.stringify(writeObj));
                }
                return reply.code(200).send({ 'res': 'product added' })
            } catch (e) {
                return reply.code(500).send(e);
            }
        });
        // console.log(JSON.stringify(res));
        // if (fs.existsSync(filePath)) {
        //     const fileDt = await fs.readFile('cart.json');
        //     console.log(JSON.parse(fileDt));
        // } else {
        //     
        // }

    } catch (e) {
        return reply
            .code(500)
            .send(e);
    }
})


app.listen(3000, (err, address) => {
    console.log(err, address)
})