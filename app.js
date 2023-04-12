import fastify from 'fastify';
import config from "./config.json" assert {type: "json"};
import packageData from './package.json' assert {type: "json"};
import dotenv from 'dotenv';
dotenv.config()

// Site Routes
import siteRoutes from './routes'

//
// Application Boot
//
const buildApp = async () => {

    const app = fastify({ logger: config.debug });

    try {
        app.register((instance, options, next) => {
            // Routes
            siteRoutes(instance);
            next();
        });

        const port = process.env.PORT;

        app.listen({ port: port }, (err) => {
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
    return str.replace(/&ldquo;|&rdquo;/g, '');
}