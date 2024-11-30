import { createServer } from 'node:http';
import { generatePassword } from './pwgen.mjs';

const getCharValue = (string = '') =>
  string.split('').reduce((sum, c) => sum + c.charCodeAt(), 0);

function getScore (stringA, stringB) {
  const scores = [getCharValue(stringA), getCharValue(stringB)].sort();
  return scores[0] > 0 && scores[1] > 0
    ? ((scores[0] / scores[1]) * 100).toFixed()
    : 0;
}

function getStatement(score) {
  switch (true) {
    case score > 90:
      return 'Ihr seid ein Traumpaar.';
    case score > 70:
      return 'Einen Versuch ist es wert.';
    case score > 50:
      return 'Naja…';
    case score > 30:
      return 'Wird wohl nichts.';
    default:
      return 'Lasst es lieber!';
  }
}

function getQueryParams(url) {
  const params = {};
  new URLSearchParams(url.split('?')[1]).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

let history = [];

function requestHandler(request, response) {
  response.statusCode = 200;

  const { name1, name2 } = getQueryParams(request.url);

  const score = getScore(name1, name2);
  const statement = getStatement(score);

  history.push({ name1, name2, score });

  response.setHeader('Content-Type', 'text/html');
  response.end(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
    </head>
    <main style="margin: 5rem; text-align:center; font-family: cursive; color: #de33a5">
      <h1>Liebesorakel 💖</h1>

      <h1>Euer Ergebnis: ${score}</h1>
      <h2>${statement}</h2>

      <form action="/" method="GET">
        <input type="text" name="name1" placeholder="Du">
        <input type="text" name="name2" placeholder="Schatzi">
        <button>Frag das Orakel</button>
      </form>

      <h2>History</h2>
      <ul style="text-align: left">
        ${history.map(({ name1, name2, score }) => `
          <li>${name1} und ${name2}: ${score}%</li>
        `).join('')}
      </ul>
    </main>
    `);
};


const server = createServer(requestHandler);

server.listen(3000, '127.0.0.1', () => {
  console.log('Server started');
});
