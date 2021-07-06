const puppeteer = require('puppeteer');

const main = async (userInput) => {
    try {

        // browser instance with override the geolocation permission.
        const browser = await puppeteer.launch();
        const context = browser.defaultBrowserContext();
        context.overridePermissions('https://grofers.com', ['geolocation']);

        // create a new page.
        const page = await browser.newPage();

        // for websites which require your current location, u need to set your geo location for whole browser so that detect current location works.
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
        page.once('load', () => console.log('Grofers loaded'));
        await page.goto('https://grofers.com');
        // wait for location box popup to apperar => click on 'detect my location' .
        await page.waitForSelector('.location-box');
        await Promise.all([page.click('.location-box')]);

        const itemsArr = [userInput];
        const obj = {};
        for (item of itemsArr) {
            const specArr = await productFetch(item, page);
            obj[item] = specArr;
        }
        return obj;

        // we can also use $$ to get array of element handle and then run $eval on each element handle to fetch relative info (puppeter way)
        // const x = await page.$$('.plp-product');
        // const promiseArr = [];
        // x.forEach((elH) => {
        //     promiseArr.push(elH.$eval('.plp-product__name > .plp-product__name--box', el => el.innerText))
        // });
        // const res = await Promise.all(promiseArr);
        // console.log({ res });


        // await browser.close();
    } catch (e) {
        console.log(e);
    }
}
async function productFetch(productName, page) {
    try {
        console.log({ productName });
        // wait for search box to appear => focus on box => type => press enter => wait for navigation
        await page.waitForSelector('.search__box>input');

        await page.focus('.search__box>input');
        // clear previous input.
        await page.keyboard.down('ShiftLeft');
        await page.keyboard.press('Home');
        await page.keyboard.press('Backspace');
        // await page.$eval('.search__box>input', el => el.value = productName);
        await page.keyboard.type(productName, { delay: 100 });
        await Promise.all([page.waitForNavigation(), page.keyboard.press('Enter')]);

        // wait for the products to plot.
        await page.waitForSelector('.plp-product');
        // once products are plotted evaluate each product and fetch relative info.
        const x = await page.$$eval('.plp-product', elArr => {
            return elArr.map(x => {
                const priceArr = x.getElementsByClassName('relative')[0].innerText.split('\n');
                const obj = {
                    name: x.getElementsByClassName('plp-product__name')[0].innerText,
                    image: x.getElementsByClassName('plp-product__img')[0].getElementsByTagName('img')[0].currentSrc,
                    mrp: priceArr[1],
                    sp: priceArr[0],
                    quantity: x.getElementsByClassName('plp-product__quantity')[0].innerText
                };
                return obj;
            })
        });
        // console.log(x);
        return x;
    } catch (e) {
        return [];
    }
}
module.exports = main;