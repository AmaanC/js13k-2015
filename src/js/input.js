(function(exports) {
    exports.keys = {};
    exports.playerDirection = 1; // Becomes -1 when things should be reversed

    document.body.addEventListener('keydown', function(e) {
        exports.keys[e.keyCode] = true;
        if (exports.currentState !== 'crushing') {
            if (e.keyCode === 39) {
                exports.turnPlayer(exports.playerDirection);
            }
            else if (e.keyCode === 37) {
                exports.turnPlayer(-exports.playerDirection);
            }
        }
    });
    document.body.addEventListener('keyup', function(e) {
        exports.keys[e.keyCode] = false;
    });
})(window.game);