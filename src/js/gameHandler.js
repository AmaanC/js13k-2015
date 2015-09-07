// Here's how level progression will work
// 1) Plain old dodging. You move left/right and dodge.
// 2) Faster enemies
// 3) Player spins X degrees just before the enemies attack. Player has to start accounting for this
// 4) Player still spins, but now so do the enemy blocks.
// 5) Number of sides increases (i.e. a square becomes a pentagon)
// 6) You cut the player's arm off to make the game harder still
// 7) You kidnap their children to test their committment
// 8) PROFIT
// 9) goto 1

// (function(exports) {
    var exports = window.game;



    exports.sides = 4; // The number of sides that the player can turn
    var ticks = 0;
    var maxWait = 20;

    var enemies = [];
    var enemyPositions = [];
    var ENEMY_HEIGHT = 50;
    var ENEMY_WIDTH = 20;
    var DEFAULT_ENEMY_SPEED = 10;
    var SPEED_LIMIT = 30;

    var difficultyLevel = 1; // This follows the level progression description at the top of the file
    var numCrossed = 0; // How many "stages" has the player already dodged? When they cross X stages, we increase the difficulty level
    var enemySpeed = DEFAULT_ENEMY_SPEED; // Changed for level 2
    var spinEnemies = false;
    var spinPlayer = false;
    var alreadySpunPlayer = false;
    var STEPS_TO_NEXT_LEVEL = 2;

    var prevColor = ''; // Temp variable to store player's color

    exports.turnStep = 2 * Math.PI / exports.sides;

    // Possible states: complete, movingIn, waiting, attacking
    // Complete: an attack was just completed and new enemies need to slide in
    // Moving In: enemies are moving to position from outside the screen
    // Waiting: enemies are in position, and we're waiting to give the player time
    // Spinning: enemies are spinning with the background (step will be skipped on easier levels)
    // Attacking: Animate enemies moving in
    // Crushing: The player didn't dodge, so the crushing animation is playing right now
    exports.currentState = 'complete';


    exports.changeSides = function(n) {
        enemies = [];
        exports.currentState = 'complete';
        exports.sides = n;
        exports.turnStep = 2 * Math.PI / exports.sides;
        exports.player.pos = 0;
        exports.player.angle = 0;
        exports.initBackground();
    };

    exports.enemyDraw = function() {
        var enemy;
        var ctx = exports.ctx;
        ctx.fillStyle = 'white';
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
        obj.centerDist = 500;

        obj.time = 0;

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

        exports.currentState = 'movingIn';
        return possible;
    };

    // Animate enemies to a certain position and call cb when it reaches it
    var animateEnemies = function(min, speed, cb) {
        var allReached = true;
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            enemy.centerDist -= speed || 5;
            if (enemy.centerDist <= min) {
                enemy.centerDist = min;
            }
            else {
                allReached = false;
            }
        }
        if (allReached) {
            cb();
        }
    };

    var playerHit = function() {
        // Here's what happens when the player is hit
        numCrossed = 0;
        exports.currentState = 'crushing';
        prevColor = exports.player.color;
        exports.player.color = '255, 184, 253';
        setTimeout(function() {
            exports.player.color = prevColor;
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
    };

    var makePlayerSpin = function() {
        if (spinPlayer && alreadySpunPlayer === false) {
            exports.turnPlayer(1);
            alreadySpunPlayer = true;
        }
    };

    var increaseDifficulty = function() {
        numCrossed++;
        if (numCrossed > STEPS_TO_NEXT_LEVEL) {
            numCrossed = 0;
            difficultyLevel++;
            console.log(difficultyLevel);
        }

        switch(difficultyLevel) {
            case 2:
                enemySpeed += (SPEED_LIMIT - DEFAULT_ENEMY_SPEED) / STEPS_TO_NEXT_LEVEL;
                break;
            case 3:
                spinPlayer = true;
                break;
            case 4:
                spinEnemies = true;
                break;
            case 5:
                exports.changeSides(exports.sides + 1);
                difficultyLevel = 1;
                enemySpeed = DEFAULT_ENEMY_SPEED;
                spinPlayer = false;
                spinEnemies = false;
                break;
        }
    };

    exports.enemyLogic = function() {
        switch(exports.currentState) {
            case 'complete':
                alreadySpunPlayer = false;
                enemies = [];
                enemyPositions = makeEnemyWave();
                break;
            case 'movingIn':
                animateEnemies(200, 5, function() {
                    exports.currentState = 'waiting';
                });
                break;
            case 'waiting':
                ticks++;
                if (difficultyLevel <= 3) {
                    makePlayerSpin();
                }
                if (spinEnemies) {
                    exports.triggerSpin(2);
                    exports.currentState = 'spinning';

                    for (i = 0; i < enemyPositions.length; i++) {
                        enemyPositions[i] += exports.steps;
                        if (enemyPositions[i] >= exports.sides) {
                            enemyPositions[i] %= exports.sides;
                        }
                        else if (enemyPositions[i] < 0) {
                            enemyPositions[i] = exports.sides - exports.steps;
                        }
                    }
                }
                else if (ticks > maxWait) {
                    ticks = 0;
                    exports.currentState = 'attacking';
                }
                break;
            case 'spinning':
                if (exports.spinning) {
                    for (var i = 0; i < enemies.length; i++) {
                        exports.spinAnimate(enemies[i], function() {
                            exports.spinning = false;
                            exports.currentState = 'attacking';
                            makePlayerSpin();
                        });
                    }
                }
                break;
            case 'attacking':
                animateEnemies(50, enemySpeed, function() {
                    if (enemyPositions.indexOf(exports.player.pos) != -1) {
                        playerHit();
                    }
                    else {
                        increaseDifficulty();
                        exports.currentState = 'complete';
                    }
                });
                break;
            case 'crushing':
                animateEnemies(29, 1, function() {
                    exports.player.alpha = 0;
                    setTimeout(function() {
                        exports.player.color = prevColor;
                        exports.player.alpha = 1;
                        exports.currentState = 'complete';
                    }, 1000);
                });
                break;
        }
    };

// })(window.game);