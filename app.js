import fastify from 'fastify';
import packageData from './package.json' assert {type: "json"};
import dotenv from 'dotenv';
dotenv.config()

// API Routes
import apiRoutes from './routes/index'
import devoteAPIRoutes from './routes/devotionRoutes'
import votdAPIRoutes from './routes/votdRoutes'

//
// Application Boot
//
const buildApp = async () => {

    const app = fastify({ logger: process.env.DEBUG });

    try {
        app.register((instance, options, next) => {
            // Routes
            apiRoutes(instance);
            devoteAPIRoutes(instance);
            votdAPIRoutes(instance);
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