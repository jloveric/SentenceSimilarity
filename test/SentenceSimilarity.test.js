"use strict";

let similarity = require("../SentenceSimilarity.js");
let similarityScore = require("similarity-score");

let sentence0 = ["Were", "r", "the", "tacos"];
let sentence1 = ["Where", "are", "the"];
let sentence2 = ["How", "are", "the", "broncos"];
let sentence3 = ["Where", "are", "the", "(name)"];

let sentence4 = ["What", "is", "John", "Loverich", "email"];
let sentence5 = ["What", "is", "(name)", "(keyword)"];
let sentence6 = [
  "a",
  "bunch",
  "of",
  "stuff",
  "What",
  "is",
  "John",
  "Loverich",
  "email"
];
let sentence7 = ["email", "Loverich", "John", "is", "What"];
let sentence8 = [
  "Loverich",
  "will",
  "have",
  "a",
  "pretty",
  "low",
  "score",
  "because",
  "of",
  "the",
  "size",
  "of",
  "this",
  "John"
];

let stdOpts = { f: similarityScore.metaphoneDl, options: { threshold: 0 } };
let winkOpts = {
  f: similarityScore.winklerMetaphone,
  options: { threshold: 0 }
};

describe("Test SentenceSimilarity", function() {
  it("Report results for exact same sentence", function(done) {
    //Matching case
    let sim = similarity(sentence1, sentence1, stdOpts);
    expect(sim.matched[0]).toBe(0);
    expect(sim.matched[1]).toBe(1);
    expect(sim.matched[2]).toBe(2);

    expect(sim.matchScore[0]).toBe(1);
    expect(sim.matchScore[1]).toBe(1);
    expect(sim.matchScore[2]).toBe(1);

    expect(sim.score).toBe(3);

    console.log(sim);

    //with winklerMetaphone
    sim = similarity(sentence1, sentence1, winkOpts);
    expect(sim.matched[0]).toBe(0);
    expect(sim.matched[1]).toBe(1);
    expect(sim.matched[2]).toBe(2);

    expect(sim.matchScore[0]).toBe(1);
    expect(sim.matchScore[1]).toBe(1);
    expect(sim.matchScore[2]).toBe(1);

    expect(sim.score).toBe(3);

    console.log(sim);

    done();
  });

  it("Report results for somewhat matching sequence", function(done) {
    //Somewhat similar
    let sim = similarity(sentence0, sentence2, stdOpts);
    expect(sim.matched[0]).toBe(1);
    expect(sim.matched[1]).toBe(-1);
    expect(sim.matched[2]).toBe(2);
    expect(sim.matched[3]).toBe(3);

    expect(sim.matchScore[0]).toBe(0.25);
    expect(sim.matchScore[1]).toBe(0);
    expect(sim.matchScore[2]).toBe(1);
    expect(sim.matchScore[3]).toBe(0.2142857142857143);
    expect(sim.score).toBe(1.4642857142857144);

    console.log(sim);

    done();
  });

  it("Report results with one wildcard", function(done) {
    //Somewhat similar
    let sim = similarity(sentence0, sentence3, stdOpts);
    expect(sim.matched[0]).toBe(0);
    expect(sim.matched[1]).toBe(1);
    expect(sim.matched[2]).toBe(2);
    expect(sim.matched[3]).toBe(-1);

    console.log(sim);

    done();
  });

  it("Report results with two wildcard", function(done) {
    //Somewhat similar
    let sim = similarity(sentence4, sentence5, stdOpts);
    expect(sim.matched[0]).toBe(0);
    expect(sim.matched[1]).toBe(1);
    expect(sim.matched[2]).toBe(-1);
    expect(sim.matched[3]).toBe(-1);
    expect(sim.matched[3]).toBe(-1);

    expect(sim.matchScore[0]).toBe(1);
    expect(sim.matchScore[1]).toBe(1);
    expect(sim.matchScore[2]).toBe(0);
    expect(sim.matchScore[3]).toBe(0);
    expect(sim.matchScore[3]).toBe(0);

    console.log(sim);

    done();
  });

  it("Check offset score", function(done) {
    //Somewhat similar
    let sim = similarity(sentence4, sentence6, stdOpts);
    expect(sim.order).toBe(1);

    console.log(sim);
    done();
  });

  it("Check reverse score", function(done) {
    //Somewhat similar
    let sim = similarity(sentence4, sentence7, stdOpts);
    expect(sim.score).toBe(5);
    expect(sim.order).toBe(0.039999999999999813);

    console.log(sim);
    done();
  });

  it("Low score", function(done) {
    //Somewhat similar
    //let sim = similarity(sentence4, sentence8, similarityScore.commonScore )
    let sim = similarity(sentence4, sentence8, {
      f: similarityScore.metaphoneDl,
      options: { threshold: 0.3 }
    });

    //console.log('sim',sim)
    //expect(sim.score).toBe(1)
    expect(sim.order).toBe(0.0);

    console.log(sim);
    done();
  });

  it("Failing score", function(done) {
    //Somewhat similar
    //let sim = similarity(sentence4, sentence8, similarityScore.commonScore )
    let sim = similarity(
      ["any", "salmon"],
      ["summon", "(name)"],
      similarityScore.commonScore
    );

    //console.log('sim',sim)
    expect(sim.score).toBeCloseTo(1.0 / 3.0, 2);
    expect(sim.order).toBe(1.0);
    expect(sim.size).toBe(1.0);

    console.log(sim);
    done();
  });
});
