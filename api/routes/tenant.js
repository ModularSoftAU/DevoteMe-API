import { required, optional } from "../common.js";

export default function tenantApiRoute(app, db) {
  const baseEndpoint = "/api/tenant";

  // Function to fetch tenants
  async function getTenants(dbQuery) {
    const [results, fields] = await db.query(dbQuery);
    return results;
  }

  // Get tenant(s) endpoint
  app.get(baseEndpoint + "/get", async function (req, res) {
    const tenantId = optional(req.query, "id");

    try {
      // Get Tenant by specific ID
      if (tenantId) {
        let dbQuery = `SELECT * FROM tenants WHERE tenantId=${tenantId};`;
        const results = await getTenants(dbQuery);
        if (!results.length) {
          return res.send({
            success: false,
            message: `There are no tenants`,
          });
        }

        res.send({
          success: true,
          data: results,
        });
        return;
      }

      // Show all Tenants
      let dbQuery = `SELECT * FROM tenants;`;
      const results = await getTenants(dbQuery);
      if (!results.length) {
        return res.send({
          success: false,
          message: `There are no tenants`,
        });
      }

      res.send({
        success: true,
        data: results,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `${error}`,
      });
    }
  });

  // Get tenant configuration by ID endpoint
  app.get(baseEndpoint + "/configuration/get", async function (req, res) {
    const tenantId = required(req.query, "id", res);

    try {
      // Get Tenant Configuration by specific ID
      const dbQuery = `SELECT * FROM tenantConfiguration WHERE tenantId = ?`;
      const results = await db.query(dbQuery, [tenantId]);

      if (!results.length) {
        return res.send({
          success: false,
          message: `No configuration found for tenantId ${tenantId}`,
        });
      }

      res.send({
        success: true,
        data: results[0],
      });
    } catch (error) {
      res.send({
        success: false,
        message: `Error: ${error.message}`,
      });
    }
  });

  // Create tenant endpoint
  app.post(baseEndpoint + "/create", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const tenantName = required(req.body, "tenantName", res);

    console.log(
      `Received request to create tenant. Tenant ID: ${tenantId}, Tenant Name: ${tenantName}`
    );

    try {
      // Insert into tenants table
      console.log(`Inserting into tenants table: ${tenantId}, ${tenantName}`);
      await db.query(
        `INSERT INTO tenants (tenantId, tenantName) VALUES (?, ?)`,
        [tenantId, tenantName]
      );

      // Insert into tenantConfiguration table with the tenantId
      console.log(
        `Inserting into tenantConfiguration table for tenantId: ${tenantId}`
      );
      await db.query(`INSERT INTO tenantConfiguration (tenantId) VALUES (?)`, [
        tenantId,
      ]);

      console.log(
        `Successfully created tenant: ${tenantName} (ID: ${tenantId})`
      );

      res.send({
        success: true,
        content: `New Tenant Created: ${tenantName}`,
      });
    } catch (error) {
      console.error(
        `Error occurred while creating tenant: ${tenantName} (ID: ${tenantId})`,
        error
      );

      res.send({
        success: false,
        message: `${error.message}`,
      });
    }
  });

  // Update tenant endpoint
  app.post(baseEndpoint + "/update", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const votdChannel = optional(req.body, "votd_channel", res);
    const devotionChannel = optional(req.body, "devotion_channel", res);

    try {
      // Determine the field and value to update
      let fieldToUpdate = "";
      let valueToUpdate = null;

      if (votdChannel) {
        fieldToUpdate = "votd_channel";
        valueToUpdate = votdChannel;
      } else if (devotionChannel) {
        fieldToUpdate = "devotion_channel";
        valueToUpdate = devotionChannel;
      }

      if (fieldToUpdate) {
        // Check if the tenant's configuration already exists in tenantConfiguration
        const existingConfig = await db.query(
          `SELECT id FROM tenantConfiguration WHERE tenantId = ?`,
          [tenantId]
        );

        if (existingConfig.length > 0) {
          // If configuration exists, update the field
          await db.query(
            `
          UPDATE tenantConfiguration
          SET ${fieldToUpdate} = ?
          WHERE tenantId = ?;
          `,
            [valueToUpdate, tenantId]
          );
        } else {
          // If configuration doesn't exist, insert new values
          await db.query(
            `
          INSERT INTO tenantConfiguration (tenantId, ${fieldToUpdate})
          VALUES (?, ?);
          `,
            [tenantId, valueToUpdate]
          );
        }

        return res.send({
          success: true,
          message: `Tenant configuration updated`,
        });
      } else {
        return res.send({
          success: false,
          message: "No valid field provided to update.",
        });
      }
    } catch (error) {
      console.log(error);

      res.send({
        success: false,
        message: `Error: ${error.message}`,
      });
    }
  });
}