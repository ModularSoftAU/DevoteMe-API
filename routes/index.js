import fetch from 'node-fetch';
import cheerio from 'cheerio';
import moment from "moment";
import stringify from "json-stringify-safe";

export default function applicationSiteRoutes(app) {

    app.get('/devotion/get', async function (req, res) {
        try {
            const response = await fetch('https://www.intouchaustralia.org/read/daily-devotions');
            const html = await response.text();
            const $ = cheerio.load(html);

            const devotionTitle = $('h1').first().text().trim();
            const date = moment(new Date(), 'dddd, MMMM D, YYYY').toDate();
            const devotionContent = $('article.js-scripturize').find('p');

            const contentArray = devotionContent.map((i, el) => $(el).text().trim()).get();
            const bibleInOneYear = contentArray.splice(-1, 1)[0];
            const thinkAboutIt = contentArray.splice(-1, 1)[0];

            const devotion = {
                title: devotionTitle,
                date: date,
                content: contentArray,
                thinkAboutIt: thinkAboutIt.replace(/^•\s+/i, ''),
                bibleInOneYear: bibleInOneYear.replace(/^Bible in One Year:\s+/i, ''),
                credit: "From In Touch Australia (https://www.intouchaustralia.org/read/daily-devotions)"
            };

            return res.send(devotion);

        } catch (error) {
            console.log(error);
            throw error;
        }
    });
}