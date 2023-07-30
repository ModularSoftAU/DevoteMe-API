import fetch from 'node-fetch';
import cheerio from 'cheerio';
import moment from "moment";
import xml2js from 'xml2js';
import { removeHtmlEntities } from './common';

export default function votdAPIRoutes(app) {
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