class Data {
  constructor(data) {
    this.data = data;
    this.sentiment = 0;
    this.position = createVector(0, 0);
  }

  update() {}
  draw() {
    fill(255);
    rect(this.position.x, this.position.y, rectWidth, rectHeight);
  }

  setSentiment(sentiment) {
    this.sentiment = sentiment;
  }
}
