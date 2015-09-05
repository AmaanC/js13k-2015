(function(exports) {
    var ctx = exports.ctx;

    var player = {};
    exports.player = player;
    player.cx = exports.cx;
    player.cy = exports.cy;
    player.dist = 30;
    player.halfBase = 10;
    player.halfHeight = 10;
    player.angle = 0;
    player.pos = 0; // This indicates which multiple of turnStep it is. For example, with 4 sides, player would point down when pos is 1
    player.color = '13,213,252';

    exports.playerDraw = function() {
        var cx = player.cx;
        var cy = player.cy;
        var hb = player.halfBase;
        var hh = player.halfHeight;
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
        ctx.strokeStyle = 'rgba('+player.color+', 1)';
        ctx.stroke();

        // Shadow
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba('+player.color+', 0.25)';

        // Fill
        ctx.fillStyle = 'rgba('+player.color+', 0)';
        ctx.fill();

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

    exports.playerLogic = function() {

    };
})(window.game);