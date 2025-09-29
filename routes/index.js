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
            const response = await fetch('https://www.intouchaustralia.org/read/daily-devotions');
            const html = await response.text();
            const $ = cheerio.load(html);

            const devotionTitle = $('h1.h1').text().trim();
            const dateText = $('span.caption.dark\\:text-gray-dark').text().trim();
            const date = moment(dateText, 'MMMM D, YYYY').format('Do MMMM YYYY');

            const devotionArticle = $('article.js-scripturize');
            const allParagraphs = devotionArticle.find('p');

            const devotionReading = allParagraphs.first().text().trim();

            const bioyParagraph = allParagraphs.filter((i, el) => $(el).text().includes('Bible in One Year:'));
            let bibleInOneYear = '';
            let contentParagraphs;

            if (bioyParagraph.length > 0) {
                bibleInOneYear = bioyParagraph.find('span').text().trim();
                const bioyIndex = allParagraphs.index(bioyParagraph);
                contentParagraphs = allParagraphs.slice(1, bioyIndex);
            } else {
                contentParagraphs = allParagraphs.slice(1);
            }

            const contentArray = contentParagraphs
                .map((i, el) => $(el).text().trim())
                .get();

            const devotion = {
                title: devotionTitle,
                date: date,
                reading: devotionReading,
                content: contentArray,
                bibleInOneYear: bibleInOneYear,
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