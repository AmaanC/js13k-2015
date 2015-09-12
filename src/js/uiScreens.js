(function(exports) {
    var ctx = exports.ctx;
    var canvas = exports.canvas;
    var alpha = 0;
    exports.endScreenDraw = function() {
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')'
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        alpha += 0.01;
        if (alpha >= 0.5) {
            alpha = 0.5;
            exports.write('Score: ' + exports.player.score, 'center', 'center', 5, 'white');
        }
    };
})(window.game);