const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');

const newLines = lines.slice(0, 244).concat([
  "// ════════════════════════════════════════",
  "//  BOOKSTORE ROUTES",
  "// ════════════════════════════════════════",
  "const bookstoreRoutes = require('./bookstore_routes');",
  "app.use('/api/bookstore', bookstoreRoutes);",
  ""
]).concat(lines.slice(445));

fs.writeFileSync('index.js', newLines.join('\n'));
console.log('Fixed index.js route substitution');
