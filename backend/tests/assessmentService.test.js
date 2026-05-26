import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { normalizeAnswers, scoreAttempt, remainingSeconds } from '../services/assessmentService.js';

const objectId = () => new mongoose.Types.ObjectId();

test('scoreAttempt applies section scoring, difficulty scoring, and negative marks', () => {
  const q1 = objectId();
  const q2 = objectId();
  const q3 = objectId();
  const mockTest = {
    questions: [
      { _id: q1, section: 'Aptitude', difficulty: 'easy', options: ['A', 'B'], correctOption: 1, marks: 2, negativeMarks: 0.5 },
      { _id: q2, section: 'Technical', difficulty: 'hard', options: ['A', 'B'], correctOption: 0, marks: 4, negativeMarks: 1 },
      { _id: q3, section: 'Technical', difficulty: 'medium', options: ['A', 'B'], correctOption: 1, marks: 4, negativeMarks: 1 },
    ],
  };

  const result = scoreAttempt(mockTest, [
    { questionId: q1, selectedOption: 1 },
    { questionId: q2, selectedOption: 1 },
  ]);

  assert.equal(result.score, 1);
  assert.equal(result.totalMarks, 10);
  assert.equal(result.percentage, 10);
  assert.equal(result.correctCount, 1);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.unansweredCount, 1);
  assert.deepEqual(result.sectionScores.find((row) => row.section === 'Technical'), {
    section: 'Technical',
    score: -1,
    totalMarks: 8,
    correct: 0,
    incorrect: 1,
    unanswered: 1,
  });
});

test('normalizeAnswers ignores invalid questions and invalid selected options', () => {
  const q1 = objectId();
  const normalized = normalizeAnswers(
    [
      { questionId: q1, selectedOption: 8, markedForReview: true },
      { questionId: objectId(), selectedOption: 0 },
    ],
    [{ _id: q1, options: ['A', 'B'] }]
  );

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].selectedOption, undefined);
  assert.equal(normalized[0].markedForReview, true);
});

test('remainingSeconds never returns a negative number', () => {
  const attempt = { endsAt: new Date(Date.now() - 1000) };
  assert.equal(remainingSeconds(attempt), 0);
});
