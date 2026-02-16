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
            console.log(`[devotion/get] Returning cached devotion for ${today}`);
            return res.send(devotionCache.get(today));
        }

        try {
            const url = 'https://www.intouch.org/read/daily-devotions';
            console.log('[devotion/get] Fetching from intouch.org...');
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                timeout: 15000
            });

            console.log(`[devotion/get] Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const body = await response.text();
                console.log(`[devotion/get] Error response body snippet: ${body.substring(0, 200)}`);
                return res.status(502).send({
                    error: `Failed to fetch devotion from source (HTTP ${response.status})`
                });
            }

            const html = await response.text();
            if (html.includes('Incapsula_Resource') && html.length < 1000) {
                console.log('[devotion/get] Blocked by Incapsula challenge page');
                return res.status(502).send({
                    error: 'Access denied by source security filter (WAF)'
                });
            }

            const $ = cheerio.load(html);

            let devotionTitle = $('h1').first().text().trim();
            if (!devotionTitle || devotionTitle.toLowerCase().includes('daily devotions')) {
                devotionTitle = $('.title-4xl').first().text().trim() ||
                               $('meta[property="og:title"]').attr('content') ||
                               'Daily Devotion';
            }
            console.log(`[devotion/get] Devotion title: "${devotionTitle}"`);

            let devotionContent = $('article.js-scripturize .wysiwyg').find('p');
            if (devotionContent.length === 0) devotionContent = $('.wysiwyg p');
            if (devotionContent.length === 0) devotionContent = $('article p');
            if (devotionContent.length === 0) devotionContent = $('.content p');

            console.log(`[devotion/get] Found ${devotionContent.length} paragraph elements`);

            const contentArray = devotionContent.map((i, el) => removeHtmlEntities($(el).text().trim())).get()
                .filter(text => text.length > 0);

            if (contentArray.length === 0) {
                console.log(`[devotion/get] Unable to parse content. HTML snippet: ${html.substring(0, 500)}`);
                return res.status(502).send({
                    error: 'Unable to parse devotion content from source'
                });
            }

            const devotionReading = contentArray.shift();

            let bibleInOneYear = null;
            if (contentArray.length > 0) {
                const lastItem = contentArray[contentArray.length - 1];
                if (lastItem.toLowerCase().includes('bible in one year')) {
                    bibleInOneYear = contentArray.pop();
                    console.log(`[devotion/get] Extracted Bible in One Year: "${bibleInOneYear}"`);
                }
            }

            const devotion = {
                title: devotionTitle,
                date: moment().format('Do MMMM YYYY'),
                reading: devotionReading,
                content: contentArray.join('\n\n'),
                paragraphs: contentArray,
                bibleInOneYear: bibleInOneYear ? bibleInOneYear.replace(/^Bible in One Year:\s+/i, '') : null,
                credit: "From In Touch Ministries (https://www.intouch.org/read/daily-devotions)"
            };

            console.log(`[devotion/get] Success — returning devotion: "${devotionTitle}"`);
            devotionCache.set(today, devotion);
            return res.send(devotion);

        } catch (error) {
            console.log(`[devotion/get] Caught exception:`, error);
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