(function(exports) {
    var ctx = exports.ctx;
    var canvas = exports.canvas;
    var alpha = 0;
    exports.endScreenDraw = function() {
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        alpha += 0.01;
        exports.write('Score: ' + exports.player.score, 'center', 'center', 5, 'rgba(255, 255, 255, ' + 2 * alpha + ')');
        if (alpha >= 0.5) {
            alpha = 0.5;
        }
    };
})(window.game);