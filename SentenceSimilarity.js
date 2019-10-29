"use strict";

let Helper = require("helper-clockmaker").Helper;
let debug = require("debug")("SentenceSimilarity");
let deepcopy = require("clone");

/**
 * Order similarity should only depend on the number of matches, since
 * unmatched terms are already factored into the match similarity.
 */
let orderSimilarity = function(v, otherLength) {
  //compute the offset since the whole phrase might
  //actually be offset by a few words, but be in the
  //correct order.
  let offset = 0;
  let osCount = 0;
  v.forEach((c, i) => {
    if (c >= 0) {
      osCount++;
      offset += c - i;
    }
  });

  offset = offset / osCount;

  let mL = Math.max(v.length, otherLength);

  let orderSimilarity = 0;
  v.forEach((c, i) => {
    if (c >= 0) {
      orderSimilarity += 1.0 - Math.abs(c - i - offset) / mL;
    }
  });

  if (osCount == 0) return 0.0;

  return (orderSimilarity / osCount - 0.5) / 0.5;
};

/**
 * Create a table and return both the table and the
 * best similarity match for each term.  Averages the metaphone
 * and levenshtein-damaru scores to produce the final result.
 *
 * @param a is the word vector used as the row of the table
 * a should be the wild word vector of say ["wer","r","the","pigs"]
 * @param b is the word vector used as the columns of the table
 * b should be the controlled word vector (the one that is 'correct')
 * ["where","are","the"]
 */
let similarityTable = function(a, b, options) {
  let table = [];
  let best = [];
  for (let i = 0; i < b.length; i++) {
    table.push([]);

    if (!b[i].match(Helper.betweenParentheses)) {
      for (let j = 0; j < a.length; j++) {
        let score = options.f(a[j], b[i], options.options);
        table[i].push(score);
      }
    } else {
      for (let j = 0; j < a.length; j++) {
        table[i].push(0);
      }
    }
  }

  debug(table);

  return table;
};

let bestMatch = function(table) {
  let matchedColumn = new Map();
  let matchedRow = new Map();
  let unMatchedColumn = new Set();
  let unMatchedRow = new Set();

  for (let i = 0; i < table.length; i++) {
    unMatchedColumn.add(i);
  }

  for (let i = 0; i < table[0].length; i++) {
    unMatchedRow.add(i);
  }

  let shrunk = true;
  while (shrunk && (unMatchedRow.size && unMatchedColumn.size)) {
    shrunk = false;

    for (let i of unMatchedRow) {
      if (unMatchedColumn.size == 0) {
        matchedRow.set(i, { column: -1, score: 0 });
        continue;
      }

      //find the max in the columns
      let columnMax = -1;
      let columnScoreMax = 0;
      for (let j of unMatchedColumn) {
        let val = table[j][i];
        if (val > columnScoreMax) {
          columnScoreMax = val;
          columnMax = j;
        }
      }

      //for that column find the maximum row
      let rowMax = -1;
      let rowScoreMax = 0;
      if (columnMax >= 0) {
        for (let k of unMatchedRow) {
          let val = table[columnMax][k];
          if (val > rowScoreMax) {
            rowScoreMax = val;
            rowMax = k;
          }
        }
      }

      if (rowMax == i && rowMax >= 0) {
        //rowScoreMax and columnScoreMax should be identical.
        matchedRow.set(rowMax, { column: columnMax, score: rowScoreMax });
        matchedColumn.set(columnMax, { row: rowMax, score: rowScoreMax });
        shrunk = true;
        if (rowMax >= 0) unMatchedRow.delete(rowMax);
        if (columnMax >= 0) unMatchedColumn.delete(columnMax);
      }
    }
  }

  return { matchedRow: matchedRow, matchedColumn: matchedColumn };
};

//Number of scores that were exact matches
let exactScore = function(bm, a, b) {
  let score = 0;
  for (let i of bm.values()) {
    if (i.score == 1) {
      score = score + 1;
    }
  }

  debug("bm", bm);

  return score;
};

//Total score including partial matches
let matchScore = function(bm, a, b) {
  let score = 0;
  for (let i of bm.values()) {
    score = score + i.score;
  }

  debug("bm", bm);

  return score;
};

let lengthScore = function(a, b) {
  let pCount = 0;
  b.forEach(val => {
    if (val.match(Helper.betweenParentheses)) {
      pCount++;
    }
  });

  return 1.0 / (b.length - pCount);
};

let computeVectors = function(bm, a, b) {
  let matchVector = [];
  let matchScore = [];
  for (let i = 0; i < a.length; i++) {
    let ans = bm.get(i);
    //console.log('ans',ans)

    if (ans) {
      matchVector.push(ans.column);
      matchScore.push(ans.score);
    } else {
      matchVector.push(-1);
      matchScore.push(0);
    }
  }

  //Ok, produce a word order score as well

  return { matched: matchVector, matchScore: matchScore };
};

/**
 * Computes the similarity between 2 sentence vectors a and b.
 * a and b are expected to be pre-processed before reaching this
 * state.
 *
 * @param a is the word vector whos similarity we are testing
 * @param b is the word vector we are comparing a to
 * @param threshold is the value below which the similarity is set to 0
 *
 * @return an object {matched : [], matchScore : [], score : }
 * where matched is a vector containing indexes of the matched
 * words in b.  matchScore is a vector of the score for each
 * match (0 is no match, 1 is perfect match).
 */
let similarity = function(ain, bin, options) {
  //You need to do this so that cleanArray does affect the final output
  //i.e. you don't want lowercase and missing commas etc in the final
  //result, only in the comparison.
  let a = deepcopy(ain);
  let b = deepcopy(bin);

  //Get rid of punctuation and capitalization for the comparison phase.
  a = Helper.cleanArray(a);
  b = Helper.cleanArray(b);

  debug("a", a);
  debug("b", b);

  let table = similarityTable(a, b, options);

  let bm = bestMatch(table);
  let exact = exactScore(bm.matchedRow, a, b);
  let score = matchScore(bm.matchedRow, a, b);
  let vectors = computeVectors(bm.matchedRow, a, b);

  vectors.exact = exact;
  vectors.score = score;
  vectors.order = orderSimilarity(vectors.matched, b.length);
  vectors.size = lengthScore(a, b);

  return vectors;
};

module.exports = similarity;
