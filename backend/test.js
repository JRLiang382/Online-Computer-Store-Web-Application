const selfsigned = require('selfsigned');
const fs = require('fs');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const options = { days: 365 }; // 证书有效期
const pems = selfsigned.generate(attrs, options);

fs.writeFileSync('server.key', pems.private);
fs.writeFileSync('server.cert', pems.cert);
console.log('Certificate and key generated successfully!');
