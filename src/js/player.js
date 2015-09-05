(function(exports) {
    var ctx = exports.ctx;

    var player = {};
    player.cx = exports.canvas.width / 2;
    player.cy = exports.canvas.height / 2;
    player.dist = 10;
    player.halfBase = 10;
    player.halfHeight = 10;
    player.turnStep = Math.PI / 2;
    player.angle = 0;

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
        ctx.beginPath();
        ctx.moveTo(-hh, -hb);
        ctx.lineTo(-hh, hb);
        ctx.lineTo(hh, 0);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    };

    exports.turnPlayer = function(dir) {
        player.angle += player.turnStep * dir;
    };

    exports.playerLogic = function() {
        
    };
})(window.game);