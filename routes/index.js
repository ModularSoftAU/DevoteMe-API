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

        const sources = [
            {
                name: 'intouch.org',
                url: 'https://www.intouch.org/read/daily-devotions',
                credit: "From In Touch Ministries (https://www.intouch.org/read/daily-devotions)"
            },
            {
                name: 'biblegateway.com',
                url: 'https://www.biblegateway.com/devotions/in-touch/today',
                credit: "From In Touch Ministries via Bible Gateway (https://www.biblegateway.com/devotions/in-touch/today)"
            }
        ];

        let lastError = null;

        for (const source of sources) {
            try {
                console.log(`[devotion/get] Fetching from ${source.name}...`);
                const response = await fetch(source.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    timeout: 10000
                });

                console.log(`[devotion/get] [${source.name}] Response status: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    console.log(`[devotion/get] [${source.name}] Failed to fetch (HTTP ${response.status})`);
                    continue;
                }

                const html = await response.text();
                const $ = cheerio.load(html);

                let devotionTitle = $('h1').first().text().trim();
                if (!devotionTitle) {
                    devotionTitle = $('meta[property="og:title"]').attr('content') || '';
                }

                if (!devotionTitle || devotionTitle.toLowerCase().includes('daily devotions')) {
                     // Try to find title in other places if generic
                     const altTitle = $('.title-4xl').first().text().trim() || $('.devotion-title').first().text().trim();
                     if (altTitle) devotionTitle = altTitle;
                }

                let devotionContent = $('article.js-scripturize .wysiwyg').find('p');
                if (devotionContent.length === 0) devotionContent = $('.wysiwyg p');
                if (devotionContent.length === 0) devotionContent = $('article p');
                if (devotionContent.length === 0) devotionContent = $('.content p');
                if (devotionContent.length === 0) devotionContent = $('.devotion-content p');
                if (devotionContent.length === 0) devotionContent = $('.devotion-body p');

                const contentArray = devotionContent.map((i, el) => removeHtmlEntities($(el).text().trim())).get()
                    .filter(text => text.length > 0);

                if (contentArray.length === 0) {
                    console.log(`[devotion/get] [${source.name}] Unable to parse content`);
                    continue;
                }

                const devotionReading = contentArray.shift();

                let bibleInOneYear = null;
                if (contentArray.length > 0) {
                    const lastItem = contentArray[contentArray.length - 1];
                    if (lastItem.toLowerCase().includes('bible in one year')) {
                        bibleInOneYear = contentArray.pop();
                    }
                }

                const devotion = {
                    title: devotionTitle,
                    date: moment().format('Do MMMM YYYY'),
                    reading: devotionReading,
                    content: contentArray.join('\n\n'),
                    paragraphs: contentArray,
                    bibleInOneYear: bibleInOneYear ? bibleInOneYear.replace(/^Bible in One Year:\s+/i, '') : null,
                    credit: source.credit
                };

                console.log(`[devotion/get] Success from ${source.name} — returning devotion: "${devotionTitle}"`);
                devotionCache.set(today, devotion);
                return res.send(devotion);

            } catch (error) {
                console.log(`[devotion/get] [${source.name}] Caught exception:`, error.message);
                lastError = error;
            }
        }

        if (lastError) {
            console.log(`[devotion/get] Final error after trying all sources:`, lastError);
            return res.status(502).send({
                error: 'Unable to fetch devotion from any source — the page structure may have changed or the sites are blocking requests'
            });
        }

        return res.status(502).send({
            error: 'Unable to parse devotion content from any source'
        });
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