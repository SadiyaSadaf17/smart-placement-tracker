const FINISHED_STATUSES = ['submitted', 'auto_submitted', 'expired', 'terminated'];

const clampOption = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
};

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

export const isFinishedAttempt = (attempt) => (
  FINISHED_STATUSES.includes(attempt?.status) || (!attempt?.status && Boolean(attempt?.submittedAt))
);

export const buildAttemptOrder = (test) => {
  const questionIds = test.questions.map((question) => question._id);
  const questionOrder = test.randomizeQuestions ? shuffle(questionIds) : questionIds;
  const optionOrders = test.questions.map((question) => ({
    questionId: question._id,
    order: test.randomizeOptions ? shuffle(question.options.map((_, index) => index)) : question.options.map((_, index) => index),
  }));

  return { questionOrder, optionOrders };
};

export const normalizeAnswers = (answers = [], questions = []) => {
  const questionMap = new Map(questions.map((question) => [String(question._id), question]));
  const deduped = new Map();

  answers.forEach((answer) => {
    const question = questionMap.get(String(answer.questionId));
    if (!question) return;

    const selectedOption = clampOption(answer.selectedOption);
    const normalized = {
      questionId: question._id,
      markedForReview: Boolean(answer.markedForReview),
      visited: Boolean(answer.visited),
    };

    if (selectedOption !== undefined && selectedOption < question.options.length) {
      normalized.selectedOption = selectedOption;
      normalized.answeredAt = answer.answeredAt ? new Date(answer.answeredAt) : new Date();
    }

    deduped.set(String(question._id), normalized);
  });

  return [...deduped.values()];
};

const bumpBucket = (map, key, question, resultType, delta) => {
  const bucketKey = key || 'General';
  if (!map.has(bucketKey)) {
    map.set(bucketKey, { score: 0, totalMarks: 0, correct: 0, incorrect: 0, unanswered: 0 });
  }

  const bucket = map.get(bucketKey);
  bucket.totalMarks += question.marks || 0;
  bucket.score += delta;
  bucket[resultType] += 1;
};

export const scoreAttempt = (test, answers = []) => {
  const answerMap = new Map(normalizeAnswers(answers, test.questions).map((answer) => [String(answer.questionId), answer]));
  const sectionMap = new Map();
  const difficultyMap = new Map();

  let score = 0;
  let totalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  test.questions.forEach((question) => {
    const answer = answerMap.get(String(question._id));
    const marks = Number(question.marks || 0);
    const negativeMarks = Number(question.negativeMarks || 0);
    totalMarks += marks;

    let delta = 0;
    let resultType = 'unanswered';
    if (answer?.selectedOption === undefined) {
      unansweredCount += 1;
    } else if (Number(answer.selectedOption) === Number(question.correctOption)) {
      delta = marks;
      correctCount += 1;
      resultType = 'correct';
    } else {
      delta = -negativeMarks;
      incorrectCount += 1;
      resultType = 'incorrect';
    }

    score += delta;
    bumpBucket(sectionMap, question.section, question, resultType, delta);
    bumpBucket(difficultyMap, question.difficulty, question, resultType, delta);
  });

  const toRows = (map, name) => [...map.entries()].map(([key, value]) => ({ [name]: key, ...value }));

  return {
    score,
    totalMarks,
    percentage: totalMarks ? Math.max(0, Math.round((score / totalMarks) * 100)) : 0,
    correctCount,
    incorrectCount,
    unansweredCount,
    sectionScores: toRows(sectionMap, 'section'),
    difficultyScores: toRows(difficultyMap, 'difficulty'),
  };
};

export const remainingSeconds = (attempt, now = new Date()) => (
  Number.isNaN(new Date(attempt.endsAt).getTime())
    ? 0
    : Math.max(0, Math.ceil((new Date(attempt.endsAt).getTime() - now.getTime()) / 1000))
);

export const projectAttemptForStudent = (test, attempt) => {
  const optionOrderMap = new Map((attempt.optionOrders || []).map((entry) => [String(entry.questionId), entry.order]));
  const questionMap = new Map(test.questions.map((question) => [String(question._id), question]));
  const answerMap = new Map((attempt.answers || []).map((answer) => [String(answer.questionId), answer]));
  const orderedQuestions = (attempt.questionOrder?.length ? attempt.questionOrder : test.questions.map((question) => question._id))
    .map((questionId) => questionMap.get(String(questionId)))
    .filter(Boolean)
    .map((question) => {
      const order = optionOrderMap.get(String(question._id)) || question.options.map((_, index) => index);
      const answer = answerMap.get(String(question._id));
      return {
        _id: question._id,
        question: question.question,
        section: question.section,
        difficulty: question.difficulty,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        options: order.map((optionIndex) => ({
          optionIndex,
          text: question.options[optionIndex],
        })),
        selectedOption: answer?.selectedOption,
        markedForReview: Boolean(answer?.markedForReview),
        visited: Boolean(answer?.visited),
      };
    });

  return {
    attemptId: attempt._id,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    endsAt: attempt.endsAt,
    remainingSeconds: remainingSeconds(attempt),
    lastSavedAt: attempt.lastSavedAt,
    antiCheat: attempt.antiCheat,
    test: {
      _id: test._id,
      title: test.title,
      description: test.description,
      durationMinutes: test.durationMinutes,
      instructions: test.instructions,
      antiCheat: test.antiCheat,
      questions: orderedQuestions,
    },
  };
};

export const buildReview = (test, attempt) => {
  const answerMap = new Map((attempt.answers || []).map((answer) => [String(answer.questionId), answer]));
  return test.questions.map((question) => {
    const answer = answerMap.get(String(question._id));
    const selectedOption = answer?.selectedOption;
    const isCorrect = selectedOption !== undefined && Number(selectedOption) === Number(question.correctOption);
    return {
      questionId: question._id,
      question: question.question,
      section: question.section,
      difficulty: question.difficulty,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      options: question.options,
      selectedOption,
      correctOption: question.correctOption,
      isCorrect,
      explanation: question.explanation,
    };
  });
};
