module.exports = {
    target: 'electron-renderer',
    externals: {
        prisma: "require('prisma')",
        sqlite3: "commonjs sqlite3"
    }
};