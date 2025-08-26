let geodata;
let roads;

let bounds = {
  left: 8.20782,
  top: 47.094669,
  right: 8.365691,
  bottom: 47.024504,
};

let center = {
  lon: bounds.left + 0.5 * (bounds.right - bounds.left),
  lat: bounds.bottom + 0.5 * (bounds.top - bounds.bottom),
};

let sunriseDir;

function preload() {
  geodata = loadJSON("lucerne-roads.geojson");
}

let slider;

let startDate = new Date(2022, 0, 1);
let endDate = new Date(2022, 11, 31);

let timeScale = d3.scaleLinear().domain([0, 365]).range([startDate, endDate]);

function setup() {
  createCanvas(900, 650);
  angleMode(DEGREES);
  slider = createSlider(0, 365, 0, 1);
  slider.position(10, 10);
  slider.changed(updateDate);

  currentDate = timeScale(slider.value());

  roads = geodata.features;
  console.log(roads);

  frameRate(3);

  sunDir = calcSunDir(currentDate, center.lon, center.lat);

  let v1 = createVector(1, 0);
  let v2 = createVector(-1, +0.1);
  console.log(v2.angleBetween(v1));
  noLoop();
}

function draw() {
  background(0);

  let cx = map(center.lon, bounds.left, bounds.right, 0, width);
  let cy = map(center.lat, bounds.bottom, bounds.top, height, 0);
  let centerPoint = createVector(cx, cy);
  let sunpos = p5.Vector.add(centerPoint, sunDir);

  fill(255);
  ellipse(centerPoint.x, centerPoint.y, 10, 10);

  fill(255, 255, 0);
  ellipse(sunpos.x, sunpos.y, 10, 10);

  stroke(255);
  line(cx, cy, sunpos.x, sunpos.y);

  noStroke();
  fill(255);
  text(currentDate, 200, 25);

  for (let i = 0; i < roads.length; i++) {
    let coordinates = roads[i].geometry.coordinates;

    stroke(0);
    for (let j = 0; j < coordinates.length - 1; j++) {
      let lon1 = coordinates[j][0];
      let lat1 = coordinates[j][1];
      let lon2 = coordinates[j + 1][0];
      let lat2 = coordinates[j + 1][1];

      let x1 = map(lon1, bounds.left, bounds.right, 0, width);
      let y1 = map(lat1, bounds.bottom, bounds.top, height, 0);
      let x2 = map(lon2, bounds.left, bounds.right, 0, width);
      let y2 = map(lat2, bounds.bottom, bounds.top, height, 0);

      let p1 = createVector(x1, y1);
      let p2 = createVector(x2, y2);
      let dir = p5.Vector.sub(p1, p2);
      let dir2 = p5.Vector.sub(p2, p1);

      let theta = dir.angleBetween(sunDir);
      let theta2 = dir2.angleBetween(sunDir);
      let eps = 5;
      // console.log("theta", theta, theta2);

      if (abs(theta) < eps || abs(theta2) < eps) {
        stroke(255, 255, 0, 100);
        strokeWeight(2);
      } else {
        stroke(255, 30);
        strokeWeight(1);
      }
      line(x1, y1, x2, y2);
    }
  }
}

function updateDate() {
  currentDate = timeScale(slider.value());
  console.log("currentDate", currentDate);
  sunDir = calcSunDir(currentDate, 8.309307, 47.050167);
  redraw();
}

function calcSunDir(date, lon, lat) {
  var times = SunCalc.getTimes(date, lat, lon);
  var sunPos = SunCalc.getPosition(times.sunrise, lat, lon);
  let sunHdg = degrees(sunPos.azimuth);
  let sunDir = createVector(100, 0);
  // sunDir.rotate(sunHdg - 90);
  sunDir.rotate(-sunHdg - 90);

  return sunDir;
}
