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
            console.log('[devotion/get] Fetching from intouch.org...');
            const response = await fetch('https://www.intouch.org/read/daily-devotions', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });

            console.log(`[devotion/get] Response status: ${response.status} ${response.statusText}`);
            console.log(`[devotion/get] Response headers:`, Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const body = await response.text();
                console.log(`[devotion/get] Error response body (first 500 chars): ${body.substring(0, 500)}`);
                return res.status(502).send({
                    error: `Failed to fetch devotion from source (HTTP ${response.status})`
                });
            }

            const html = await response.text();
            console.log(`[devotion/get] HTML length: ${html.length} chars`);
            console.log(`[devotion/get] HTML snippet (first 500 chars): ${html.substring(0, 500)}`);

            const $ = cheerio.load(html);

            let devotionTitle = $('h1').first().text().trim();
            if (!devotionTitle) {
                devotionTitle = $('meta[property="og:title"]').attr('content') || '';
                console.log(`[devotion/get] Title not found in h1, tried og:title: "${devotionTitle}"`);
            }
            console.log(`[devotion/get] Devotion title: "${devotionTitle}"`);

            const date = moment(new Date()).format('Do MMMM YYYY');

            // Log available selectors for debugging
            const articleCount = $('article').length;
            const jsScripturizeCount = $('article.js-scripturize').length;
            const wysiwygCount = $('article.js-scripturize .wysiwyg').length;
            console.log(`[devotion/get] Selector matches — article: ${articleCount}, article.js-scripturize: ${jsScripturizeCount}, .wysiwyg: ${wysiwygCount}`);

            let devotionContent = $('article.js-scripturize .wysiwyg').find('p');

            if (devotionContent.length === 0) {
                console.log(`[devotion/get] Primary selector failed, trying alternatives...`);
                devotionContent = $('.wysiwyg p');
            }

            if (devotionContent.length === 0) {
                devotionContent = $('article p');
            }

            if (devotionContent.length === 0) {
                devotionContent = $('.content p');
            }

            console.log(`[devotion/get] Found ${devotionContent.length} paragraph elements`);

            const contentArray = devotionContent.map((i, el) => removeHtmlEntities($(el).text().trim())).get();
            console.log(`[devotion/get] Content array (${contentArray.length} items):`, JSON.stringify(contentArray.map(s => s.substring(0, 80))));

            if (contentArray.length === 0) {
                // Log more details for debugging
                const allArticles = $('article').map((i, el) => $(el).attr('class')).get();
                console.log(`[devotion/get] All article classes:`, allArticles);
                const allH1 = $('h1').map((i, el) => $(el).text().trim()).get();
                console.log(`[devotion/get] All h1 elements:`, allH1);
                console.log(`[devotion/get] HTML structure summary:`, html.substring(0, 1000));

                return res.status(502).send({
                    error: 'Unable to parse devotion content from source — the page structure may have changed'
                });
            }

            const devotionReading = contentArray.shift(); // Use shift instead of splice for clarity

            let bibleInOneYear = null;
            if (contentArray.length > 0) {
                const lastItem = contentArray[contentArray.length - 1];
                if (lastItem.toLowerCase().includes('bible in one year')) {
                    bibleInOneYear = contentArray.pop();
                    console.log(`[devotion/get] Extracted Bible in One Year: "${bibleInOneYear}"`);
                } else {
                    console.log(`[devotion/get] Last item does not seem to be Bible in One Year: "${lastItem.substring(0, 50)}..."`);
                }
            }

            console.log(`[devotion/get] Reading: "${devotionReading}"`);

            const devotion = {
                title: devotionTitle,
                date: date,
                reading: devotionReading,
                content: contentArray.join('\n\n'),
                paragraphs: contentArray,
                bibleInOneYear: bibleInOneYear ? bibleInOneYear.replace(/^Bible in One Year:\s+/i, '') : null,
                credit: "From In Touch Ministries (https://www.intouch.org/read/daily-devotions)"
            };

            console.log(`[devotion/get] Success — returning devotion: "${devotionTitle}"`);
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