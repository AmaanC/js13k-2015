// (function(exports) {
    var exports = window.game;



    exports.sides = 4; // The number of sides that the player can turn
    var ticks = 0;
    var maxWait = 100;

    var enemies = [];
    var enemyPositions = [];
    var ENEMY_HEIGHT = 50;
    var ENEMY_WIDTH = 20;
    exports.turnStep = 2 * Math.PI / exports.sides;

    // Possible states: complete, movingIn, waiting, attacking
    // Complete: an attack was just completed and new enemies need to slide in
    // Moving In: enemies are moving to position from outside the screen
    // Waiting: enemies are in position, and we're waiting to give the player time
    // Attacking: 5, animate enemies moving in
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
        var possible = range(0, exports.sides);
        var numToRemove = 1 + Math.floor(Math.random() * (exports.sides - 2));

        for (var i = 0; i < numToRemove; i++) {
            possible.splice(Math.floor(Math.random() * possible.length), 1);
        }

        for (i = 0; i < possible.length; i++) {
            addEnemy(exports.turnStep * possible[i]);
        }

        currentState = 'movingIn';
        return possible;
    };

    var animateEnemies = function(min, speed, cb) {
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            enemy.centerDist -= speed || 5;
            if (enemy.centerDist < min) {
                enemy.centerDist = min;
                cb();
            }
        }
    };

    exports.enemyLogic = function() {
        switch(currentState) {
            case 'complete':
                enemyPositions = makeEnemyWave();
                break;
            case 'movingIn':
                animateEnemies(200, 5, function() {
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
                animateEnemies(50, 5, function() {
                    if (enemyPositions.indexOf(exports.player.pos) != -1) {
                        currentState = 'crushing';
                        exports.player.color = 'pink';
                        setTimeout(function() {
                            exports.player.color = 'black';
                        }, 100);
                        exports.createParticles(
                            Math.random() * 3 + 1,
                            exports.cx,
                            exports.cy,
                            ['red'],
                            1,
                            exports.player.angle + Math.PI / 2,
                            0.2
                        );
                        exports.createParticles(
                            Math.random() * 3 + 1,
                            exports.cx,
                            exports.cy,
                            ['red'],
                            1,
                            exports.player.angle - Math.PI / 2,
                            0.2
                        );

                        exports.shakeScreen(4);
                    }
                    else {
                        currentState = 'complete';
                        enemies = [];
                    }
                });
                break;
            case 'crushing':
                animateEnemies(30, 1, function() {
                    exports.player.color = 'white';
                    setTimeout(function() {
                        exports.player.color = 'black';
                        currentState = 'complete';
                        enemies = [];
                    }, 1000);
                });
                break;
        }
    };

// })(window.game);