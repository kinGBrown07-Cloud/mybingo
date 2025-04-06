"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
const pg_1 = require("pg");
const url_1 = require("url");
const connectionString = process.env.DATABASE_URL;
const { host, port, auth, pathname } = (0, url_1.parse)(connectionString);
const poolConfig = {
    user: auth === null || auth === void 0 ? void 0 : auth.split(':')[0],
    password: auth === null || auth === void 0 ? void 0 : auth.split(':')[1],
    host: host === null || host === void 0 ? void 0 : host.split('.')[0],
    port: parseInt(port || '5432'),
    database: pathname === null || pathname === void 0 ? void 0 : pathname.split('/')[1],
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
exports.pool = new pg_1.Pool(poolConfig);
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
async function query(text, params) {
    const client = await exports.pool.connect();
    try {
        return await client.query(text, params);
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=neon.js.map