const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<script src="app.js?v=8"></script>', '<script>\n' + js + '\n</script>');
fs.writeFileSync('index.html', html);
console.log('Injected app.js into index.html');
