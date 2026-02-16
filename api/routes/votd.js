import { required, optional } from "../common.js";

export default function votdApiRoute(app, db) {
  const baseEndpoint = "/api/votd";

  app.get(baseEndpoint + "/check", async function (req, res) {
    const tenantId = required(req.query, "tenantId", res);
    const messageId = required(req.query, "messageId", res);
    const userId = required(req.query, "userId", res);

    try {
      // Perform a SELECT query to check if the record exists
      const [rows] = await db.query(
        `SELECT 1 FROM votd WHERE tenantId = ? AND messageId = ? AND userId = ? LIMIT 1`,
        [tenantId, messageId, userId]
      );

      // If any row is returned, that means the record exists
      const exists = rows.length > 0;

      // Return a boolean indicating if the record exists
      res.send({
        success: true,
        exists: exists,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `Error checking VOTD entry: ${error}`,
      });
    }
  });

  // Add votd endpoint
  app.post(baseEndpoint + "/add", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const messageId = required(req.body, "messageId", res);
    const userId = required(req.body, "userId", res);

    try {
      await db.query(
        `INSERT INTO votd (tenantId, messageId, userId) VALUES (?, ?, ?)`,
        [tenantId, messageId, userId]
      );

      res.send({
        success: true,
        content: `VOTD entry created for tenant ${tenantId} with message ID ${messageId}`,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `Error creating devotion entry: ${error}`,
      });
    }
  });
}