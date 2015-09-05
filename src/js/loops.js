(function(exports) {
    var canvas = exports.canvas = document.getElementById('game');
    var ctx = exports.ctx = canvas.getContext('2d');
    
    var drawLoop = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        exports.playerDraw();

        requestAnimationFrame(drawLoop);
    };

    var logicLoop = function() {
        exports.playerLogic();

        setTimeout(logicLoop, 100 / 6);
    };

    var init = function() {
        drawLoop();
        logicLoop();
    };

    window.addEventListener('load', init, false);
})(window.game);