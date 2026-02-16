import devotionApiRoute from "./devotion.js";
import tenantApiRoute from "./tenant.js";
import votdApiRoute from "./votd.js";

export default (app, db) => {
  tenantApiRoute(app, db);
  devotionApiRoute(app, db);
  votdApiRoute(app, db);
};
