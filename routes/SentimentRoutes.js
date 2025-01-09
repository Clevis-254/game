import express from 'express';
import natural from 'natural';

// Import the natural library
const router = express.Router();
// Extract JaroWinklerDistance from the natural library
const { JaroWinklerDistance } = natural;

// Route to analyze the input and find the best matching command
router.post('/analyze', (req, res) => {
  const { input, commands } = req.body; // Extract input and commands from the request body
  let bestCommand = null;
  let bestScore = 0;

  // Iterate over each command to find the best match using Jaro-Winkler Distance
  for (const command of Object.keys(commands)) {
    const score = JaroWinklerDistance(input, command);
    if (score > bestScore) {
      bestScore = score;
      bestCommand = command;
    }
  }

  // Return the best matching command and its score as a JSON response
  return res.json({ bestCommand, bestScore });
});

export default router;
