var app = angular.module("Sketchpad", []);

var clickFunctions = {
  'addCircles': function ($event, obj) {
    var newPoint = new Point({ x: $event.offsetX, y: $event.offsetY });

    if (obj instanceof Point) {
      this.initiatingObject = obj;
      this.pendingPoints.push(obj);
      return;
    } else if (obj) {
      this.initiatingObject = newPoint;
      this.points.push(newPoint);
      this.pendingPoints.push(newPoint);
      return;
    } else if (!this.initiatingObject) {
      this.initiatingObject = newPoint;
      this.points.push(newPoint);
      this.pendingPoints.push(newPoint);
    }

    this.initiatingObject = undefined;

    if (this.pendingPoints.length === 2) {
      var newCircle = new Circle({
        centerPoint: this.pendingPoints[0],
        radiusPoint: this.pendingPoints[1]
      });
      this.pendingPoints = [];
      this.circles.push(newCircle);
    }
  },

  'addLines': function ($event, obj) {
    var newPoint = new Point({ x: $event.offsetX, y: $event.offsetY });

    if (obj instanceof Point) {
      this.initiatingObject = obj;
      this.pendingPoints.push(obj);
      return;
    } else if (obj) {
      this.initiatingObject = newPoint;
      this.points.push(newPoint);
      this.pendingPoints.push(newPoint);
      return;
    } else if (!this.initiatingObject) {
      this.initiatingObject = newPoint;
      this.points.push(newPoint);
      this.pendingPoints.push(newPoint);
    }

    this.initiatingObject = undefined;

    if (this.pendingPoints.length === 2) {
      var newLine = new Line({
        start: this.pendingPoints[0],
        end: this.pendingPoints[1]
      });
      this.pendingPoints = [];
      this.lines.push(newLine);
    }
  },

  'select': function ($event, obj) {
    if (obj instanceof Point && !obj.isMidpoint) {
      this.activeObject = obj;
      this.activeObject.isDraggable = true;
    };
  },

  'delete': function ($event, obj) {
    if (obj instanceof Point) {
      var point = obj;
      var index = this.points.indexOf(point);

      // destroy the point
      this.points.splice(index, 1);

      // and circles which need it
      this.circles.forEach(function (circle) {
        if ( circle.needsPoint(point) ) {
          clickFunctions['delete'].call(this, $event, circle);
        } else {
          index = circle.dividers.indexOf(point);
          if ( index > -1 ) {
            circle.dividers.splice(index, 1);
            circle.update();
          }
        }
      }.bind(this));

      // and lines which need it
      this.lines.forEach(function (line) {
        if ( line.needsPoint(point) ) {
          clickFunctions['delete'].call(this, $event, line);
        } else {
          index = line.dividers.indexOf(point);
          if ( index > -1 ) {
            line.dividers.splice(index, 1);
            line.update();
          }
        }
      }.bind(this));
    } else if (obj instanceof Circle) {
      var circle = obj;
      var index = this.circles.indexOf(circle);
      this.circles.splice(index, 1);

      circle.dividers.forEach(function (point) {
        clickFunctions['delete'].call(this, $event, point);
      }.bind(this));

      circle.dividers = [];
    } else if (obj instanceof Line) {
      var line = obj;
      var index = this.lines.indexOf(line);
      this.lines.splice(index, 1);

      line.dividers.forEach(function (point) {
        clickFunctions['delete'].call(this, $event, point);
      }.bind(this));
    }
  },

  'addPoints': function ($event, obj) {
    if (obj instanceof Line || obj instanceof Circle) {
      var point = obj.addDivider();
      this.points.push(point);
      this.initiatingObject = obj;
    } else if (!this.initiatingObject) {
      var point = new Point({
        x: $event.offsetX,
        y: $event.offsetY
      });

      this.points.push(point);
      this.initiatingObject = undefined;
    } else {
      this.initiatingObject = undefined;
    }
  }
}

app.controller('GeometryController', function () {
  // Classes for class methods
  this.Circle = Circle;
  this.Point = Point;
  this.Line = Line;

  // default modes
  this.mode = "addPoints";
  this.showPoints = true;

  // main storage for drawing
  this.points = [];
  this.lines = [];
  this.circles = [];

  // this will allow us to be more dynamic about how we build points
  this.pendingPoints = [];

  // this will be undefined unless a non-svg object has triggered an event
  this.initiatingObject;

  var controller = this;

  this.radiusFor = function (circle) {
    return Math.floor(
      Math.sqrt(
        Math.pow(circle.centerPoint.cx - circle.radiusPoint.cx, 2) + Math.pow(circle.centerPoint.cy - circle.radiusPoint.cy, 2)
      )
    )
  }

  this.controlClass = function (base, mode) {
    return base + (this.mode === mode ? " selected" : "");
  };

  this.registerClick = function ($event, obj) {
    clickFunctions[this.mode].apply(this, arguments);
  };

  this.releaseClick = function ($event, originator, obj) {
    if (this.activeObject) {
      this.activeObject.isDraggable = false;
      this.activeObject = undefined;
    }
  };

  this.registerMotion = function ($event, originator, obj) {
    this.mousePosition = {
      x: $event.offsetX,
      y: $event.offsetY
    }

    if (this.activeObject && this.activeObject.isDraggable) {
      this.activeObject.x = this.mousePosition.x;
      this.activeObject.y = this.mousePosition.y;
      this.updateRelatedObjects(this.activeObject);
    }
  };

  this.updateRelatedObjects = function (point) {
    this.circles.forEach(function (circle) {
      circle.update();
    });

    this.lines.forEach(function (line) {
      line.update();
    });
  };
});
