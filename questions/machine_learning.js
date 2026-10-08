window.BANK = (window.BANK || []).concat(
[
  {
    "id": "ml-overfitting-signs",
    "section": "ml",
    "type": "mcq",
    "topic": "Overfitting and underfitting",
    "title": "Reading training vs test scores",
    "prompt": "A credit default model scores 99% accuracy on the training data and 71% on held-out test data. What is the most likely problem?",
    "options": [
      "Overfitting: the model memorized the training data",
      "Underfitting: the model is too simple",
      "Data leakage from the test set into training",
      "The test set is too large"
    ],
    "answer": 0,
    "explanations": [
      "Correct. A big gap between training and test performance is the classic sign of overfitting (high variance). Fixes: simpler model, regularization, more data.",
      "Underfitting shows as poor scores on both training and test data.",
      "Leakage usually makes test scores look too good, not much worse than training.",
      "A larger test set gives a more reliable estimate; it doesn't cause a gap."
    ],
    "approach": [
      "Compare the two scores: high train and low test = overfitting; low on both = underfitting."
    ]
  },
  {
    "id": "ml-train-test-why",
    "section": "ml",
    "type": "mcq",
    "topic": "Train/test split",
    "title": "Why hold out a test set",
    "prompt": "Why do we evaluate a model on a test set it never saw during training?",
    "options": [
      "To make training faster",
      "To estimate how well it will do on new data",
      "To increase the training accuracy",
      "Because scikit-learn requires it"
    ],
    "answer": 1,
    "explanations": [
      "Splitting doesn't meaningfully speed anything up, and that isn't its purpose.",
      "Correct. Scores on data the model trained on are optimistic. A held-out set estimates performance on new data.",
      "Holding data out leaves less to train on; it doesn't raise training accuracy.",
      "scikit-learn doesn't require a split; it's good practice, not a rule of the library."
    ],
    "approach": [
      "The test set stands in for future data. Never use it for training or tuning."
    ]
  },
  {
    "id": "ml-cross-validation",
    "section": "ml",
    "type": "mcq",
    "topic": "Cross-validation",
    "title": "What 5-fold cross-validation does",
    "prompt": "What does 5-fold cross-validation do?",
    "options": [
      "Trains 5 different algorithms and keeps the best",
      "Trains the model 5 times on all of the data",
      "Splits the data into 5 parts, trains on 4 and tests on 1, rotating so each part is tested once, then averages",
      "Removes 5% of the data as outliers"
    ],
    "answer": 2,
    "explanations": [
      "That's model selection, which cross-validation can support, but it isn't what k-fold means.",
      "Training on all the data leaves nothing to test on.",
      "Correct. Every row is used for testing exactly once, and the average of the 5 scores is a steadier estimate than one split.",
      "Cross-validation has nothing to do with removing outliers."
    ],
    "approach": [
      "k folds: k models, each tested on a different fold. Average the k scores."
    ]
  },
  {
    "id": "ml-bias-variance",
    "section": "ml",
    "type": "mcq",
    "topic": "Bias and variance",
    "title": "A deep tree vs a shallow tree",
    "prompt": "Compared with a decision tree limited to depth 2, an unlimited-depth decision tree typically has:",
    "options": [
      "Lower bias and lower variance",
      "Higher bias and lower variance",
      "Higher bias and higher variance",
      "Lower bias and higher variance"
    ],
    "answer": 3,
    "explanations": [
      "There's a trade-off: more flexibility lowers bias but raises variance.",
      "That describes the shallow tree: too simple (biased) but stable.",
      "More flexibility lowers bias; it doesn't raise both.",
      "Correct. A deep tree can fit the training data very closely (low bias) but changes a lot with small changes in the data (high variance)."
    ],
    "approach": [
      "More complex model: bias down, variance up. Simpler model: bias up, variance down."
    ]
  },
  {
    "id": "ml-regularization",
    "section": "ml",
    "type": "mcq",
    "topic": "Regularization",
    "title": "L1 vs L2 regularization",
    "prompt": "Which statement about Lasso (L1) and Ridge (L2) regression is true?",
    "options": [
      "Lasso can set some coefficients exactly to zero, so it also selects features",
      "Ridge sets many coefficients exactly to zero",
      "Both remove the need to scale features",
      "Regularization increases overfitting"
    ],
    "answer": 0,
    "explanations": [
      "Correct. The L1 penalty can push coefficients to exactly zero, dropping those features. L2 shrinks all of them smoothly.",
      "Ridge shrinks coefficients toward zero but rarely makes them exactly zero.",
      "Penalties depend on coefficient size, so features should be scaled first.",
      "Regularization reduces overfitting by penalizing large coefficients."
    ],
    "approach": [
      "L1 (Lasso): sparse, does feature selection. L2 (Ridge): shrinks everything, handles correlated features well."
    ]
  },
  {
    "id": "ml-leakage",
    "section": "ml",
    "type": "mcq",
    "topic": "Data leakage",
    "title": "Spotting leakage",
    "prompt": "A model predicting whether a loan will default includes the feature `days_past_due_at_closing`. It scores 0.99 AUC. What's wrong?",
    "options": [
      "Nothing; the model is excellent",
      "The feature is only known after the outcome, so it leaks the answer",
      "AUC can't go above 0.9",
      "The model needs more features"
    ],
    "answer": 1,
    "explanations": [
      "A near-perfect score from a feature like this is a red flag, not a success.",
      "Correct. Data leakage: the feature is recorded after the loan has (or hasn't) defaulted, so it won't exist when making real predictions.",
      "AUC can reach 1.0; the problem is how the score was achieved.",
      "Adding features doesn't fix using information from the future."
    ],
    "approach": [
      "Ask for each feature: would I know this at the moment I make the prediction?"
    ]
  },
  {
    "id": "ml-scaling",
    "section": "ml",
    "type": "mcq",
    "topic": "Feature scaling",
    "title": "Which model needs scaling",
    "prompt": "Features are `income` (thousands to millions) and `num_accounts` (1 to 10). For which model does scaling the features matter most?",
    "options": [
      "Decision tree",
      "Random forest",
      "k-nearest neighbors",
      "None of them; scaling never matters"
    ],
    "answer": 2,
    "explanations": [
      "Trees split one feature at a time on thresholds, so the scale of a feature doesn't change the splits.",
      "A random forest is many trees, so it's also unaffected by scaling.",
      "Correct. kNN uses distances, and income's huge range would dominate the distance. Scale first (for example StandardScaler).",
      "Scaling matters for distance-based and gradient-based models: kNN, SVM, k-means, regularized regression."
    ],
    "approach": [
      "Distances or penalties on coefficients: scale. Tree-based models: no need."
    ]
  },
  {
    "id": "ml-imbalance-accuracy",
    "section": "ml",
    "type": "mcq",
    "topic": "Metrics: class imbalance",
    "title": "99% accuracy on fraud",
    "prompt": "Only 1% of transactions are fraud. A model predicts \"not fraud\" for every transaction. Which is true?",
    "options": [
      "It's a strong model with 99% accuracy",
      "Its recall for fraud is 99%",
      "Its precision for fraud is 100%",
      "Its accuracy is 99% but its recall for fraud is 0%"
    ],
    "answer": 3,
    "explanations": [
      "99% accuracy here is useless: it never catches fraud.",
      "Recall is the share of actual fraud it catches, which is none.",
      "It never predicts fraud, so precision is undefined (0 / 0), not 100%.",
      "Correct. It's right on the 99% legitimate transactions, so accuracy is 99%, but it finds none of the fraud, so recall = 0 / all fraud = 0%."
    ],
    "approach": [
      "With imbalanced classes, look at recall, precision, F1 or PR-AUC instead of accuracy."
    ]
  },
  {
    "id": "ml-precision-recall",
    "section": "ml",
    "type": "mcq",
    "topic": "Metrics: precision and recall",
    "title": "Precision and recall from counts",
    "prompt": "A fraud model flags 50 transactions. 40 of them are really fraud. There were 80 fraudulent transactions in total. What are its precision and recall?",
    "options": [
      "Precision 80%, recall 50%",
      "Precision 40%, recall 50%",
      "Precision 80%, recall 62.5%",
      "Precision 50%, recall 80%"
    ],
    "answer": 0,
    "explanations": [
      "Correct. Precision = true positives / flagged = 40 / 50 = 80%. Recall = true positives / actual fraud = 40 / 80 = 50%.",
      "40% isn't a ratio of any of the counts that matter here.",
      "62.5% would be 50 / 80, which divides the flags by the frauds.",
      "These numbers mix up the counts."
    ],
    "approach": [
      "Precision: of what I flagged, how much was right? Recall: of what was really there, how much did I catch?"
    ]
  },
  {
    "id": "ml-roc-auc",
    "section": "ml",
    "type": "mcq",
    "topic": "Metrics: ROC and AUC",
    "title": "What an AUC of 0.5 means",
    "prompt": "A classifier has a ROC AUC of 0.5. What does that mean?",
    "options": [
      "It's perfect",
      "It ranks a random positive above a random negative only half the time, no better than guessing",
      "It's right on 50% of predictions at every threshold",
      "Half the features are useless"
    ],
    "answer": 1,
    "explanations": [
      "A perfect classifier has AUC 1.0.",
      "Correct. AUC is the probability that the model scores a random positive higher than a random negative. 0.5 is a coin flip.",
      "AUC summarizes ranking across all thresholds; it isn't accuracy at each one.",
      "AUC says nothing about individual features."
    ],
    "approach": [
      "AUC: 1.0 perfect, 0.5 random, below 0.5 worse than random (flip the predictions)."
    ]
  },
  {
    "id": "ml-logistic-output",
    "section": "ml",
    "type": "mcq",
    "topic": "Logistic regression",
    "title": "What logistic regression outputs",
    "prompt": "What does a logistic regression model output before you choose a threshold?",
    "options": [
      "Any real number, like linear regression",
      "A class label only",
      "A probability between 0 and 1",
      "The number of clusters"
    ],
    "answer": 2,
    "explanations": [
      "The sigmoid squeezes the output into the range 0 to 1.",
      "predict gives labels, but only after applying a threshold to the probability.",
      "Correct. It passes a linear combination through the sigmoid, giving a probability. A threshold (often 0.5) turns it into a class; in scikit-learn that's predict_proba vs predict.",
      "Logistic regression is a classifier, not a clustering method."
    ],
    "approach": [
      "Logistic regression is for classification despite the name. predict_proba gives probabilities; predict applies 0.5."
    ]
  },
  {
    "id": "ml-random-forest",
    "section": "ml",
    "type": "mcq",
    "topic": "Trees and ensembles",
    "title": "Why a random forest beats one tree",
    "prompt": "Why does a random forest usually generalize better than a single deep decision tree?",
    "options": [
      "It uses deeper trees",
      "It needs no training data",
      "It never overfits",
      "It averages many trees trained on bootstrapped samples with random feature subsets, which lowers variance"
    ],
    "answer": 3,
    "explanations": [
      "The individual trees are often just as deep; depth isn't the reason.",
      "Every supervised model needs training data.",
      "It can still overfit, just less than one tree.",
      "Correct. Bagging plus random feature selection makes the trees different from each other, and averaging different errors reduces variance."
    ],
    "approach": [
      "Bagging (bootstrap aggregation) reduces variance. Boosting (like gradient boosting) builds trees one after another to reduce bias."
    ]
  },
  {
    "id": "ml-kmeans",
    "section": "ml",
    "type": "mcq",
    "topic": "Clustering",
    "title": "What k-means needs",
    "prompt": "Which is true about k-means clustering?",
    "options": [
      "You choose the number of clusters k before running it",
      "It needs labeled data",
      "It always finds the best possible clusters",
      "It works well on any cluster shape"
    ],
    "answer": 0,
    "explanations": [
      "Correct. k is set in advance; methods like the elbow plot or silhouette score help choose it.",
      "k-means is unsupervised: no labels.",
      "It can get stuck in a local optimum, which is why it's run several times with different starting points (n_init).",
      "It assumes roughly round clusters of similar size."
    ],
    "approach": [
      "k-means: unsupervised, pick k, sensitive to scale and starting points, prefers round clusters."
    ]
  },
  {
    "id": "ml-fit-transform",
    "section": "ml",
    "type": "mcq",
    "topic": "scikit-learn workflow",
    "title": "Fitting a scaler correctly",
    "prompt": "You're standardizing features with `StandardScaler`. What's the correct way to apply it?",
    "options": [
      "fit_transform on the full dataset, then split into train and test",
      "fit_transform on the training set, then transform (not fit) the test set",
      "fit_transform on the test set, then transform the training set",
      "fit_transform on train and on test separately"
    ],
    "answer": 1,
    "explanations": [
      "Fitting on all the data lets test-set statistics (mean, SD) leak into training.",
      "Correct. Learn the mean and SD from training data only, then apply those same numbers to the test set. A Pipeline does this automatically.",
      "The test set must never be used to fit anything.",
      "Fitting twice scales train and test with different numbers, so they aren't comparable."
    ],
    "approach": [
      "Fit on train only; transform everything else with what you learned. Put preprocessing in a Pipeline to avoid mistakes."
    ]
  },
  {
    "id": "ml-r-squared",
    "section": "ml",
    "type": "mcq",
    "topic": "Regression metrics",
    "title": "Interpreting R²",
    "prompt": "A linear regression predicting customer spending has R² = 0.64 on the test set. What does this mean?",
    "options": [
      "64% of predictions are exactly right",
      "The correlation between features is 0.64",
      "The model explains about 64% of the variance in spending",
      "The model is 64% likely to be correct"
    ],
    "answer": 2,
    "explanations": [
      "R² isn't the share of exactly correct predictions.",
      "R² is about predictions vs the target, not features vs each other.",
      "Correct. R² is the share of the variation in the target explained by the model. (In simple linear regression it's the square of the correlation r = 0.8.)",
      "R² is not a probability."
    ],
    "approach": [
      "R² = 1 − (unexplained variance / total variance). 1 is perfect, 0 is no better than predicting the mean."
    ]
  }
]
);
