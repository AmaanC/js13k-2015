(function(exports) {
    var ctx = exports.ctx;

    var ticks = 0;
    var ticksTillBlink = 15;
    var immuneAlpha = 0.5;

    var player = {};
    exports.player = player;
    player.cx = exports.cx;
    player.cy = exports.cy;
    player.dist = 40;
    player.halfBase = 10;
    player.halfHeight = 10;
    player.angle = 0;
    player.pos = 0; // This indicates which multiple of turnStep it is. For example, with 4 sides, player would point down when pos is 1
    player.color = '13,213,252';
    player.alpha = 1;
    player.immune = true; // The player is immune in the beginning so he can observe the pattern

    exports.playerDraw = function() {
        var cx = player.cx;
        var cy = player.cy;
        var hb = player.halfBase;
        var hh = player.halfHeight;
        var alpha = player.immune ? immuneAlpha : player.alpha;

        ticks++;
        if (ticks > ticksTillBlink) {
            ticks = 0;
            if (player.immune) {
                if (immuneAlpha === 0.5) {
                    immuneAlpha = 1;
                }
                else {
                    immuneAlpha = 0.5;
                }
            }
        }

        ctx.save();

        ctx.translate(cx, cy);
        ctx.rotate(player.angle);

        // The triangle points to the right by default
        ctx.translate(player.dist + hh, 0);

        // Draw path
        ctx.beginPath();
        ctx.moveTo(-hh, -hb);
        ctx.lineTo(-hh, hb);
        ctx.lineTo(hh, 0);
        ctx.closePath();
        ctx.restore();

        // Stroke
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(' + player.color + ', ' + alpha + ')';
        ctx.stroke();

    };

    exports.turnPlayer = function(dir) {
        player.pos += dir;
        if (player.pos >= exports.sides) {
            player.pos = 0;
        }
        if (player.pos < 0) {
            player.pos = exports.sides - 1;
        }
        player.angle = exports.turnStep * player.pos;
    };

    exports.reversePlayerControls = function() {
        exports.playerDirection *= -1;
        if (exports.playerDirection > 0) {
            exports.ctx.globalCompositeOperation = 'source-over';
        }
        else {
            exports.ctx.globalCompositeOperation = 'difference';
        }
    };

})(window.game);