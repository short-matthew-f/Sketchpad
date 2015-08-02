var Point = function (opts) {
  if (opts.isMidpoint || opts.isDivider) {
    this.isMidpoint = opts.isMidpoint;
    this.isDivider  = opts.isDivider;
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
  return (this.isDivider ? "undraggable" : "point") +
         (this.selected ? " selected" : "");
}

var Circle = function (opts) {
  this.centerPoint = opts.centerPoint;
  this.radiusPoint = opts.radiusPoint;

  this.dividers = [];
  this.update();
};

Circle.radius = function (pointOne, pointTwo) {
  var dx            = pointOne.x - pointTwo.x,
      dy            = pointOne.y - pointTwo.y,
      radiusSquared = dx * dx + dy * dy;

  return Math.floor(Math.sqrt( radiusSquared ));
}

Circle.theta = function (c, r) {
  var dy = c.y - r.y,
      dx = c.x - r.x;

  return Math.atan2(dy, dx);
};

Circle.prototype.needsPoint = function (point) {
  return this.centerPoint === point || this.radiusPoint === point;
};

Circle.prototype.update = function () {
  this.x = this.centerPoint.x;
  this.y = this.centerPoint.y;

  this.r = Circle.radius(this.centerPoint, this.radiusPoint);

  this.theta = Circle.theta(this.centerPoint, this.radiusPoint);
  var angle = 2 * Math.PI / (this.dividers.length + 1);

  this.dividers.forEach(function (point, i) {
    var newAngle = this.theta + (i + 1) * angle;
    var dx = Math.floor(this.r * Math.cos(this.theta + (i + 1) * angle)),
        dy = Math.floor(this.r * Math.sin(this.theta + (i + 1) * angle));

    point.x = this.x - dx;
    point.y = this.y - dy;
  }.bind(this));
};

Circle.prototype.addDivider = function () {
  var newDivider = new Point({
    x: this.radiusPoint.x,
    y: this.radiusPoint.y,
    isDivider: true
  });

  this.dividers.push( newDivider );
  this.update();

  return newDivider;
}

var Line = function (opts) {
  this.start    = opts.start;
  this.end      = opts.end;
  this.dividers = [];
};

Line.prototype.needsPoint = function (point) {
  return this.start === point || this.end === point;
};

Line.prototype.length = function () {
  var dx            = this.start.x - this.end.x,
      dy            = this.start.y - this.end.y,
      lengthSquared = dx * dx + dy * dy;

  return Math.floor(Math.sqrt( lengthSquared ));
};

Line.prototype.addDivider = function () {
  var newDivider = new Point({
    x: this.start.x,
    y: this.start.y,
    isDivider: true
  });

  this.dividers.push( newDivider );
  this.update();

  return newDivider;
};

Line.prototype.update = function () {
  var segments = this.dividers.length + 1,
      dx       = (this.end.x - this.start.x) / segments,
      dy       = (this.end.y - this.start.y) / segments;

  this.dividers.forEach(function (divider, i) {
    divider.x = this.start.x + (i + 1) * dx;
    divider.y = this.start.y + (i + 1) * dy;
  }.bind(this));
}
