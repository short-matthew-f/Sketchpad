var Point = function (opts) {
  if (opts.isMidpoint) {
    this.isMidpoint = opts.isMidpoint;
    this.prePoint   = opts.prePoint;
    this.postPoint  = opts.postPoint;
    this.update()
  } else {
    this.x = opts.x;
    this.y = opts.y;
  };
};

Point.prototype.update = function () {
  if (this.isMidpoint) {
    this.x = Math.floor(this.prePoint.x / 2 + this.postPoint.x / 2);
    this.y = Math.floor(this.prePoint.y / 2 + this.postPoint.y / 2);
  };
};

Point.prototype.htmlClass = function () {
  var result = (this.isMidpoint ? "midpoint" : "point") +
               (this.selected ? " selected" : "");

  return result;
}

var Circle = function (opts) {
  this.centerPoint = opts.centerPoint;
  this.radiusPoint = opts.radiusPoint;
  this.update();
};

Circle.radius = function (pointOne, pointTwo) {
  var dx            = pointOne.x - pointTwo.x,
      dy            = pointOne.y - pointTwo.y,
      radiusSquared = dx * dx + dy * dy;

  return Math.floor(Math.sqrt( radiusSquared ));
}

Circle.prototype.hasPoint = function (point) {
  return this.centerPoint === point || this.radiusPoint === point;
};

Circle.prototype.update = function () {
  this.x = this.centerPoint.x;
  this.y = this.centerPoint.y;
  this.r = Circle.radius(this.centerPoint, this.radiusPoint);
};

var Line = function (opts) {
  this.start = opts.start;
  this.end   = opts.end;
};

Line.prototype.hasPoint = function (point) {
  return this.start === point || this.end === point;
};

Line.prototype.length = function () {
  var dx            = this.start.x - this.end.x,
      dy            = this.start.y - this.end.y,
      lengthSquared = dx * dx + dy * dy;

  return Math.floor(Math.sqrt( lengthSquared ));
};

Line.prototype.addMidpoint = function () {
  this.midPoint = this.midPoint || new Point({
    isMidpoint: true,
    prePoint:   this.start,
    postPoint:  this.end
  });

  return this.midPoint;
};

Line.prototype.update = function () {
  if (this.midPoint) {
    this.midPoint.update();
  };
}

Line.prototype.removeMidpoint = function () {
  delete this.midPoint;
}
