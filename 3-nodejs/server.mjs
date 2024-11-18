import { createServer } from 'node:http';
import { generatePassword } from './pwgen.mjs';

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  // res.end('Es ist genau ' + new Date().toLocaleTimeString());
  res.end(generatePassword());
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server started');
});
