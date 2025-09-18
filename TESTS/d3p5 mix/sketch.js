let data;

function preload() {
  data = loadD3JSON("data.json");
}

function setup() {
  createCanvas(400, 400);
  console.log(data);
  const groupedByD3 = d3.group(data, (d) => d.Community);
  console.log(groupedByD3);
  const d3GroupedObject = Object.fromEntries(groupedByD3);
  console.log("d3GroupedObject", d3GroupedObject);

  const twoLevel = d3.group(
    data,
    (d) => d.Community,
    (d) => d["Dimension 1"]
  );
  const twoLevelObject = mapToObject(twoLevel);
  console.log(
    "twoLevel map",
    twoLevel,
    "access",
    twoLevel.get("blagajLT").get("Economic Activity & Livelihoods"),
    "object",
    twoLevelObject
  );

  const flatGrouped = d3.flatGroup(
    data,
    (d) => d.Community,
    (d) => d["Dimension 1"]
  );
  // This
  console.log("flatGrouped", flatGrouped);
  const flatRollup = d3.flatRollup(
    data,
    (leaves) => leaves, // identity function to keep the grouped data as-is
    (d) => d.Community,
    (d) => d["Dimension 1"]
  );
  console.log("flatRollup", flatRollup);

  const stats = d3.rollup(
    data,
    (values) => {
      const scores = values.map((d) => d["Imp score"]).sort(d3.ascending);
      return {
        count: values.length,
        avgImportance: d3.mean(values, (d) => d["Imp score"]),
        maxScore: d3.max(values, (d) => d["Imp score"]),
        minScore: d3.min(values, (d) => d["Imp score"]),
        q25: d3.quantile(scores, 0.25),
        median: d3.quantile(scores, 0.5),
        q75: d3.quantile(scores, 0.75),
        mostImportant: d3.greatest(values, (d) => d["Imp score"]),
        leastImportant: d3.least(values, (d) => d["Imp score"]),
        deviation: d3.deviation(values, (d) => d["Imp score"]), // Standard deviation
        extent: d3.extent(values, (d) => d["Imp score"]), // [min, max]
      };
    },
    (d) => d.Community
  );
  console.log("stats", Object.fromEntries(stats));

  // vanilla js grouping

  const groupedByReduce = data.reduce((acc, item) => {
    const community = item.Community;
    if (!acc[community]) {
      acc[community] = [];
    }
    acc[community].push(item);
    return acc;
  }, {});

  console.log("groupedByReduce", groupedByReduce);

  const twoLevelGrouped = data.reduce((acc, item) => {
    const community = item.Community;
    const dimension = item["Dimension 1"];

    if (!acc[community]) {
      acc[community] = {};
    }

    if (!acc[community][dimension]) {
      acc[community][dimension] = [];
    }

    acc[community][dimension].push(item);
    return acc;
  }, {});

  console.log("twoLevelGrouped", twoLevelGrouped);

  // Filtering while grouping
  const allowedDimensions = ["Armed Actors", "Security"];
  const groupedFilteredData = data.reduce((acc, item) => {
    const dimension = item["Dimension 1"];
    // Skip if not in allowed list
    if (!allowedDimensions.includes(dimension)) {
      return acc;
    }
    const community = item.Community;
    if (!acc[community]) {
      acc[community] = [];
    }
    acc[community].push({
      "Indicator English": item["Indicator English"],
      Dimension: dimension,
      Community: item.Community,
    });

    return acc;
  }, {});

  console.log("groupedFilteredData", groupedFilteredData);

  // D3.js statistical functions
  const votes = data.map((d) => d.T);
  console.log("votes", votes);
  // Basic statistics - D3 has built-in functions
  const mean = d3.mean(votes);
  const median = d3.median(votes);
  const min = d3.min(votes);
  const max = d3.max(votes);
  const sum = d3.sum(votes);

  console.log({ mean, median, min, max, sum });

  // Standard deviation (manual calculation)
  const variance = d3.mean(votes.map((v) => Math.pow(v - mean, 2)));
  const standardDeviation = Math.sqrt(variance);

  // Z-scores
  const zScores = data.map((d) => ({
    ...d,
    zScore: (d.T - mean) / standardDeviation,
  }));

  // Bonus: Quantiles and percentiles
  const sortedVotes = votes.sort(d3.ascending);
  const q1 = d3.quantile(sortedVotes, 0.25);
  const q3 = d3.quantile(sortedVotes, 0.75);

  console.log({ variance, standardDeviation, q1, q3 });
  console.log("zScores", zScores);
}

function draw() {
  background(220);
}

function mapToObject(map) {
  if (!(map instanceof Map)) return map; // already plain value
  return Object.fromEntries(Array.from(map, ([k, v]) => [k, mapToObject(v)]));
}
