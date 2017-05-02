# SentenceSimilarity
Javascript/Nodejs sentence similarity.

This algorithm computes 4 sentence similarity scores that can be used for choosing best matched scores based
on multiple criteria.  The 4 similarities are 'exact' which is the number of words that match exactly regardless of order. 'score' which is the score of the words that match either partially or exactly.  Partial matches are determined by the a user selected word similarity measure, Levenshtein or Metaphone for example. 'order' is score provided based on the order of
the words in the two sentences. 'size' is the score determined by comparing the number of words to match to the number of
words that exist in the compared sentence.

By multiplying score\*order\*size or exact\*order\*size, one will get a score between 0 and 1.  In addition, the user can
supply wildcards that appear in parentheses 'Your name is (name)' where the wildcard '(name)' is ignored in the comparison.  This allows the similarity score to be used in slot filling.

# Example
```javascript
"use strict"

let ss = require('sentence-similarity')

let similarity = ss.sentenceSimilarity;
let similarityScore = ss.similarityScore;

let s1 = ['how','close','is','this','to','that']
let s2 = ['these','two','are','not','that','close']

let winkOpts = { f: similarityScore.winklerMetaphone, options : {threshold: 0} }

console.log(similarity(s1,s2,winkOpts))
```

gives

```json
{ matched: [ 3, 5, -1, 0, 1, 4 ],
  matchScore: 
   [ 0.27777777777777773,
     1,
     0,
     0.9133333333333333,
     0.32499999999999996,
     1 ],
  exact: 2,
  score: 3.516111111111111,
  order: 0.06666666666666687,
  size: 0.16666666666666666 }
```
The third parameter (opts) to the similarity(s1,s2,opts) call is an object containing the similarity measure for comparing words in a sentence as well as a option object which can be used to define additional parameters.  someFunc should return a value between 0 and 1
defining how similar the two "words" are, where 1 means they are exactly the same and 0 means the are not at all the same.  I often use a threshold parameter that sets the similarity to 0 if the similarity is below that threshold.

```javascript
let opts = { f: someFunc, options : {threshold: 0.1} }
```
where
```javascript
let someFunc = function(a,b,options) {
  let a = levenshteing(a,b);//for example
  if(a<options.threshold) a = 0;
  return a
}
```