import { createClient, doesClientExist } from "../controllers/clientController";
import { required } from "./common";

export default function clientAPIRoutes(app) {
    app.post('/client/create', async function (req, res) {
        const guildId = required(req.body, "guildId", res);

        let clientExist = await doesClientExist(guildId)
        if (clientExist) {
            return res.send({
                success: false,
                message: `Client already exists, using existing configuration`
            });
        } else {
            return createClient(guildId, res);          
        }
    });
}