/** Source: https://dev.to/yutakusuno/react-passing-environment-variables-to-service-workers-5egj */
const dotenv = require("dotenv");
dotenv.config();
const fs = require("node:fs");

const { NEXT_PUBLIC_FIREBASE_APP_CONFIG } = process.env;

const content = `export default {
    NEXT_PUBLIC_FIREBASE_APP_CONFIG: ${NEXT_PUBLIC_FIREBASE_APP_CONFIG}
}`;

fs.writeFileSync("./public/swEnv.js", content);
