const scrape = require('../');
const fs = require('fs');
const path = require('path');

const main = async () => {
    const data = await scrape();

    fs.writeFileSync(
        path.join(__dirname, '../data/out.json'),
        JSON.stringify(data)
    );
};

main();
