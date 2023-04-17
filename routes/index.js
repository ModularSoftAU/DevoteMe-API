import fetch from 'node-fetch';
import cheerio from 'cheerio';
import moment from "moment";
import xml2js from 'xml2js';
import { removeHtmlEntities } from '../app';

export default function applicationSiteRoutes(app) {

    app.get('/devotion/get', async function (req, res) {
        try {
            const response = await fetch('https://www.intouchaustralia.org/read/daily-devotions');
            const html = await response.text();
            const $ = cheerio.load(html);

            const devotionTitle = $('h1').first().text().trim();
            const date = moment(new Date()).format('Do MMMM YYYY');
            const devotionContent = $('article.js-scripturize').find('p');

            const contentArray = devotionContent.map((i, el) => $(el).text().trim()).get();
            const devotionReading = contentArray.splice(0, 1)[0];
            const bibleInOneYear = contentArray.splice(-1, 1)[0];

            const devotion = {
                title: devotionTitle,
                date: date,
                reading: devotionReading,
                content: contentArray,
                bibleInOneYear: bibleInOneYear.replace(/^Bible in One Year:\s+/i, ''),
                credit: "From In Touch Australia (https://www.intouchaustralia.org/read/daily-devotions)"
            };

            return res.send(devotion);

        } catch (error) {
            console.log(error);
            throw error;
        }
    });

    app.get('/votd/get', async function (req, res) {
        try {
            const response = await fetch('https://www.biblegateway.com/votd/get/?format=atom');
            const xmlResponse = await response.text();

            xml2js.parseString(xmlResponse, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    const date = moment(result.feed.updated[0]).format('Do MMMM YYYY');

                    const votd = {
                        reference: result.feed.entry[0].title[0],
                        referenceLink: result.feed.entry[0].link[0].$.href,
                        date: date,
                        content: removeHtmlEntities(result.feed.entry[0].content[0]._),
                        credit: result.feed.link[1].$.href
                    };

                    return res.send(votd);
                }
            });

        } catch (error) {
            console.log(error);
            throw error;
        }
    });
}