import { createServer } from 'node:http';

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

const server = createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');

  let result = '';
  let { name1, name2 } = getQueryParams(request.url);

  if (name1 && name2) {
    let score = getScore(name1, name2);
    result = `<p>${name1} und ${name2}.
    Es ist genau ${score}% Liebe.
    ${getStatement(score)}</p><hr>`;
    history.push({ name1, name2, score });
  }

  response.end(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
    </head>

    <h1>Liebesorakel</h1>

    ${result}

    <form>
      <p>Gib den Namen von dir und deinem Schwarm ein.</p>
      <input name="name1" placeholder="Du" value="${name1 || ''}" />
      <input name="name2" placeholder="Schatzi" value="${name2 || ''}" />
      <button type="submit">Frag die Sterne 💖 *</button>
    </form>

    <h2>Historie</h2>
    <ul>
      ${history.map(
      ({ name1, name2, score }) =>
        `<li>${name1} und ${name2}: ${score}% Liebe</li>`)
      .join('')}
    </ul>

      <small>* Keine Garantie auf Richtigkeit. 14,99 € pro Anfrage.</small>
    </html>
  `);
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Orakel ist wach');
});
