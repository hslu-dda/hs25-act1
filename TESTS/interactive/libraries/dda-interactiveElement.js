// Transform-aware optimized utility functions for coordinate conversions and hit detection
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
  let dx = (point.x - x) / (w / 2);
  let dy = (point.y - y) / (h / 2);
  return dx * dx + dy * dy <= 1;
};

p5.prototype.isPointInRect = function (point, x, y, w, h) {
  return point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
};

// Global optimization variables
let _mousePos = null;
let _lastMouseX = -1;
let _lastMouseY = -1;
let _transformCache = {
  matrix: null,
  isIdentity: true,
  lastCheck: 0,
  checkInterval: 3, // Check every 3 frames for transform changes
};

// Check if current transform is identity (no transformations applied)
p5.prototype.isIdentityTransform = function () {
  let m = this.drawingContext.getTransform();
  return m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0;
};

// Get cached transform state
p5.prototype.getTransformState = function () {
  // Only check transform state periodically to avoid performance hit
  if (this.frameCount % _transformCache.checkInterval === 0) {
    _transformCache.isIdentity = this.isIdentityTransform();
    if (!_transformCache.isIdentity) {
      _transformCache.matrix = this.drawingContext.getTransform();
    }
  }
  return _transformCache;
};

// Base InteractiveShape class with transform-aware optimizations
p5.prototype.InteractiveShape = class {
  constructor(id) {
    this.id = id || `shape_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.hover = false;
    this.clicked = false;
    this.isActive = false;
    this.wasHovering = false;

    this.color = color(255);
    this.clickColor = color(100, 100, 255);
    this.activeColor = color(100, 200, 100);
    this.hoverColor = color(0, 200, 0);

    this.blendDuration = 10;
    this.hoverBlendAmount = 0;
    this.clickBlendAmount = 0;

    // Cache colors to avoid repeated lerp calculations
    this._cachedColor = this.color;
    this._needsColorUpdate = true;

    this.onHover = null;
    this.onClick = null;

    // Bounding box for quick culling (set by subclasses)
    this.bounds = { x: 0, y: 0, w: 0, h: 0 };
    this._transformedBounds = null;
    this._boundsNeedUpdate = true;
  }

  // Update transformed bounds when transforms are active
  updateTransformedBounds() {
    if (!this._boundsNeedUpdate && _transformCache.isIdentity) return;

    if (_transformCache.isIdentity) {
      this._transformedBounds = this.bounds;
    } else {
      // Transform all four corners of bounding box to get accurate transformed bounds
      let corners = [
        this._p5.getAbsoluteCoordinates(this.bounds.x, this.bounds.y),
        this._p5.getAbsoluteCoordinates(this.bounds.x + this.bounds.w, this.bounds.y),
        this._p5.getAbsoluteCoordinates(this.bounds.x, this.bounds.y + this.bounds.h),
        this._p5.getAbsoluteCoordinates(this.bounds.x + this.bounds.w, this.bounds.y + this.bounds.h),
      ];

      let minX = Math.min(...corners.map((c) => c.x));
      let minY = Math.min(...corners.map((c) => c.y));
      let maxX = Math.max(...corners.map((c) => c.x));
      let maxY = Math.max(...corners.map((c) => c.y));

      this._transformedBounds = {
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
      };
    }
    this._boundsNeedUpdate = false;
  }

  // Quick bounding box check before expensive hit detection
  isInMouseRange() {
    if (!_mousePos) return false;

    // Update transform state and bounds if needed
    let transformState = this._p5.getTransformState();
    if (!transformState.isIdentity || this._boundsNeedUpdate) {
      this.updateTransformedBounds();
    }

    let bounds = this._transformedBounds || this.bounds;

    // Add small buffer for smoother interaction
    const buffer = 5;
    return (
      _mousePos.x >= bounds.x - buffer &&
      _mousePos.x <= bounds.x + bounds.w + buffer &&
      _mousePos.y >= bounds.y - buffer &&
      _mousePos.y <= bounds.y + bounds.h + buffer
    );
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
    // Cache mouse position globally to avoid repeated lookups
    if (!_mousePos || this._p5.mouseX !== _lastMouseX || this._p5.mouseY !== _lastMouseY) {
      _mousePos = this._p5.createVector(this._p5.mouseX, this._p5.mouseY);
      _lastMouseX = this._p5.mouseX;
      _lastMouseY = this._p5.mouseY;
    }

    // Mark bounds for update if transform state might have changed
    if (this._p5.frameCount % _transformCache.checkInterval === 0) {
      this._boundsNeedUpdate = true;
    }

    // Quick culling - skip expensive checks if mouse is far away
    if (!this.isInMouseRange()) {
      this.hover = false;
    } else {
      this.wasHovering = this.hover;
      this.hover = this.checkHover();

      // Only trigger hover callback on state change
      if (this.hover !== this.wasHovering && this.onHover) {
        this.onHover(this.hover, this);
      }
    }

    // Handle clicks
    if (this.hover && this._p5.mouseIsPressed && !this.clicked) {
      this.clicked = true;
      if (this.onClick) {
        this.onClick(this);
      }
    } else if (!this._p5.mouseIsPressed) {
      this.clicked = false;
    }

    // Only update blend amounts if they're changing
    let needsUpdate = false;

    if (this.hover && this.hoverBlendAmount < 1) {
      this.hoverBlendAmount = this._p5.min(this.hoverBlendAmount + 1 / this.blendDuration, 1);
      needsUpdate = true;
    } else if (!this.hover && this.hoverBlendAmount > 0) {
      this.hoverBlendAmount = this._p5.max(this.hoverBlendAmount - 1 / this.blendDuration, 0);
      needsUpdate = true;
    }

    if (this.clicked && this.clickBlendAmount < 1) {
      this.clickBlendAmount = this._p5.min(this.clickBlendAmount + 1 / this.blendDuration, 1);
      needsUpdate = true;
    } else if (!this.clicked && this.clickBlendAmount > 0) {
      this.clickBlendAmount = this._p5.max(this.clickBlendAmount - 1 / this.blendDuration, 0);
      needsUpdate = true;
    }

    if (needsUpdate) {
      this._needsColorUpdate = true;
    }

    return this;
  }

  draw() {
    // Only recalculate color if needed
    if (this._needsColorUpdate) {
      let baseColor = this.isActive ? this.activeColor : this.color;
      let hoverColor = this._p5.lerpColor(baseColor, this.hoverColor, this.hoverBlendAmount);
      this._cachedColor = this._p5.lerpColor(hoverColor, this.clickColor, this.clickBlendAmount);
      this._needsColorUpdate = false;
    }

    this._p5.fill(this._cachedColor);
    this.isActive ? this._p5.stroke(255, 0, 0) : this._p5.stroke(0);

    this.drawShape();
    return this;
  }

  setHoverCallback(callback) {
    this.onHover = callback;
    return this;
  }

  setClickCallback(callback) {
    this.onClick = callback;
    return this;
  }

  setIsActive(isActive) {
    if (this.isActive !== isActive) {
      this.isActive = isActive;
      this._needsColorUpdate = true;
    }
    return this;
  }

  getIsActive() {
    return this.isActive;
  }

  toggleIsActive() {
    this.isActive = !this.isActive;
    this._needsColorUpdate = true;
    return this;
  }

  setColor(col) {
    this.color = col;
    this._needsColorUpdate = true;
    return this;
  }

  setHoverColor(col) {
    this.hoverColor = col;
    this._needsColorUpdate = true;
    return this;
  }

  setClickColor(col) {
    this.clickColor = col;
    this._needsColorUpdate = true;
    return this;
  }

  setActiveColor(col) {
    this.activeColor = col;
    this._needsColorUpdate = true;
    return this;
  }

  // Force bounds recalculation (call this if you manually change shape position/size)
  invalidateBounds() {
    this._boundsNeedUpdate = true;
    return this;
  }
};

// Transform-aware Interactive Rectangle class
p5.prototype.InteractiveRect = class extends p5.prototype.InteractiveShape {
  constructor(p5Instance, x, y, w, h, id) {
    super(id);
    this._p5 = p5Instance;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Set bounding box for quick culling
    this.bounds = { x: x, y: y, w: w, h: h };
  }

  checkHover() {
    let transformState = this._p5.getTransformState();

    if (transformState.isIdentity) {
      // Fast path: no transforms, use direct comparison
      return (
        _mousePos.x >= this.x &&
        _mousePos.x <= this.x + this.w &&
        _mousePos.y >= this.y &&
        _mousePos.y <= this.y + this.h
      );
    } else {
      // Slow path: transforms active, use coordinate conversion
      let topLeft = this._p5.getAbsoluteCoordinates(this.x, this.y);
      let bottomRight = this._p5.getAbsoluteCoordinates(this.x + this.w, this.y + this.h);
      return this._p5.isPointInRect(
        _mousePos,
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
    }
  }

  drawShape() {
    this._p5.rectMode(this._p5.CORNER);
    this._p5.rect(this.x, this.y, this.w, this.h);
  }
};

// Transform-aware Interactive Circle/Ellipse class
p5.prototype.InteractiveEllipse = class extends p5.prototype.InteractiveShape {
  constructor(p5Instance, x, y, w, h, id) {
    super(id);
    this._p5 = p5Instance;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h || w;

    // Set bounding box for quick culling
    this.bounds = { x: x - w / 2, y: y - this.h / 2, w: w, h: this.h };
  }

  checkHover() {
    let transformState = this._p5.getTransformState();

    if (transformState.isIdentity) {
      // Fast path: no transforms, use direct calculation
      let dx = (_mousePos.x - this.x) / (this.w / 2);
      let dy = (_mousePos.y - this.y) / (this.h / 2);
      return dx * dx + dy * dy <= 1;
    } else {
      // Slow path: transforms active, use coordinate conversion
      let pos = this._p5.getAbsoluteCoordinates(this.x, this.y);
      return this._p5.isPointInEllipse(_mousePos, pos.x, pos.y, this.w, this.h);
    }
  }

  drawShape() {
    if (this.w === this.h) {
      this._p5.ellipse(this.x, this.y, this.w);
    } else {
      this._p5.ellipseMode(this._p5.CENTER);
      this._p5.ellipse(this.x, this.y, this.w, this.h);
    }
  }
};

// Interactive Polygon class (always uses coordinate conversion due to complexity)
p5.prototype.InteractivePolygon = class extends p5.prototype.InteractiveShape {
  constructor(p5Instance, vertices, id) {
    super(id);
    this._p5 = p5Instance;
    this.vertices = vertices;

    // Calculate bounding box
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

    this.bounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  checkHover() {
    // Polygons always use coordinate conversion due to complexity
    let screenVertices = this.vertices.map((v) => this._p5.getAbsoluteCoordinates(v.x, v.y));
    return this._p5.isPointInPolygon(_mousePos, screenVertices);
  }

  drawShape() {
    this._p5.beginShape();
    for (let vert of this.vertices) {
      this._p5.vertex(vert.x, vert.y);
    }
    this._p5.endShape(this._p5.CLOSE);
  }
};

// Factory functions
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
