(function(exports) {
    exports.keys = {};

    document.body.addEventListener('keydown', function(e) {
        exports.keys[e.keyCode] = true;
        if (exports.currentState !== 'crushing') {
            if (e.keyCode === 39) {
                exports.turnPlayer(1);
            }
            else if (e.keyCode === 37) {
                exports.turnPlayer(-1);
            }
        }
    });
    document.body.addEventListener('keyup', function(e) {
        exports.keys[e.keyCode] = false;
    });
})(window.game);