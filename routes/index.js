import fetch from 'node-fetch';
import * as cheerio from "cheerio";
import moment from "moment";
import xml2js from 'xml2js';
import { removeHtmlEntities } from '../app.js';

const devotionCache = new Map();

export default function applicationSiteRoutes(app) {
    app.get('/', async function (req, res) {
        return res.send(`DevoteMe-API\nConnection for all of the DevoteMe suite applications.\nDeveloped by Modular Software\nDocumentation: https://modularsoft.org/docs/products/devoteMe/`);
    });

    app.get('/devotion/get', async function (req, res) {
        const today = moment().format('YYYY-MM-DD');
        if (devotionCache.has(today)) {
            return res.send(devotionCache.get(today));
        }

        // Clear cache to avoid memory leaks with old dates
        devotionCache.clear();

        try {
            const response = await fetch('https://vision.org.au/read/bible-study/the-word-for-today/', {
                headers: {
                    'User-Agent': 'facebookexternalhit/1.1'
                }
            });

            if (!response.ok) {
                return res.status(502).send({
                    error: `Failed to fetch devotion from source (HTTP ${response.status})`
                });
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            const devotionTitle = $('h1.entry-title').first().text().trim().replace(/\s+/g, ' ');
            const devotionReading = $('h2.dmach-acf-value').first().text().trim().replace(/\s+/g, ' ');

            const devotionContent = $('.dmach-acf-value').filter((i, el) => {
                return $(el).find('p').length > 1;
            }).first().find('p');

            const contentArray = devotionContent.map((i, el) => $(el).text().trim()).get().filter(text => text.length > 0);

            if (contentArray.length === 0) {
                return res.status(502).send({
                    error: 'Unable to parse devotion content from source — the page structure may have changed'
                });
            }

            const bibleInOneYearElement = $('.dmach-acf-value').filter((i, el) => {
                return $(el).text().includes("SoulFood");
            }).first();
            const bibleInOneYear = bibleInOneYearElement.length > 0 ? bibleInOneYearElement.text().trim().replace(/^SoulFood:\s+/i, '').replace(/\s+/g, ' ') : null;

            const devotion = {
                title: devotionTitle,
                reading: devotionReading,
                content: contentArray,
                bibleInOneYear: bibleInOneYear,
                credit: "From Vision Christian Media (https://vision.org.au/read/bible-study/the-word-for-today/)"
            };

            devotionCache.set(today, devotion);

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
                    const votd = {
                        reference: result.feed.entry[0].title[0],
                        referenceLink: result.feed.entry[0].link[0].$.href,
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
