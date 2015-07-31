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
    console.log(this.initiatingObject);

    if (!this.initiatingObject) {
      this.initiatingObject = obj;
      return;
    } else if (this.initiatingObject instanceof Point) {
      var point = this.initiatingObject;
      var index = this.points.indexOf(point);

      // destroy the point
      this.points.splice(index, 1);

      // and circles which need it
      var index = 0;
      while (index < this.circles.length) {
        var circle = this.circles[index];
        if (circle.hasPoint(point)) {
          this.circles.splice(index, 1);
          index--;
        }
        index++;
      }

      // and lines which need it
      var index = 0;
      while (index < this.lines.length) {
        var line = this.lines[index];
        if (line.hasPoint(point)) {
          this.lines.splice(index, 1);
          index--;
        }
        index++;
      }
    } else if (this.initiatingObject instanceof Circle) {
      var circle = this.initiatingObject;
      var index = this.circles.indexOf(circle);
      this.circles.splice(index, 1);
    } else if (this.initiatingObject instanceof Line) {
      var line = this.initiatingObject;
      var index = this.lines.indexOf(line);
      this.lines.splice(index, 1);

      if (line.midPoint) {
        var index = this.points.indexOf(line.midPoint);
        this.points.splice(index);
      }
    }

    this.initiatingObject = undefined;
  },

  'addPoints': function ($event, obj) {
    if (obj instanceof Line) {
      var point = obj.addMidpoint();
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
