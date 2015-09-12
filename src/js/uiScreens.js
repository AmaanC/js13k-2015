(function(exports) {
    var ctx = exports.ctx;
    var canvas = exports.canvas;
    var alpha = 0;
    var ALPHA_STEP = 0.01;
    var MAX_ALPHA = 0.5;
    var textColor = '';
    exports.endScreenDraw = function() {
        ctx.fillStyle = 'rgba(' + exports.END_OVERLAY_COLOR + ', ' + alpha + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        alpha += ALPHA_STEP;
        textColor = 'rgba(' + exports.END_TEXT_COLOR + ', ' + 2 * alpha + ')';
        exports.write('Score: ' + exports.player.score, 'center', 'center', 5, textColor);
        exports.write('Press space to restart', 'center', exports.cy + 50, 5, textColor);

        if (alpha >= MAX_ALPHA) {
            alpha = MAX_ALPHA;
        }
    };
})(window.game);