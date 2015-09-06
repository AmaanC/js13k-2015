// Draws the flashing, spinning background with co-ordination from gameHandler
(function(exports) {
    var shapes = [];
    var centerX = exports.canvas.width / 2;
    var centerY = exports.canvas.height / 2;
    var ctx = exports.ctx;

    var MIN_SIZE = 35;
    var DIST_BETWEEN = 30;

    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    // Taken from http://gizma.com/easing/
    var easeInOutCirc = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        t -= 2;
        return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
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

    var duration = 90 / 1.5;
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
            obj.time++;
            if (obj.spinning) {
                obj.angle = easeInOutCirc(obj.time, obj.restAngle, exports.turnStep, duration);
                if (obj.time > duration) {
                    obj.angle = obj.restAngle;
                    obj.time = 0;
                    obj.spinning = false;
                }
            }
        };
        return obj;
    };

    var init = function() {
        shapes = [];
        var colors = '#BF0C43,#F9BA15,#8EAC00,#127A97,#452B72'.split(',');
        for (var i = 14 - 1; i >= 0; i--) {
            shapes.push(createShape(centerX, centerY, MIN_SIZE + i * DIST_BETWEEN, colors[i % colors.length]));
        };
    };

    exports.triggerSpin = function() {
        var obj;
        for (var i = 0; i < shapes.length; i++) {
            obj = shapes[i];
            obj.spinning = true;
            obj.time = 2 * i;
        }
    };

    exports.backgroundDraw = function() {
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].draw();
        };
    };

    exports.backgroundLogic = function() {
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].logic();
        };
    };

    init();

})(window.game);