(function(exports) {
    var ctx = exports.ctx;

    var player = {};
    exports.player = player;
    player.cx = 30;
    player.cy = 50;
    player.dist = 10;
    player.halfBase = 10;
    player.halfHeight = 10;
    player.angle = Math.PI * 0;

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

    exports.playerLogic = function() {
        
    };
})(window.game);