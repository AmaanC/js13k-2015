// (function(exports) {
    var exports = window.game;



    var sides = 4; // The number of sides that the player can turn
    var ticks = 0;
    var maxWait = 100;

    var enemies = [];
    var ENEMY_HEIGHT = 50;
    var ENEMY_WIDTH = 20;
    exports.turnStep = 2 * Math.PI / sides;

    // Possible states: complete, movingIn, waiting, attacking
    // Complete: an attack was just completed and new enemies need to slide in
    // Moving In: enemies are moving to position from outside the screen
    // Waiting: enemies are in position, and we're waiting to give the player time
    // Attacking: animate enemies moving in
    var currentState = 'complete';


    exports.enemyDraw = function() {
        var enemy;
        var ctx = exports.ctx;
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            ctx.save();
            ctx.translate(exports.cx, exports.cy);
            ctx.rotate(enemy.angle);
            ctx.fillRect(enemy.centerDist, -ENEMY_HEIGHT / 2, ENEMY_WIDTH, ENEMY_HEIGHT);
            ctx.restore();
        }
    };

    var addEnemy = function(angle) {
        var obj = {};
        obj.angle = angle || 0;
        obj.centerDist = 450;

        enemies.push(obj);
    };

    var range = function(min, max) {
        var ret = [];
        for (var i = min; i < max; i++) {
            ret.push(i);
        }
        return ret;
    };

    var makeEnemyWave = function() {
        var possible = range(0, sides);
        var numToRemove = 1 + Math.floor(Math.random() * (sides - 2));

        for (var i = 0; i < numToRemove; i++) {
            possible.splice(Math.floor(Math.random() * possible.length), 1);
        }

        for (i = 0; i < possible.length; i++) {
            addEnemy(exports.turnStep * possible[i]);
        }

        currentState = 'movingIn';
    };

    var animateEnemies = function(min, cb) {
        console.log(min);
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            enemy.centerDist -= 5;
            if (enemy.centerDist < min) {
                enemy.centerDist = min;
                cb();
            }
        }
    };

    exports.enemyLogic = function() {
        switch(currentState) {
            case 'complete':
                makeEnemyWave();
                break;
            case 'movingIn':
                animateEnemies(200, function() {
                    currentState = 'waiting';
                });
                break;
            case 'waiting':
                ticks++;
                if (ticks > maxWait) {
                    ticks = 0;
                    currentState = 'attacking';
                }
                break;
            case 'attacking':
                animateEnemies(0, function() {
                    currentState = 'complete';
                    enemies = [];
                });
        }
    };

// })(window.game);