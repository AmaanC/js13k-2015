(function(exports) {
    var ctx = exports.ctx;
    var canvas = exports.canvas;
    exports.endAlpha = 0;
    var ALPHA_STEP = 0.01;
    var MAX_ALPHA = 0.5;
    var textColor = '';
    exports.musicX = canvas.width - 40;
    exports.musicY = 60;
    var musicHeight = 50;

    exports.controlsDraw = function() {
        textColor = exports.musicEnabled ? exports.MUSIC_ENABLED_COLOR : exports.MUSIC_DISABLED_COLOR;
        exports.write('#', exports.musicX, exports.musicY - musicHeight, 5, textColor);
    };

    exports.mainScreenDraw = function() {
        ctx.fillStyle = 'rgba(' + exports.MAIN_OVERLAY_RGBA + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        exports.controlsDraw();

        textColor = exports.MAIN_TEXT_COLOR;
        exports.write('Press space to play', 'center', 'center', 8, textColor);
        exports.write('Seizure warning', 'center', exports.cy + 50, 3, textColor);
        exports.write('A game by @AmaanC and @mikedidthis', 'center', canvas.height - 40, 5, textColor);
        
        if (exports.allShapesDoneSpinning) {
            exports.triggerSpin(exports.sides);
        }
    };

    exports.endScreenDraw = function() {
        ctx.fillStyle = 'rgba(' + exports.END_OVERLAY_COLOR + ', ' + exports.endAlpha + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        exports.endAlpha += ALPHA_STEP;
        textColor = 'rgba(' + exports.END_TEXT_COLOR + ', ' + 2 * exports.endAlpha + ')';
        exports.write('Score: ' + exports.player.score, 'center', 'center', 5, textColor);
        exports.write('Press space to restart', 'center', exports.cy + 50, 5, textColor);

        if (exports.endAlpha >= MAX_ALPHA) {
            exports.endAlpha = MAX_ALPHA;
        }
    };
})(window.game);