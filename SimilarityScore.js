"use strict";

let natural = require('natural')

let dlev = require('damerau-levenshtein')
let Helper = require('helper-clockmaker').Helper;
let debug = require('debug')('SimilarityScore')

let winklerMetaphone = function(a, b, options) {
    let scoreJw = natural.JaroWinklerDistance(a, b);
    let scoreSoundex = 0

    if (natural.Metaphone.compare(a, b)) {
        scoreSoundex = 1
    }

    let score = 0.5 * (scoreJw + scoreSoundex);
    if (score < options.threshold) score = 0.0;
    return score;
}

let metaphoneDl=function(a, b, options) {
    let scoreDl = dlev(a, b).similarity;
    let scoreSoundex = 0

    if (natural.Metaphone.compare(a, b)) {
        scoreSoundex = 1
    }

    //let score = 0.5 * (scoreDl + scoreSoundex);
    let score = 0.5*(scoreDl+scoreSoundex);
    if (score < options.threshold) score = 0.0;
    return score; 
}

let dl=function(a, b, options) {
    let score = dlev(a, b).similarity;
    if (score < options.threshold) score = 0.0;
    return score;
}

let commonScore = { f: metaphoneDl, options : {threshold: 0.3} }
//let commonScore = { f: winklerMetaphone, options : {threshold: 0.4} }

module.exports.winklerMetaphone = winklerMetaphone;
module.exports.metaphoneDl = metaphoneDl;
module.exports.dl = dl;
module.exports.commonScore = commonScore;