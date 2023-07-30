export default function applicationAPIRoutes(app) {
    app.get('/', async function (req, res) {
        return res.send(`DevoteMe-API\nConnection for all of the DevoteMe suite applications.\nDeveloped by Modular Software\nDocumentation: https://modularsoft.org/docs/products/devoteMe/`);
    });
}