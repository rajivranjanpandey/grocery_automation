function getFormattedText(product) {
    return `${product.name}${product.quantity || ''} at ${product.sp},check at ${product.parentHref}`;
}
module.exports = { getFormattedText }