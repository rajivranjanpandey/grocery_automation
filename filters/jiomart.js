const puppeteer = require('puppeteer');

const main = async (userInput) => {
    try {
        const browser = await puppeteer.launch();
        const context = browser.defaultBrowserContext();
        context.overridePermissions('https://jiomart.com', ['geolocation']);

        const page = await browser.newPage();
        await page.evaluateOnNewDocument(function () {
            navigator.geolocation.getCurrentPosition = function (cb) {
                setTimeout(() => {
                    cb({
                        'coords': {
                            accuracy: 21,
                            altitude: null,
                            altitudeAccuracy: null,
                            heading: null,
                            latitude: 22.572645,
                            longitude: 88.363892,
                            speed: null
                        }
                    })
                }, 1000)
            }
        });

        // set webpage dimensions.
        await page.setViewport({
            height: 1024,
            width: 1024
        });

        // initiate page load.
        page.once('load', () => console.log('Jiomart loaded'));
        await page.goto('https://jiomart.com');
        await page.waitForSelector('.jio_delivery_popup');
        await page.$eval('.jio_delivery_popup', el => el.style.display = 'block');
        await page.$eval('#rel_pincode', el => el.value = '700019');
        await Promise.all([page.waitForNavigation(), page.$eval('.apply_btn', el => el.click())]);

        const itemsArr = [userInput];
        const obj = {};
        for (item of itemsArr) {
            const specArr = await productFetch(item, page);
            obj[item] = specArr;
        }
        return obj;


    } catch (e) {
        console.log(e);
    }
}
async function productFetch(productName, page) {
    try {
        await page.waitForSelector('#search');
        await page.focus('#search');
        await page.keyboard.type(productName, { delay: 100 });
        await Promise.all([page.waitForNavigation(), page.keyboard.press('Enter')]);

        // get product list
        await page.waitForSelector('.cat-item');
        const arr = await page.$$eval('.cat-item', elArr => {
            return elArr.map(x => {
                const parentHref = x.getElementsByClassName('category_name')[0].href;
                const productId = parentHref.substr(parentHref.lastIndexOf('/') + 1);
                const priceArr = [...x.getElementsByClassName('price-box')[0].children].map(x => x.innerText);
                const obj = {
                    name: x.getElementsByClassName('clsgetname')[0].innerText,
                    image: x.getElementsByClassName('product-image-photo')[0].src,
                    mrp: priceArr[1],
                    sp: priceArr[0],
                    parentHref,
                    productId
                }
                return obj;
            })
        });
        return arr;
    } catch (e) {
        return []
    }
}
module.exports = main;
