// Draws the flashing, spinning background with co-ordination from gameHandler
(function(exports) {
    var shapes = [];
    var ctx = exports.ctx;

    var MIN_SIZE = 40;
    var DIST_BETWEEN = 30;

    exports.steps = 1;

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
    var drawShape = function(x, y, side, angle, color) {

        ctx.beginPath();
        ctx.moveTo(x + side * Math.cos(angle), y + side * Math.sin(angle));
        for (var i = 1; i <= exports.sides; i++) {
            ctx.lineTo(x + side * Math.cos(angle + 2 * Math.PI * i / exports.sides), y + side * Math.sin(angle + 2 * Math.PI * i / exports.sides ));
        };
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
        obj.angle = easeInOutQuad(obj.time, obj.restAngle, exports.steps * exports.turnStep, exports.steps * duration);
        if (obj.time > duration * exports.steps) {
            obj.angle = (obj.restAngle + exports.turnStep * exports.steps) % (2 * Math.PI);
            obj.time = 0;
            obj.spinning = false;

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
            drawShape(obj.x, obj.y, obj.side, obj.angle, obj.color);
        };
        obj.logic = function() {
            exports.spinAnimate(obj);
        };
        return obj;
    };

    var init = function() {
        shapes = [];
        var colors = '#BF0C43,#F9BA15,#8EAC00,#127A97,#452B72'.split(',');
        for (var i = 14 - 1; i >= 0; i--) {
            shapes.push(createShape(exports.cx, exports.cy, MIN_SIZE + i * DIST_BETWEEN, colors[i % colors.length]));
        };
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
    };

    exports.backgroundDraw = function() {
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].draw();
        };
    };

    exports.backgroundLogic = function() {
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].spinning) {
                shapes[i].logic();
            }
        };
    };

    init();

})(window.game);