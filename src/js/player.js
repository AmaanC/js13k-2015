(function(exports) {
    var ctx = exports.ctx;

    var player = exports.player;
    player.cx = exports.cx;
    player.cy = exports.cy;
    player.time = 0;
    player.dist = 40;
    player.halfBase = 10;
    player.halfHeight = 10;
    player.angle = 0;
    player.canMove = true;
    player.pos = 0; // This indicates which multiple of turnStep it is. For example, with 4 sides, player would point down when pos is 1
    player.alpha = 1;
    player.DEFAULT_NUM_SHIELDS = 1;
    player.numShields = player.DEFAULT_NUM_SHIELDS; // Shields are automatically drawn with the player
    player.score = 0;
    var DIST_BETWEEN_SHIELDS = 20;
    var shieldMinDist = player.dist + 2 * player.halfHeight;
    var SHIELD_COLOR = 'white';
    var SHIELD_RANGE = 0.4;

    player.hidePlayer = function() {
        player.alpha = 0;
        setTimeout(function() {
            player.color = player.skins.default;
        }, 1000);
    };

    player.isColliding = function(objCenterDist) {
        // Only in terms of distance, not in position
        if (
            (player.numShields <= 0 && objCenterDist <= player.dist) ||
            (player.numShields > 0 && objCenterDist <= player.numShields * DIST_BETWEEN_SHIELDS + shieldMinDist)
        ) {
            return true;
        }
        return false;
    };

    var shieldDraw = function() {
        ctx.strokeStyle = SHIELD_COLOR;
        for (var i = 1; i <= player.numShields; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, shieldMinDist + i * DIST_BETWEEN_SHIELDS, -SHIELD_RANGE, SHIELD_RANGE, false);
            ctx.closePath();
            ctx.stroke();
        }
    };

    exports.playerDraw = function() {
        var cx = player.cx;
        var cy = player.cy;
        var hb = player.halfBase;
        var hh = player.halfHeight;
        ctx.save();

        ctx.translate(cx, cy);
        ctx.rotate(player.angle);
        shieldDraw();

        // The triangle points to the right by default
        ctx.translate(player.dist + hh, 0);

        // Draw path
        ctx.beginPath();
        ctx.moveTo(-hh, -hb);
        ctx.lineTo(-hh, hb);
        ctx.lineTo(hh, 0);
        ctx.closePath();
        ctx.restore();

        // Fill
        ctx.fillStyle = 'rgba('+player.color+', 1)';
        ctx.fill();

    };

    exports.turnPlayer = function(dir) {
        player.pos += dir;
        if (player.pos >= exports.sides) {
            player.pos %= exports.sides;
        }
        if (player.pos < 0) {
            player.pos = exports.sides + player.pos;
        }
        player.angle = exports.turnStep * player.pos;
        player.restAngle = player.angle;
    };

    exports.setPlayerDirection = function(dir) {
        exports.playerDirection = dir;
        if (exports.playerDirection > 0) {
            exports.ctx.globalCompositeOperation = 'source-over';
        }
        else {
            exports.ctx.globalCompositeOperation = 'difference';
        }
    };

})(window.game);
