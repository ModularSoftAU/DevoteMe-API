import fastify from 'fastify';
import packageData from './package.json' assert {type: "json"};
import dotenv from 'dotenv';
dotenv.config()

// Site Routes
import siteRoutes from './routes'

//
// Application Boot
//
const buildApp = async () => {

    const app = fastify({ logger: process.env.DEBUG });

    try {
        app.register((instance, options, next) => {
            // Routes
            siteRoutes(instance);
            next();
        });

        const port = process.env.PORT;

        app.listen({ port: port, host: '0.0.0.0' }, (err) => {
            if (err) {
                app.log.error(err);
                process.exit(1);
            }
        })

        console.log(`\n// ${packageData.name} v.${packageData.version}\nGitHub Repository: ${packageData.homepage}\nCreated By: ${packageData.author}`);
        console.log(`API is listening to the port ${process.env.PORT}`);
    } catch (error) {
        app.log.error(`Unable to start the server:\n${error}`);
    }
};

buildApp();

export function removeHtmlEntities(str) {
    return str.replace(/&ldquo;|&rdquo;|&#8212;|&#8217;|&#8220;|&#8221;|&#8216;|&#8211;|&#8230;|&#8243;|&#8246;/g, '');
}