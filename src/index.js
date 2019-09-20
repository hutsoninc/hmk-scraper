const Promise = require('bluebird');
const Bottleneck = require('bottleneck');
const scrapeBaseData = require('./scrape-base-data');
const fetchProductData = require('./fetch-product-data');

const limiter = new Bottleneck({
    maxConcurrent: 2,
    minTime: 1000 / 9,
});

const defaultOptions = {
    baseUrl:
        'https://www.johndeerestore.com/jdb2cstorefront/JohnDeereStore/en/p/',
    Promise,
    encodeEntities: false,
};

const isDefined = val => {
    return typeof val !== 'undefined' && val !== null;
};

/**
 *
 * @param {Array} skus Product SKUs to fetch
 * @param {Object} options Options
 */

const main = async (skus, options = {}) => {
    // If first argument is an object, use as options
    if (skus && typeof skus === 'object' && !Array.isArray(skus)) {
        options = Object.assign(defaultOptions, skus);
    } else {
        options = Object.assign(defaultOptions, options);
    }

    // Append / to baseUrl
    if (options.baseUrl.charAt(options.baseUrl.length - 1) !== '/') {
        options.baseUrl = options.baseUrl + '/';
    }

    // Fetch all skus and base data
    const baseData = await scrapeBaseData(skus, options);

    // Fetch data
    const promises = baseData.map(async product => {
        return limiter.schedule(
            async () => await fetchProductData(product, options)
        );
    });

    const data = await Promise.all(promises);

    return data.filter(val => isDefined(val));
};

module.exports = main;
