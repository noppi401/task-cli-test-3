const cli = require('./lib/cli');

cli.main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
