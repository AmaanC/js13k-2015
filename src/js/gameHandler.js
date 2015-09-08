// Here's how level progression will work
// 1) Plain old dodging. You move left/right and dodge.
// 2) Faster enemies
// 3) Player spins X degrees just before the enemies attack. Player has to start accounting for this
// 4) Number of sides increases (i.e. a square becomes a pentagon)
// 5) You cut the player's arm off to make the game harder still
// 6) You kidnap their children to test their committment
// 7) PROFIT
// 8) goto 1

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

    var ODDS_OF_REVERSER = 0.15; // The odds of an enemy having the power to reverse the player's controls when it hits the player

    var difficultyLevel = 1; // This follows the level progression description at the top of the file
    var numCrossed = 0; // How many "stages" has the player already dodged? When they cross X stages, we increase the difficulty level
    var enemySpeed = DEFAULT_ENEMY_SPEED; // Changed for level 2
    var spinPlayer = false;
    var alreadySpunPlayer = false;
    var STEPS_TO_NEXT_LEVEL = 2;

    var crusherEnemyIndex = -1; // The index of the enemy which crushed the player

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
        exports.player.restAngle = 0;
        exports.initBackground();
    };

    exports.enemyDraw = function() {
        var enemy;
        var ctx = exports.ctx;
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            ctx.save();
            ctx.translate(exports.cx, exports.cy);
            ctx.rotate(enemy.angle);
            ctx.fillStyle = enemy.reverser ? 'green' : 'white';
            ctx.fillRect(enemy.centerDist, -ENEMY_HEIGHT / 2, ENEMY_WIDTH, ENEMY_HEIGHT);
            ctx.restore();
        }
    };

    var addEnemy = function(angle) {
        var obj = {};
        obj.angle = angle || 0;
        obj.centerDist = 500;
        obj.reverser = Math.random() < ODDS_OF_REVERSER;

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

    var makePlayerSpin = function(nextState) {
        exports.spinAnimate(exports.player, function() {
            exports.turnPlayer(exports.steps);
            exports.spinning = false;
            exports.currentState = nextState;
        });
    };

    var playerHit = function(enemyIndex) {
        // Here's what happens when the player is hit
        if (enemies[enemyIndex].reverser) {
            exports.reversePlayerControls();
        }
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

    var increaseDifficulty = function() {
        numCrossed++;
        if (numCrossed > STEPS_TO_NEXT_LEVEL) {
            numCrossed = 0;
            difficultyLevel++;
            exports.triggerSpin(exports.sides);
            enemies = [];
            exports.player.time = exports.NUM_SHAPES;
            exports.currentState = 'increasingDifficulty';
            console.log('Difficulty:', difficultyLevel);
        }

        switch(difficultyLevel) {
            case 2:
                enemySpeed += (SPEED_LIMIT - DEFAULT_ENEMY_SPEED) / STEPS_TO_NEXT_LEVEL;
                break;
            case 3:
                spinPlayer = true;
                break;
            case 4:
                exports.changeSides(exports.sides + 1);
                exports.currentState = 'increasingDifficulty';
                exports.triggerSpin(exports.sides);
                difficultyLevel = 1;
                enemySpeed = DEFAULT_ENEMY_SPEED;
                spinPlayer = false;
                break;
        }
    };

    exports.enemyLogic = function() {
        switch(exports.currentState) {
            case 'complete':
                exports.player.canMove = true;
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
                if (ticks > maxWait) {
                    ticks = 0;
                    exports.currentState = 'attacking';
                    if (spinPlayer) {
                        exports.triggerSpin(2);
                        exports.player.time = exports.NUM_SHAPES;
                        exports.currentState = 'spinning';
                        exports.player.canMove = false;
                    }
                }
                break;
            case 'spinning':
                if (exports.spinning) {
                    makePlayerSpin('attacking');
                }
                break;
            case 'attacking':
                exports.player.canMove = true;
                animateEnemies(50, enemySpeed, function() {
                    crusherEnemyIndex = enemyPositions.indexOf(exports.player.pos);
                    if (crusherEnemyIndex != -1) {
                        playerHit(crusherEnemyIndex);
                    }
                    else {
                        exports.currentState = 'complete';
                        increaseDifficulty();
                    }
                });
                break;
            case 'crushing':
                exports.player.canMove = false;
                animateEnemies(exports.player.dist, 1, function() {
                    exports.player.alpha = 0;
                    setTimeout(function() {
                        exports.player.color = prevColor;
                        exports.player.alpha = 1;
                        exports.currentState = 'complete';
                    }, 1000);
                });
                break;
            case 'increasingDifficulty':
                makePlayerSpin('complete');
                if (exports.allShapesDoneSpinning) {
                    exports.currentState = 'complete';
                }
                break;
        }
    };

// })(window.game);