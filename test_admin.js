const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM, VirtualConsole } = jsdom;
const virtualConsole = new VirtualConsole();
virtualConsole.on('error', (err) => { console.error('JSDOM ERROR:', err); });
virtualConsole.on('jsdomError', (err) => { console.error('JSDOM SCRIPT ERROR:', err); });
virtualConsole.on('log', (msg, ...args) => { console.log('JSDOM LOG:', msg, ...args); });

let syncJs = fs.readFileSync('sync.js', 'utf8');
syncJs = syncJs.replace('console.error(e);', 'console.error("SYNC ERROR:", e);');
fs.writeFileSync('sync_test.js', syncJs);

let html = fs.readFileSync('admin.html', 'utf8');
html = html.replace('sync.js?v=6', 'sync_test.js');
const fileUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole, url: fileUrl });
setTimeout(() => { process.exit(0); }, 3000);
