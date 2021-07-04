const checkGrofers = require('./grofers');
const checkJioMart = require('./jiomart');

module.exports = async function filter(userInput) {
    const grofersRes = await checkGrofers(userInput);
    const jioMartRes = await checkJioMart(userInput);
    return { grofersRes, jioMartRes };
}