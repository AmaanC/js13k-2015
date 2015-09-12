(function(exports) {
    exports.keys = {};
    exports.playerDirection = 1; // Becomes -1 when things should be reversed

    var inputPressed = function(direction) {
        if (!exports.player.canMove) {
            return;
        }
        if (direction === 'left') {
            exports.turnPlayer(-exports.playerDirection);
        }
        else if (direction === 'right') {
            exports.turnPlayer(exports.playerDirection);
        }
    };

    document.body.addEventListener('keydown', function(e) {
        exports.keys[e.keyCode] = true;
        if (e.keyCode === 39) {
            inputPressed('right');
        }
        else if (e.keyCode === 37) {
            inputPressed('left');
        }
        else if (e.keyCode === 32 && (exports.currentState === 'endScreen' || exports.currentState === 'mainScreen')) {
            exports.reset();
        }
    });
    document.body.addEventListener('keyup', function(e) {
        exports.keys[e.keyCode] = false;
    });

    document.body.addEventListener('touchstart', function(e) {
        console.log(e.changedTouches[0].pageX);
        if (e.changedTouches[0].pageX < exports.cx) {
            inputPressed('left');
        }
        else {
            inputPressed('right');
        }
    });
})(window.game);