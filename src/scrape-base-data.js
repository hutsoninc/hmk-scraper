const puppeteer = require('puppeteer');

const delay = async (timeout = 1000) => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
};

const url =
    'https://www.deere.com/en/parts-and-service/parts/lawn-mower-parts/home-maintenance-kits/';

const fetchBaseData = async (skus, { Promise }) => {
    if (!Array.isArray(skus)) {
        skus = [];
    }

    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    try {
        await page.goto(url);

        await delay(10000);

        // Wait for page content to load
        // await page.waitForSelector('.selections', { timeout: 0 });

        // Get product data
        const data = await page.evaluate(async () => {
            return new Promise(async resolve => {
                const links = document.querySelectorAll(
                    '.selections a[data-search]'
                );

                const tableData = [];

                for (let i = 0; i < links.length; i++) {
                    links[i].click();

                    await new Promise(resolve => {
                        setTimeout(resolve, 5000);
                    });

                    document.querySelectorAll('table tr').forEach(tr => {
                        const tds = tr.querySelectorAll('td');
                        if (tds.length !== 0) {
                            const sku = tds[0].innerText;
                            const model = tds[1].innerText;
                            const modelDescription = tds[2].innerText;

                            tableData.push({
                                sku,
                                model,
                                modelDescription,
                            });
                        }
                    });
                }

                resolve(tableData);
            });
        });

        const cleanData = data.reduce(
            (acc, { sku, model, modelDescription }) => {
                // Check if sku needs to be filtered out
                const skuMatchIndex = skus.findIndex(
                    obj => obj.sku.toLowerCase() === sku.toLowerCase()
                );
                if (skuMatchIndex !== -1) {
                    return acc;
                }

                // Check if sku has already been added
                const matchIndex = acc.findIndex(obj => obj.sku === sku);

                if (matchIndex !== -1) {
                    acc[matchIndex].models.push({
                        model,
                        modelDescription,
                    });
                } else {
                    acc.push({
                        sku,
                        models: [
                            {
                                model,
                                modelDescription,
                            },
                        ],
                    });
                }

                return acc;
            },
            []
        );

        await browser.close();

        return cleanData;
    } catch (error) {
        console.log(`Error while fetching base data: ${error}`);
        browser.close();
        process.exit(1);
    }
};

module.exports = fetchBaseData;
