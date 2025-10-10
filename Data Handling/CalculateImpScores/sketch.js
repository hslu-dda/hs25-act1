let data;
let allCommunitiesData = []; // Store all processed indicators
let allCommunitiesStats = []; // Store all community statistics

function preload() {
  data = loadJSON("data/combined-data_masterfile.json");
}

function setup() {
  createCanvas(400, 400);

  data = Object.values(data);
  console.log("Loaded data:", data);

  // Get unique communities from the data
  const communities = [...new Set(data.map((item) => item.Community))].filter((c) => c != null && c !== "");
  console.log("Found communities:", communities);

  // Process each community
  communities.forEach((community) => {
    console.log(`\n========== Processing ${community} ==========`);
    processCommunity(community);
  });

  console.log("\n========== ALL PROCESSING COMPLETE ==========");
  console.log(`Total communities processed: ${allCommunitiesStats.length}`);
  console.log(`Total indicators with scores: ${allCommunitiesData.length}`);
}

function processCommunity(community) {
  const filteredData = data.filter(
    (item) => item.Community === community && item["Indicator English"] != null && item["Indicator English"] !== ""
  );

  if (filteredData.length === 0) {
    console.log(`  ⚠ No data found for ${community}`);
    return;
  }

  let totalIndicators = filteredData.length;
  const totalVotes = filteredData.reduce((sum, item) => sum + item.T, 0);

  console.log(`  Total Indicators: ${totalIndicators}, Total Votes: ${totalVotes}`);

  // ===== TEIL 1: Precalculate für ALLE Focus Groups =====

  const focusGroups = ["F", "M", "Y", "T"]; // Female, Male, Youth, Total
  const groupData = {};

  focusGroups.forEach((group) => {
    const { codeSums, codeCounts, dimSums, dimCounts, groupTotalVotes } = filteredData.reduce(
      (acc, item) => {
        const code1 = item["Code 1 "];
        const code2 = item["Code 2"];
        const dim1 = item["Dimension 1"];
        const dim2 = item["Dimension 2"];

        // Votes für diese Focus Group
        const votes = item[group] || 0;

        acc.groupTotalVotes += votes;

        // ===== CODES (Kategorien) =====
        if (typeof code1 === "number" && code1 > 0) {
          acc.codeSums[code1] = (acc.codeSums[code1] || 0) + votes;
          acc.codeCounts[code1] = (acc.codeCounts[code1] || 0) + 1;
        }

        if (typeof code2 === "number" && code2 > 0) {
          acc.codeSums[code2] = (acc.codeSums[code2] || 0) + votes;
          acc.codeCounts[code2] = (acc.codeCounts[code2] || 0) + 1;
        }

        // ===== DIMENSIONS =====
        if (dim1 && dim1 !== "" && dim2 && dim2 !== "" && dim1 === dim2) {
          // Beide gleich - nur einmal zählen
          acc.dimSums[dim1] = (acc.dimSums[dim1] || 0) + votes;
          acc.dimCounts[dim1] = (acc.dimCounts[dim1] || 0) + 1;
        } else {
          // Unterschiedlich - separat zählen
          if (dim1 && dim1 !== "") {
            acc.dimSums[dim1] = (acc.dimSums[dim1] || 0) + votes;
            acc.dimCounts[dim1] = (acc.dimCounts[dim1] || 0) + 1;
          }
          if (dim2 && dim2 !== "") {
            acc.dimSums[dim2] = (acc.dimSums[dim2] || 0) + votes;
            acc.dimCounts[dim2] = (acc.dimCounts[dim2] || 0) + 1;
          }
        }

        return acc;
      },
      {
        codeSums: {},
        codeCounts: {},
        dimSums: {},
        dimCounts: {},
        groupTotalVotes: 0,
      }
    );

    // ===== IMPORTANCE BERECHNEN =====

    // Durchschnittliche Votes pro Indikator für diese Focus Group
    const avgVotesPerIndicator = groupTotalVotes / totalIndicators;

    // Dimensions-Importance
    const dimensionImportance = {};
    for (let dim in dimSums) {
      const votesPerIndicator = dimSums[dim] / dimCounts[dim];
      dimensionImportance[dim] = votesPerIndicator / avgVotesPerIndicator;
    }

    // Kategorie-Importance
    const categoryImportance = {};
    for (let code in codeCounts) {
      const votesPerIndicator = codeSums[code] / codeCounts[code];
      categoryImportance[code] = votesPerIndicator / avgVotesPerIndicator;
    }

    // Speichere alles für diese Focus Group
    groupData[group] = {
      codeSums,
      codeCounts,
      dimSums,
      dimCounts,
      totalVotes: groupTotalVotes,
      avgVotesPerIndicator,
      dimensionImportance,
      categoryImportance,
    };
  });

  // ===== TEIL 2: Berechne Scores für jeden Indikator =====

  filteredData.forEach((item) => {
    focusGroups.forEach((group) => {
      const data = groupData[group];
      const votes = item[group] || 0;

      // 1. Calc Imp score (global)
      item[`Calc Imp score ${group}`] = parseFloat(((votes * totalIndicators) / data.totalVotes).toFixed(6));

      // 2. Calc Imp-Cat1
      if (group == "T") {
        const code1Value = item["Code 1 "];
        if (typeof code1Value === "number" && code1Value > 0) {
          item[`Calc Imp-Cat1 ${group}`] = parseFloat(
            (votes / data.codeSums[code1Value] / (data.codeCounts[code1Value] / totalIndicators)).toFixed(6)
          );
        } else {
          item[`Calc Imp-Cat1 ${group}`] = null;
        }

        // 3. Calc Imp-Cat2
        const code2Value = item["Code 2"];
        if (typeof code2Value === "number" && code2Value > 0) {
          item[`Calc Imp-Cat2 ${group}`] = parseFloat(
            (votes / data.codeSums[code2Value] / (data.codeCounts[code2Value] / totalIndicators)).toFixed(6)
          );
        } else {
          item[`Calc Imp-Cat2 ${group}`] = null;
        }
      }
    });
  });

  // Add processed data to global arrays
  allCommunitiesData.push(...filteredData);
  allCommunitiesStats.push({
    community: community,
    groupData: groupData,
  });

  console.log(`  ✓ ${community} processed successfully`);
}

function draw() {
  background(220);
}

function keyPressed() {
  if (key == "s") {
    // Export all indicators with calculated scores
    saveJSON(allCommunitiesData, "data/all_communities_with_scores.json");
    console.log("✓ Saved all communities data with scores");
  }

  if (key == "g") {
    // Export all community statistics
    saveJSON(allCommunitiesStats, "data/all_communities_statistics.json");
    console.log("✓ Saved all communities statistics");
  }

  if (key == "b") {
    // Export both files
    saveJSON(allCommunitiesData, "data/all_communities_with_scores.json");
    saveJSON(allCommunitiesStats, "data/all_communities_statistics.json");
    console.log("✓ Saved both files");
  }
}
