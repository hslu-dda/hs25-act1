let origin, vecA, vecB;

function setup() {
  createCanvas(600, 600);
  origin = createVector(width / 2, height / 2);
  vecA = createVector(200, 0);
  vecB = createVector(150, -100);
  textFont('Arial');
}

function draw() {
  background(245);

  // Mausposition bestimmt Richtung von Vektor B
  vecB = createVector(mouseX - origin.x, mouseY - origin.y);

  // Berechnungen
  let dot = vecA.dot(vecB);
  let magA = vecA.mag();
  let magB = vecB.mag();
  let cosSim = dot / (magA * magB);
  let angle = degrees(acos(cosSim));

  // Achsen
  stroke(220);
  line(origin.x, 0, origin.x, height);
  line(0, origin.y, width, origin.y);

  // Vektoren
  strokeWeight(3);
  stroke(255, 0, 0);
  line(origin.x, origin.y, origin.x + vecA.x, origin.y + vecA.y);
  stroke(0, 100, 255);
  line(origin.x, origin.y, origin.x + vecB.x, origin.y + vecB.y);

  // Beschriftung
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT);
  text("→ Zieh die Maus, um den Winkel zu verändern", 20, 30);

  textAlign(LEFT);
  textSize(14);
  text(`dot(a,b): ${dot.toFixed(2)}`, 20, height - 80);
  text(`|a|: ${magA.toFixed(2)}  |b|: ${magB.toFixed(2)}`, 20, height - 60);
  text(`cos(θ): ${cosSim.toFixed(3)}`, 20, height - 40);
  text(`θ: ${angle.toFixed(1)}°`, 20, height - 20);

  // Kosinuswert visualisieren (Skala von -1 bis 1)
  let barX = width - 200;
  let barY = height - 100;
  noStroke();
  fill(230);
  rect(barX, barY, 150, 20, 5);
  fill(map(cosSim, -1, 1, 255, 0), map(cosSim, -1, 1, 0, 255), 100);
  let xOffset = map(cosSim, -1, 1, barX, barX + 150);
  ellipse(xOffset, barY + 10, 15, 15);
  fill(0);
  textAlign(CENTER);
  text("cos(θ)", barX + 75, barY - 5);
}
