(function() {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    
    var drawLoop = function() {

        requestAnimationFrame(drawLoop);
    };
    var logicLoop = function() {

        setTimeout(logicLoop, 100 / 6);
    };

    drawLoop();
    logicLoop();
})(window.game);