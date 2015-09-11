// Draws the flashing, spinning background with co-ordination from gameHandler
(function(exports) {
    var shapes = [];
    var ctx = exports.ctx;

    var DEFAULT_COLORS = ['#BF0C43', '#F9BA15', '#8EAC00', '#127A97', '#452B72'];

    var minSize = exports.player.dist * 2;
    var DIST_BETWEEN = 50;

    exports.NUM_SHAPES = 20;
    exports.steps = 1;
    exports.allShapesDoneSpinning = true;

    exports.indicatorObj = {}; // It indicates how many waves you've crossed by highlighting the center shape
    var INDICATOR_COLOR = 'white';

    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    // Taken from http://gizma.com/easing/
    var easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };



    // x, y are the center co-ordinates of the shape
    var drawShape = function(x, y, centerDist, angle, color, numSides) {
        var side = centerDist / (2 * Math.cos(exports.turnStep / 2));
        if (numSides <= 0) {
            return;
        }
        numSides = numSides || exports.sides;
        ctx.beginPath();
        ctx.moveTo(x + side * Math.cos(angle), y + side * Math.sin(angle));
        for (var i = 1; i <= numSides; i++) {
            ctx.lineTo(x + side * Math.cos(angle + i * exports.turnStep), y + side * Math.sin(angle + i * exports.turnStep));
        };
        ctx.lineTo(x, y);
        ctx.closePath();

        ctx.fillStyle = color || 'green';
        ctx.fill();
    };

    var duration = 70;
    exports.spinAnimate = function(obj, cb) {
        obj.time++;
        if (typeof obj.restAngle === 'undefined') {
            obj.restAngle = obj.angle;
        }
        var absSteps = Math.abs(exports.steps);
        obj.angle = easeInOutQuad(obj.time, obj.restAngle, exports.steps * exports.turnStep, absSteps * duration);
        if (obj.time > duration * absSteps) {
            obj.angle = (obj.restAngle + exports.turnStep * exports.steps) % (2 * Math.PI);
            obj.time = 0;
            obj.spinning = false;
            if (obj === exports.indicatorObj) {
                // obj.restAngle = obj.angle;
            }
            if (cb) {
                cb();
            }
        }
    };

    var createShape = function(x, y, side, color) {
        var obj = {};
        obj.x = x;
        obj.y = y;
        obj.side = side;
        obj.restAngle = Math.PI / exports.sides;
        obj.angle = obj.restAngle;
        obj.color = color;
        obj.time = 0;
        obj.draw = function() {
            drawShape(obj.x, obj.y, obj.side, obj.angle, obj.color, obj.numSides); // obj.numSides is set manually in initBackground
        };
        obj.logic = function() {
            exports.spinAnimate(obj);
        };
        return obj;
    };

    exports.initBackground = function() {
        shapes = [];
        var colors = DEFAULT_COLORS;
        for (var i = exports.NUM_SHAPES - 1; i >= 0; i--) {
            shapes.push(createShape(exports.cx, exports.cy, minSize + i * DIST_BETWEEN, colors[i % colors.length]));
        };
        exports.indicatorObj = createShape(exports.cx, exports.cy, minSize, INDICATOR_COLOR);
        exports.indicatorObj.numSides = 0;
    };

    exports.triggerSpin = function(step) {
        var obj;
        exports.steps = step;
        exports.spinning = true;
        
        for (var i = 0; i < shapes.length; i++) {
            obj = shapes[i];
            obj.spinning = true;
            obj.time = i;
        }
        exports.indicatorObj.spinning = true;
        exports.indicatorObj.time = i - 1;
        exports.indicatorObj.restAngle = exports.indicatorObj.angle;
    };

    exports.backgroundDraw = function() {
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].draw();
        };
        exports.indicatorObj.draw();
    };

    exports.backgroundLogic = function() {
        exports.allShapesDoneSpinning = true;
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].spinning) {
                exports.allShapesDoneSpinning = false;
                shapes[i].logic();
            }
        };
        if (exports.indicatorObj.spinning) {
            exports.indicatorObj.logic();
        }
    };

    exports.initBackground();

})(window.game);