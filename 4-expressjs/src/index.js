import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkOption, createPoll, getPoll, getPollCount, initDb, recordVote } from './database.js';
import { sanitizeArray, sanitizeString } from './utils/sanitize.js';

// Configuration
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Initialize database
await initDb();

// Middleware
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
  const count = await getPollCount();
  res.render('create', { count });
});

app.post('/', async (req, res) => {
  const { question, answers } = req.body;

  const name = sanitizeString(question);
  const options = sanitizeArray(answers.split('\n'));

  if (options.length > 8 || options.length < 2) {
    return res.status(400).send('Please provide between 2 and 8 options');
  }

  try {
    const pollId = await createPoll(name, options);
    res.status(201).redirect(`/${pollId}`);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).send('Error creating poll');
  }
});


// Load poll for all routes matching `/:pollId`
app.use('/:pollId*', async (req, res, next) => {
  const { pollId } = req.params;

  try {
    const { poll, options } = await getPoll(pollId);

    if (!poll) {
      return res.status(404).send('Poll not found');
    }

    // Attach poll to request object
    req.poll = poll;
    req.options = options;
    next();
  } catch (error) {
    return res.status(500).send('Failed to validate poll');
  }
});

app.get('/:pollId', async (req, res) => {
  const { poll, options } = req;
  res.render('poll', { poll, options });
});

app.post('/:pollId', async (req, res) => {
  const { pollId } = req.params;
  const { option } = req.body;

  if (!option) {
    return res.status(400).send('Please select an option');
  }

  try {
    if (!(await checkOption(pollId, option))) {
      return res.status(400).send('Invalid option selected');
    }

    await recordVote(pollId, option);

    res.status(201).redirect(`/${pollId}/results`);
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).send('Error recording vote');
  }
});

app.get('/:pollId/results', async (req, res) => {
  const { poll, options } = req;
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  res.render('results', { poll, options, totalVotes });
});

app.get('/:pollId/results.csv', async (req, res) => {
  const { poll, options } = req;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${poll.name}.csv"`);
  res.write('Option, Votes\n');
  options.forEach((option) => {
    res.write(`"${option.text}", ${option.votes}\n`);
  });
  res.end();
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
