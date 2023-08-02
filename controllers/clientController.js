import { generateClientID } from "../routes/common";
import db from "./databaseController";

export async function doesClientExist(guildId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT guildId FROM clients WHERE guildId=?;`, [guildId], function (error, results, fields) {
            if (error) {
                reject(error);
            }

            if (results.length === 0) {
                resolve(false);
            } else {
                let guildId = results[0].guildId;
                if (guildId == null) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
}

export async function createClient(guildId, res) {
    const clientId = generateClientID();

    try {
        db.query(`INSERT INTO clients (clientKey, guildId) VALUES(?, ?);`, [clientId, guildId], function (error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }

            return res.send({
                success: true,
                message: `New client ${clientId} has been created.`
            });
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}