module.exports = {
  target: 'electron-renderer',
  externals: {
    prisma: "require('prisma')",
    sqlite3: 'commonjs sqlite3',
  },
  // Fix: sharp-linux-x64.node:1:0 - Error: Module parse failed: Unexpected character ''
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.node$/, use: 'node-loader' },
    ],
  },
};
