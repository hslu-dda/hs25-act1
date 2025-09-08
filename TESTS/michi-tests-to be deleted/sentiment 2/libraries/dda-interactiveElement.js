// Utility functions for coordinate conversions and hit detection
p5.prototype.getAbsoluteCoordinates = function (x, y) {
  let pos = this.createVector(x, y);
  return this.screenPosition(pos);
};

p5.prototype.screenPosition = function (point) {
  let m = this.drawingContext.getTransform();
  let tx = m.a * point.x + m.c * point.y + m.e;
  let ty = m.b * point.x + m.d * point.y + m.f;
  return this.createVector(tx / this.pixelDensity(), ty / this.pixelDensity());
};

p5.prototype.isPointInPolygon = function (point, polygon) {
  let x = point.x,
    y = point.y;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x,
      yi = polygon[i].y;
    let xj = polygon[j].x,
      yj = polygon[j].y;
    let intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

p5.prototype.isPointInEllipse = function (point, x, y, w, h) {
  // For circle w and h are the same (diameter)
  // For ellipse w is width and h is height
  let dx = (point.x - x) / (w / 2);
  let dy = (point.y - y) / (h / 2);
  return dx * dx + dy * dy <= 1;
};

p5.prototype.isPointInRect = function (point, x, y, w, h) {
  return point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
};

// Base InteractiveShape class
p5.prototype.InteractiveShape = class {
  constructor(id) {
    this.id = id || `shape_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.hover = false;
    this.clicked = false;
    this.isActive = false;

    this.color = color(255);
    this.clickColor = color(100, 100, 255);
    this.activeColor = color(100, 200, 100);
    this.hoverColor = color(0, 200, 0);

    this.blendDuration = 10;
    this.hoverBlendAmount = 0;
    this.clickBlendAmount = 0;

    this.onHover = null;
    this.onClick = null;
  }

  // This should be overridden by subclasses
  checkHover() {
    console.error("checkHover must be implemented by subclasses");
    return false;
  }

  // This should be overridden by subclasses
  drawShape() {
    console.error("drawShape must be implemented by subclasses");
  }

  update() {
    let wasHovering = this.hover;

    // Use the subclass implementation to check for hover
    this.hover = this.checkHover();

    if (this.hover !== wasHovering && this.onHover) {
      this.onHover(this.hover, this);
    }

    if (this.hover && this._p5.mouseIsPressed && !this.clicked) {
      this.clicked = true;
      if (this.onClick) {
        this.onClick(this);
      }
    } else if (!this._p5.mouseIsPressed) {
      this.clicked = false;
    }

    // Update hover blend amount
    if (this.hover && this.hoverBlendAmount < 1) {
      this.hoverBlendAmount = this._p5.min(this.hoverBlendAmount + 1 / this.blendDuration, 1);
    } else if (!this.hover && this.hoverBlendAmount > 0) {
      this.hoverBlendAmount = this._p5.max(this.hoverBlendAmount - 1 / this.blendDuration, 0);
    }

    // Update click blend amount
    if (this.clicked && this.clickBlendAmount < 1) {
      this.clickBlendAmount = this._p5.min(this.clickBlendAmount + 1 / this.blendDuration, 1);
    } else if (!this.clicked && this.clickBlendAmount > 0) {
      this.clickBlendAmount = this._p5.max(this.clickBlendAmount - 1 / this.blendDuration, 0);
    }

    return this; // Enable method chaining
  }

  draw() {
    let baseColor = this.isActive ? this.activeColor : this.color;
    let hoverColor = this._p5.lerpColor(baseColor, this.hoverColor, this.hoverBlendAmount);
    let finalColor = this._p5.lerpColor(hoverColor, this.clickColor, this.clickBlendAmount);

    this._p5.fill(finalColor);
    this.isActive ? this._p5.stroke(255, 0, 0) : this._p5.stroke(0);

    // Call the subclass implementation to draw the shape
    this.drawShape();

    return this; // Enable method chaining
  }

  setHoverCallback(callback) {
    this.onHover = callback;
    return this; // Enable method chaining
  }

  setClickCallback(callback) {
    this.onClick = callback;
    return this; // Enable method chaining
  }

  setIsActive(isActive) {
    this.isActive = isActive;
    return this; // Enable method chaining
  }

  toggleIsActive() {
    this.isActive = !this.isActive;
    return this; // Enable method chaining
  }

  setColor(col) {
    this.color = col;
    return this; // Enable method chaining
  }

  setHoverColor(col) {
    this.hoverColor = col;
    return this; // Enable method chaining
  }

  setClickColor(col) {
    this.clickColor = col;
    return this; // Enable method chaining
  }

  setActiveColor(col) {
    this.activeColor = col;
    return this; // Enable method chaining
  }
};

// Interactive Circle/Ellipse class
p5.prototype.InteractiveEllipse = class extends p5.prototype.InteractiveShape {
  constructor(p5Instance, x, y, w, h, id) {
    super(id);
    this._p5 = p5Instance;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h || w; // If h is not provided, make it a circle with w as diameter
  }

  checkHover() {
    let mousePos = this._p5.createVector(this._p5.mouseX, this._p5.mouseY);
    let pos = this._p5.getAbsoluteCoordinates(this.x, this.y);
    return this._p5.isPointInEllipse(mousePos, pos.x, pos.y, this.w, this.h);
  }

  drawShape() {
    if (this.w === this.h) {
      // If width equals height, it's a circle
      this._p5.ellipse(this.x, this.y, this.w);
    } else {
      // Otherwise it's an ellipse
      this._p5.ellipseMode(this._p5.CENTER);
      this._p5.ellipse(this.x, this.y, this.w, this.h);
    }
  }
};

// Interactive Rectangle class
p5.prototype.InteractiveRect = class extends p5.prototype.InteractiveShape {
  constructor(p5Instance, x, y, w, h, id) {
    super(id);
    this._p5 = p5Instance;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  checkHover() {
    let mousePos = this._p5.createVector(this._p5.mouseX, this._p5.mouseY);
    let topLeft = this._p5.getAbsoluteCoordinates(this.x, this.y);
    let bottomRight = this._p5.getAbsoluteCoordinates(this.x + this.w, this.y + this.h);

    return this._p5.isPointInRect(mousePos, topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
  }

  drawShape() {
    this._p5.rectMode(this._p5.CORNER);
    this._p5.rect(this.x, this.y, this.w, this.h);
  }
};

// Interactive Polygon class
p5.prototype.InteractivePolygon = class extends p5.prototype.InteractiveShape {
  constructor(p5Instance, vertices, id) {
    super(id);
    this._p5 = p5Instance;
    this.vertices = vertices;

    // Calculate the bounding box for reference (useful for some operations)
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (let v of vertices) {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
    }

    this.x = minX;
    this.y = minY;
    this.w = maxX - minX;
    this.h = maxY - minY;
  }

  checkHover() {
    let mousePos = this._p5.createVector(this._p5.mouseX, this._p5.mouseY);
    let screenVertices = this.vertices.map((v) => this._p5.getAbsoluteCoordinates(v.x, v.y));
    return this._p5.isPointInPolygon(mousePos, screenVertices);
  }

  drawShape() {
    this._p5.beginShape();
    for (let vert of this.vertices) {
      this._p5.vertex(vert.x, vert.y);
    }
    this._p5.endShape(this._p5.CLOSE);
  }
};

// Factory functions for creating interactive shapes in p5.js style
p5.prototype.interactiveCircle = function (x, y, diameter, id) {
  return new this.InteractiveEllipse(this, x, y, diameter, diameter, id);
};

p5.prototype.interactiveEllipse = function (x, y, w, h, id) {
  return new this.InteractiveEllipse(this, x, y, w, h, id);
};

p5.prototype.interactiveRect = function (x, y, w, h, id) {
  return new this.InteractiveRect(this, x, y, w, h, id);
};

p5.prototype.interactivePolygon = function (vertices, id) {
  return new this.InteractivePolygon(this, vertices, id);
};
