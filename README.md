# SentenceSimilarity
Javascript/Nodejs sentence similarity.

This algorithm computes 4 sentence similarity scores that can be used for choosing best matched scores based
on multiple criteria.  The 4 similarities are 'exact' which is the number of words that match exactly regardless of order. 'score' which is the score of the words that match either partially or exactly.  Partial matches are determined by the a user selected word similarity measure, Levenshtein or Metaphone for example. 'order' is score provided based on the order of
the words in the two sentences. 'size' is the score determined by comparing the number of words to match to the number of
words that exist in the compared sentence.

By multiplying score\*order\*size or exact\*order\*size, one will get a score between 0 and 1.  In addition, the user can
supply wildcards that appear in parentheses 'Your name is (name)' where the wildcard '(name)' is ignored in the comparison.  This allows the similarity score to be used in slot filling.
