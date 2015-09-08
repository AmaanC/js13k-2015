(function(exports) {
    exports.keys = {};
    exports.playerDirection = 1; // Becomes -1 when things should be reversed

    var inputPressed = function(direction) {
        if (direction === 'left') {
            exports.turnPlayer(exports.playerDirection);
        }
        else if (direction === 'right') {
            exports.turnPlayer(-exports.playerDirection);
        }
    };

    document.body.addEventListener('keydown', function(e) {
        exports.keys[e.keyCode] = true;
        if (exports.player.canMove) {
            if (e.keyCode === 39) {
                inputPressed('left');
            }
            else if (e.keyCode === 37) {
                inputPressed('right');
            }
        }
    });
    document.body.addEventListener('keyup', function(e) {
        exports.keys[e.keyCode] = false;
    });

    document.body.addEventListener('touchstart', function(e) {
        if (e.changedTouches[0].pageX < exports.cx) {
            inputPressed('left');
        }
        else {
            inputPressed('right');
        }
    });
})(window.game);