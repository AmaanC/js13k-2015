(function(exports) {
    exports.keys = {};

    document.body.addEventListener('keydown', function(e) {
        exports.keys[e.keyCode] = true;
        if (e.keyCode === 39) {
            exports.turnPlayer(1);
        }
        else if (e.keyCode === 37) {
            exports.turnPlayer(-1);
        }
    });
    document.body.addEventListener('keyup', function(e) {
        exports.keys[e.keyCode] = false;
    });
})(window.game);
(function(exports) {
    var canvas = exports.canvas = document.getElementById('game');
    var ctx = exports.ctx = canvas.getContext('2d');
    exports.cx = canvas.width / 2;
    exports.cy = canvas.height / 2;
    
    var drawLoop = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        exports.playerDraw();
        exports.particleDraw();
        exports.enemyDraw();

        requestAnimationFrame(drawLoop);
    };

    var logicLoop = function() {
        exports.playerLogic();
        exports.enemyLogic();

        setTimeout(logicLoop, 100 / 6);
    };

    var init = function() {
        drawLoop();
        logicLoop();
    };

    window.addEventListener('load', init, false);
})(window.game);
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

    var animateEnemies = function(min, cb) {
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
                enemyPositions = makeEnemyWave();
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
                animateEnemies(50, function() {
                    if (enemyPositions.indexOf(exports.player.pos) != -1) {
                        exports.shakeScreen(4);
                    }
                    currentState = 'complete';
                    enemies = [];
                });
                break;
        }
    };

// })(window.game);
// This file contains most of the visual effects used in the game. I've tried to make every function self contained so that copying just that
// function itself is enough to get that effect.
(function(exports) {
    exports.shakeScreen = (function() {    
        var polarity = function() {
            return Math.random() > 0.5 ? 1 : -1;
        };

        // Amount we've moved so far
        var totalX = 0;
        var totalY = 0;

        return function(intensity) {
            var ctx = exports.ctx;
            if (totalX === 0) {
                ctx.save();
            }
            if (!intensity) {
                intensity = 2;
            }
            var dX = Math.random() * intensity * polarity();
            var dY = Math.random() * intensity * polarity();
            totalX += dX;
            totalY += dY;

            // Bring the screen back to its usual position every "2 intensity" so as not to get too far away from the center
            if (intensity % 2 < 0.2) {
                ctx.translate(-totalX, -totalY);
                totalX = totalY = 0;
                if (intensity <= 0.15) {
                    ctx.restore(); // Just to make sure it goes back to normal
                    return true;
                }
            }
            ctx.translate(dX, dY);
            setTimeout(function() {
                exports.shakeScreen(intensity - 0.1);
            }, 5);
        };
    })();

    
    exports.createParticles = (function() {
        var particles = [];
        var W = 7, H = 7;
        var DEC_RATE = 0.1; // Default decrease rate. Higher rate -> particles go faster

        exports.particleDraw = function() {
            for (var i = 0; i < particles.length; i++) {
                particles[i].draw();
            }
        };

        exports.particleLogic = function() {
            for (var i = 0; i < particles.length; i++) {
                particles[i].logic();
            }
        };

        var addParticle = function(x, y, color, angle) {
            var obj = {};
            obj.x = x;
            obj.y = y;
            obj.color = color || 'black';
            obj.angle = angle || 0;

            var ctx = exports.ctx;
            obj.draw = function() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.globalCompositeOperation = 'lighter';
                ctx.translate(this.x, this.y);
                ctx.fillStyle = this.color || 'red';
                ctx.fillRect(0, 0, W, H);
                ctx.restore();
            };
            
            obj.logic = function() {

            };
            
            particles.push(obj);
        };

        return function(num, color, x, y, angle, range) {
            
        };
    })();
})(window.game);