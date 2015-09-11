// The game has "stages", which are represented by different shapes, i.e. the square is one stage, and then the pentagon is the next.
// Within each stage, there are the following levels:
// 1) Faster enemies
// 2) Player spins X degrees just before the enemies attack. Player has to start accounting for this
// To cross one level, the player has to dodge the enemy blocks N times. N is the number of waves.
// When these levels have been crossed, the player goes to the next stage.

// (function(exports) {
    var exports = window.game;



    exports.sides = 5; // The number of sides that the player can turn
    var ticks = 0;
    var maxWait = 20;
    var spinAmount = 2; // Will be randomized on different levels

    var enemies = [];
    var enemyPositions = [];
    var ENEMY_HEIGHT = 50;
    var ENEMY_WIDTH = 20;
    var DEFAULT_ENEMY_SPEED = 10;
    var SPEED_LIMIT = 20;
    var ENEMY_CENTER_DIST = 500;
    var MIN_ENEMIES = 1;
    var MIN_EMPTY_SPOTS = 1; // Minimum number of spots the player has to dodge enemies
    var crusherEnemyIndex = -1; // The index of the enemy which crushed the player

    var ODDS_OF_REVERSER = 0.15; // The odds of an enemy having the power to reverse the player's controls when it hits the player

    var difficultyLevel = 2; // This follows the level progression description at the top of the file
    var numCrossed = 4; // How many "stages" has the player already dodged? When they cross X stages, we increase the difficulty level
    var enemySpeed = DEFAULT_ENEMY_SPEED; // Changed for level 2
    var spinPlayer = false;
    var LAST_STAGE = 8; // When you get to the end of this stage (shape), the levels reverse
    var progressionDirection = -1; // Becomes -1 when you cross the last shape

    var HIT_PARTICLE_COLORS = ['red']; // The color of the particles emitted when the player's triangle is crushed
    var NORMAL_ENEMY_COLOR = 'white';
    var REVERSER_ENEMY_COLOR = 'green';

    var WAIT_DIST = 200;
    var MOVE_IN_SPEED = 5; // Speed at which it moves in from outside the screen to the wait position
    var CRUSH_SPEED = 1;

    var NUM_PARTICLES = 5; // Particles created on collision
    var PARTICLE_SPEED = 1;
    var PARTICLE_OFFSET = Math.PI / 2;
    var PARTICLE_RANGE = 0.4;
    var SHAKE_INTENSITY = 4;

    var MAX_SHIELDS = 3;


    exports.turnStep = 2 * Math.PI / exports.sides;

    // Possible states: complete, movingIn, waiting, attacking
    // Complete: an attack was just completed and new enemies need to slide in
    // Moving In: enemies are moving to position from outside the screen
    // Waiting: enemies are in position, and we're waiting to give the player time
    // Spinning: player is spinning with the background (only when the difficulty is appropriate)
    // Attacking: Animate enemies moving in toward the player from their waiting position
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
            ctx.fillStyle = enemy.reverser ? REVERSER_ENEMY_COLOR : NORMAL_ENEMY_COLOR;
            ctx.fillRect(enemy.centerDist, -ENEMY_HEIGHT / 2, ENEMY_WIDTH, ENEMY_HEIGHT);
            ctx.restore();
        }
    };

    var addEnemy = function(angle) {
        var obj = {};
        obj.angle = angle || 0;
        obj.centerDist = ENEMY_CENTER_DIST;
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
        var numToRemove = MIN_ENEMIES + Math.floor(Math.random() * (exports.sides - MIN_EMPTY_SPOTS - 1));

        for (var i = 0; i < numToRemove; i++) {
            possible.splice(Math.floor(Math.random() * possible.length), 1);
        }

        for (i = 0; i < possible.length; i++) {
            addEnemy(exports.turnStep * possible[i]);
        }

        exports.currentState = 'movingIn';
        return possible;
    };

    var playerInTheWay = function() {
        crusherEnemyIndex = enemyPositions.indexOf(exports.player.pos);
        if (crusherEnemyIndex != -1) {
            return true;
        }
        return false;
    };
    // Animate enemies to a certain position and call cb when it reaches it
    var animateEnemies = function(min, speed, cb, checkFn) {
        var allReached = true;
        if (checkFn) {
            checkFn();
        }
        
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

    var updateIndicator = function() {
        exports.indicatorObj.numSides = numCrossed;
    };

    var makePlayerSpin = function(cb) {
        exports.spinAnimate(exports.player, function() {
            exports.turnPlayer(exports.steps);
            exports.spinning = false;
            cb();
        });
    };

    var resetNumCrossed = function() {
        numCrossed = (progressionDirection === 1) ? 0 : exports.sides;
    };

    var afterDifficultySpin = function() {
        resetNumCrossed();
        updateIndicator();
        exports.currentState = 'complete';
    };

    var addShield = function() {
        if (exports.player.numShields < MAX_SHIELDS) {
            exports.player.numShields++;
        }
    };

    var playerHit = function() {
        if (crusherEnemyIndex < 0) {
            return;
        }
        // Here's what happens when the player is hit
        if (enemies[crusherEnemyIndex].reverser) {
            exports.reversePlayerControls();
        }
        resetNumCrossed();
        updateIndicator();
        exports.currentState = 'crushing';
        if (exports.player.numShields > 0) {
            exports.player.numShields--;
            // Explode the block into pieces
            exports.createParticles(
                Math.random() * NUM_PARTICLES + 1,
                exports.cx,
                exports.cy,
                HIT_PARTICLE_COLORS,
                PARTICLE_SPEED,
                exports.player.angle + Math.PI,
                PARTICLE_RANGE
            );

            exports.shakeScreen(SHAKE_INTENSITY);
            return;
        }
        exports.player.color = exports.player.skins.flashColor;
        setTimeout(function() {
            exports.player.color = exports.player.skins.default;
        }, 100);
        exports.createParticles(
            Math.random() * NUM_PARTICLES + 1,
            exports.cx,
            exports.cy,
            HIT_PARTICLE_COLORS,
            PARTICLE_SPEED,
            exports.player.angle + PARTICLE_OFFSET,
            PARTICLE_RANGE
        );
        exports.createParticles(
            Math.random() * NUM_PARTICLES + 1,
            exports.cx,
            exports.cy,
            HIT_PARTICLE_COLORS,
            PARTICLE_SPEED,
            exports.player.angle - PARTICLE_OFFSET,
            PARTICLE_RANGE
        );

        exports.shakeScreen(SHAKE_INTENSITY);
    };

    var increaseDifficulty = function() {
        numCrossed += progressionDirection;
        if (numCrossed > exports.sides || numCrossed < 0) {
            difficultyLevel += progressionDirection;
            exports.triggerSpin(exports.sides * progressionDirection);
            enemies = [];
            exports.player.time = exports.NUM_SHAPES;
            exports.currentState = 'increasingDifficulty';
            addShield();
            console.log('Difficulty:', difficultyLevel);
        }
        updateIndicator();

        switch(difficultyLevel) {
            case 1:
                spinPlayer = false;
                enemySpeed += progressionDirection * (SPEED_LIMIT - DEFAULT_ENEMY_SPEED) / exports.sides;
                if (enemySpeed > SPEED_LIMIT) {
                    enemySpeed = SPEED_LIMIT;
                }
                if (enemySpeed < DEFAULT_ENEMY_SPEED) {
                    enemySpeed = DEFAULT_ENEMY_SPEED;
                }
                break;
            case 2:
                spinPlayer = true;
                break;
            // If we're going in reverse or if we're going straight ahead, we want to loop over
            case 0:
            case 3:
                exports.changeSides(exports.sides + progressionDirection);
                exports.currentState = 'increasingDifficulty';
                exports.triggerSpin(exports.sides * progressionDirection);
                if (progressionDirection === 1) {
                    difficultyLevel = 1;
                    enemySpeed = DEFAULT_ENEMY_SPEED;
                    spinPlayer = false;
                }
                else {
                    difficultyLevel = 2;
                    enemySpeed = SPEED_LIMIT;
                }
                break;
        }
    };

    exports.enemyLogic = function() {
        switch(exports.currentState) {
            case 'complete':
                exports.player.canMove = true;
                enemies = [];
                enemyPositions = makeEnemyWave();
                break;
            case 'movingIn':
                animateEnemies(WAIT_DIST, MOVE_IN_SPEED, function() {
                    exports.currentState = 'waiting';
                });
                break;
            case 'waiting':
                ticks++;
                if (ticks > maxWait) {
                    ticks = 0;
                    exports.currentState = 'attacking';
                    if (spinPlayer) {
                        exports.triggerSpin(progressionDirection * spinAmount);
                        exports.player.time = exports.NUM_SHAPES;
                        exports.currentState = 'spinning';
                        exports.player.canMove = false;
                    }
                }
                break;
            case 'spinning':
                if (exports.spinning) {
                    makePlayerSpin(function() {
                        exports.currentState = 'attacking';
                    });
                }
                break;
            case 'attacking':
                exports.player.canMove = true;
                animateEnemies(exports.player.dist + exports.player.halfHeight, enemySpeed, function() {
                    if (playerInTheWay()) {
                        playerHit();
                        exports.currentState = 'crushing';
                    }
                    else {
                        exports.currentState = 'complete';
                        increaseDifficulty();
                    }
                }, function() {
                    if (playerInTheWay() && exports.player.isColliding(enemies[0].centerDist)) {
                        // A shield was hit
                        playerHit();
                        exports.currentState = 'complete';
                        return;
                    }
                });
                break;
            case 'crushing':
                exports.player.canMove = false;
                animateEnemies(exports.player.dist, CRUSH_SPEED, function() {
                    exports.player.hideTemporarily();
                });
                break;
            case 'increasingDifficulty':
                exports.player.canMove = false;
                makePlayerSpin(afterDifficultySpin);
                if (exports.allShapesDoneSpinning) {
                    afterDifficultySpin();
                }
                break;
        }
    };

// })(window.game);