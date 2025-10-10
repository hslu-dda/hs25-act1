let data;

function preload() {
  data = loadJSON("data/combined-data_masterfile.json");
}

function setup() {
  createCanvas(400, 400);
  data = Object.values(data);
  console.log("Loaded data:", data);

  // Get all unique communities
  const communities = [...new Set(data.map((item) => item.Community))];
  console.log("Communities:", communities);

  // Process each community
  communities.forEach((community) => {
    const filteredData = data.filter((item) => item.Community === community);
    const totalIndicators = filteredData.length;
    const totalVotes = filteredData.reduce((sum, item) => sum + item.T, 0);

    // Precalculate sums for all codes in this community
    const codeSums = {};
    const codeCounts = {};

    filteredData.forEach((item) => {
      const code1 = item["Code 1 "];
      const code2 = item["Code 2"];

      // Only add if code is a valid number greater than 0
      if (typeof code1 === "number" && code1 > 0) {
        codeSums[code1] = (codeSums[code1] || 0) + item.T;
        codeCounts[code1] = (codeCounts[code1] || 0) + 1;
      }

      if (typeof code2 === "number" && code2 > 0) {
        codeSums[code2] = (codeSums[code2] || 0) + item.T;
        codeCounts[code2] = (codeCounts[code2] || 0) + 1;
      }
    });

    // Calculate scores for each item in this community
    filteredData.forEach((item) => {
      // Calculate Calc Imp score
      const calcImpScore = parseFloat(((item.T * totalIndicators) / totalVotes).toFixed(6));
      item["Calc Imp score"] = calcImpScore;

      // Calculate Calc Imp Cat1
      const code1Value = item["Code 1 "];
      if (typeof code1Value === "number" && code1Value > 0) {
        const sumVotesInCode1 = codeSums[code1Value];
        const countIndicatorsWithCode1 = codeCounts[code1Value];
        const calcImpCat1 = parseFloat(
          (item.T / sumVotesInCode1 / (countIndicatorsWithCode1 / totalIndicators)).toFixed(6)
        );
        item["Calc Imp-Cat1"] = calcImpCat1;

        // Check if calculated value differs from original
        item["Imp Cat1 difference"] = calcImpCat1 !== item["Imp-Cat1"] ? 1 : 0;
      } else {
        item["Calc Imp-Cat1"] = null;
        item["Imp Cat1 difference"] = null;
      }

      // Calculate Calc Imp Cat2
      const code2Value = item["Code 2"];
      if (typeof code2Value === "number" && code2Value > 0) {
        const sumVotesInCode2 = codeSums[code2Value];
        const countIndicatorsWithCode2 = codeCounts[code2Value];
        const calcImpCat2 = parseFloat(
          (item.T / sumVotesInCode2 / (countIndicatorsWithCode2 / totalIndicators)).toFixed(6)
        );
        item["Calc Imp-Cat2"] = calcImpCat2;

        // Check if calculated value differs from original
        item["Imp Cat2 difference"] = calcImpCat2 !== item["Imp-Cat2"] ? 1 : 0;
      } else {
        item["Calc Imp-Cat2"] = null;
        item["Imp Cat2 difference"] = null;
      }
    });
  });

  // Log a sample to verify
  console.log("Sample with calculated scores:", data[0]);

  // Count total differences
  const cat1Diffs = data.filter((item) => item["Imp Cat1 difference"] === 1).length;
  const cat2Diffs = data.filter((item) => item["Imp Cat2 difference"] === 1).length;
  console.log(`Total Cat1 differences: ${cat1Diffs}`);
  console.log(`Total Cat2 differences: ${cat2Diffs}`);
}

function draw() {
  background(220);
}

function keyPressed() {
  if (key == "s") {
    // Save the updated JSON
    saveJSON(data, "data/masterdata_combined_calculated_scores.json");
  }
}
