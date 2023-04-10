import fastify from 'fastify';
import config from "./config.json" assert {type: "json"};
import packageData from './package.json' assert {type: "json"};

// Site Routes
import siteRoutes from './routes'

//
// Cron Jobs
//
import('./cron/daily.js');

//
// Application Boot
//
const buildApp = async () => {

    const app = fastify({ logger: config.debug });
    const port = process.env.PORT || config.port || 8080;

    try {
        app.register((instance, options, next) => {
            // Routes
            siteRoutes(instance);
            next();
        });

        app.listen({ port: process.env.PORT }, (err) => {
            if (err) {
                app.log.error(err)
                process.exit(1)
            }
        })

        console.log(`\n// ${packageData.name} v.${packageData.version}\nGitHub Repository: ${packageData.homepage}\nCreated By: ${packageData.author}`);
        console.log(`API is listening to the port ${port}`);
    } catch (error) {
        app.log.error(`Unable to start the server:\n${error}`);
    }
};

buildApp();
