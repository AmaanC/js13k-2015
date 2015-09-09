(function(exports) {
    var canvas = exports.canvas = document.getElementById('game');
    var ctx = exports.ctx = canvas.getContext('2d');
    if (window.innerWidth < canvas.width) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.style.margin = 0;
    }
    exports.cx = canvas.width / 2;
    exports.cy = canvas.height / 2;

    var drawLoop = function() {
        exports.backgroundDraw();
        exports.playerDraw();
        exports.particleDraw();
        exports.enemyDraw();

        requestAnimationFrame(drawLoop);
    };

    var logicLoop = function() {
        exports.backgroundLogic();
        exports.particleLogic();
        exports.enemyLogic();

        setTimeout(logicLoop, 100 / 6);
    };

    var init = function() {
        drawLoop();
        logicLoop();
    };

    window.addEventListener('load', init, false);
})(window.game);