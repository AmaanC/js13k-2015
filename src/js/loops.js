(function(exports) {
    var canvas = exports.canvas = document.getElementById('game');
    var ctx = exports.ctx = canvas.getContext('2d');
    exports.ratio = 1;
    if (canvas.width > window.innerWidth || canvas.height > window.innerHeight) {
        exports.ratio = window.innerWidth / canvas.width;
        canvas.height *= window.innerWidth / canvas.width;
        canvas.width = window.innerWidth;
        document.body.style.margin = 0;
    }
    exports.smallerDimension = Math.min(canvas.width, canvas.height); // Used to determine where the enemies should wait
    exports.cx = canvas.width / 2;
    exports.cy = canvas.height / 2;
    exports.player = {};

    var drawLoop = function() {
        if (exports.currentState === 'mainScreen') {
            exports.backgroundDraw();
            exports.mainScreenDraw();
        }
        else {
            exports.backgroundDraw();
            exports.playerDraw();
            exports.particleDraw();
            exports.enemyDraw();

            if (exports.currentState === 'endScreen') {
                exports.endScreenDraw();
            }
        }
        exports.controlsDraw();

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