import { randomUUID } from 'node:crypto';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const initDb = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id TEXT NOT NULL,
      text TEXT NOT NULL,
      votes INTEGER DEFAULT 0,
      FOREIGN KEY (poll_id) REFERENCES polls (id)
    )
  `);
};

export async function getPollCount() {
  const result = await db.execute('SELECT COUNT(*) as count FROM polls');
  return result.rows[0].count;
}

export async function createPoll(question, answers) {
  const pollId = randomUUID();

  await db.execute('INSERT INTO polls (id, name) VALUES (?, ?)', [pollId, question]);

  await Promise.all(
    answers.map((answer) =>
      db.execute('INSERT INTO options (poll_id, text) VALUES (?, ?)', [pollId, answer]),
    ),
  );

  return pollId;
}

export async function getPoll(pollId) {
  const { rows: [poll] } = await db.execute('SELECT * FROM polls WHERE id = ?', [pollId]);

  if (!poll) throw new Error('Poll not found');

  const { rows: options } = await db.execute('SELECT * FROM options WHERE poll_id = ?', [pollId]);

  return { poll, options };
}

export async function checkOption(pollId, optionId) {
  const { rows } = await db.execute(
    'SELECT id FROM options WHERE id = ? AND poll_id = ?',
    [optionId, pollId]
  );
  return rows.length > 0;
}

export async function recordVote(pollId, optionId) {
  const result = await db.execute(
    'UPDATE options SET votes = votes + 1 WHERE id = ? AND poll_id = ?',
    [optionId, pollId]
  );
  return result.rowsAffected > 0;
}
