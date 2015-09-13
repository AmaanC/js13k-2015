(function(exports) {
    var canvas = exports.canvas = document.getElementById('game');
    var ctx = exports.ctx = canvas.getContext('2d');
    var widthToHeight = canvas.width / canvas.height;
    var CANVAS_WIDTH = canvas.width;
    var CANVAS_HEIGHT = canvas.height;
    exports.ratio = 1;
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

    var resize = function() {
        if (CANVAS_WIDTH > window.innerWidth || CANVAS_HEIGHT > window.innerHeight) {
            if (window.innerWidth > window.innerHeight * widthToHeight) {
                exports.ratio = window.innerHeight / CANVAS_HEIGHT;
                canvas.width *= window.innerHeight / canvas.height;
                canvas.height = window.innerHeight;
            }
            else {
                exports.ratio = window.innerWidth / CANVAS_WIDTH;
                canvas.height *= window.innerWidth / canvas.width;
                canvas.width = window.innerWidth;
            }
            document.body.style.margin = 0;
        }
        exports.smallerDimension = Math.min(canvas.width, canvas.height); // Used to determine where the enemies should wait
        exports.cx = canvas.width / 2;
        exports.cy = canvas.height / 2;
    };

    var init = function() {
        drawLoop();
        logicLoop();
        resize();
    };

    window.addEventListener('load', init, false);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
})(window.game);