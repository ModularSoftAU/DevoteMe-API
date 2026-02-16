import fetch from 'node-fetch';
import * as cheerio from "cheerio";
import moment from "moment";
import xml2js from 'xml2js';
import { removeHtmlEntities } from '../app.js';

export default function applicationSiteRoutes(app) {
    app.get('/', async function (req, res) {
        return res.send(`DevoteMe-API\nConnection for all of the DevoteMe suite applications.\nDeveloped by Modular Software\nDocumentation: https://modularsoft.org/docs/products/devoteMe/`);
    });

    app.get('/devotion/get', async function (req, res) {
        try {
            const response = await fetch('https://www.intouchaustralia.org/read/daily-devotions', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                }
            });

            if (!response.ok) {
                return res.status(502).send({
                    error: `Failed to fetch devotion from source (HTTP ${response.status})`
                });
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            const devotionTitle = $('h1').first().text().trim();
            const date = moment(new Date()).format('Do MMMM YYYY');
            const devotionContent = $('article.js-scripturize .wysiwyg').find('p');

            const contentArray = devotionContent.map((i, el) => $(el).text().trim()).get();

            if (contentArray.length === 0) {
                return res.status(502).send({
                    error: 'Unable to parse devotion content from source — the page structure may have changed'
                });
            }

            const devotionReading = contentArray.splice(0, 1)[0];
            const bibleInOneYear = contentArray.splice(-1, 1)[0];

            const devotion = {
                title: devotionTitle,
                date: date,
                reading: devotionReading,
                content: contentArray,
                bibleInOneYear: bibleInOneYear ? bibleInOneYear.replace(/^Bible in One Year:\s+/i, '') : null,
                credit: "From In Touch Australia (https://www.intouchaustralia.org/read/daily-devotions)"
            };

            return res.send(devotion);

        } catch (error) {
            console.log(error);
            return res.status(500).send({
                error: 'An unexpected error occurred while fetching the devotion'
            });
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