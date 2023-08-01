import { generateClientID, required } from "./common";

export default function clientAPIRoutes(app, db) {
    app.post('/client/create', async function (req, res) {
        const guildId = required(req.body, "guildId", res);

        try {
            db.query(`INSERT INTO clients (clientKey, guildId) VALUES(?, ?);`, [generateClientID(), guildId], function (error, results, fields) {
                if (error) {
                    console.log(error);
                    return;
                }

                console.log(results);

                return;
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    });
}