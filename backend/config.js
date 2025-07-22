require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || "changeme_in_production";

module.exports = JWT_SECRET;