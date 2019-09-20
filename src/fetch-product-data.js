const { JSDOM } = require('jsdom');
const fetch = require('fetch-retry');

const imageBaseUrl = 'https://www.johndeerestore.com'

const fetchProductData = async (product, { baseUrl }) => {
    const url = `${baseUrl}${product.sku}`;

    try {
        const html = await fetch(url, {
            method: 'GET',
        }).then(res => {
            return res.text();
        });

        const dom = new JSDOM(html);
        const window = dom.window;
        const { document } = window;

        const priceStr = document.querySelector('.price').textContent;

        const price = Number(priceStr.replace(/[^\d\.]/g, ''));

        const imageSrc = document
            .querySelector('img.lazyOwl')
            .getAttribute('data-src');

        const image = `${imageBaseUrl}${imageSrc}`

        const description = document.querySelector('.productDescriptionText')
            .innerHTML;

        return {
            description,
            image,
            price,
            ...product,
        };
    } catch (err) {
        // console.log(err);
        console.log(`Could not fetch data for ${product.sku} (${url})`);
    }
};

module.exports = fetchProductData;
