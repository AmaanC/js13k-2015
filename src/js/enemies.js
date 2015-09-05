(function(exports) {
    var enemies = [];

    var makeEnemyWave = function() {
        var obj = {};

    };

    exports.enemyDraw = function() {
        var enemy;
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            ctx.save();
            ctx.translate(exports.cx, exports.cy);
            ctx.rotate(enemy.angle);
            ctx.fillRect(enemy.centerDist, -enemy.height / 2, enemy.width, enemy.height);
            ctx.restore();
        }
    };

    exports.enemyLogic = function() {

    };

})(window.game);