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
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        exports.backgroundDraw();
        exports.playerDraw();
        exports.particleDraw();
        exports.enemyDraw();

        requestAnimationFrame(drawLoop);
    };

    var logicLoop = function() {
        exports.backgroundLogic();
        exports.playerLogic();
        exports.particleLogic();
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
    player.color = '13,213,252';
    player.alpha = 1;

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

        // Draw path
        ctx.beginPath();
        ctx.moveTo(-hh, -hb);
        ctx.lineTo(-hh, hb);
        ctx.lineTo(hh, 0);
        ctx.closePath();
        ctx.restore();

        // Stroke
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba('+player.color+', ' + player.alpha + ')';
        ctx.stroke();

        // Fill
        ctx.fillStyle = 'rgba('+player.color+', 0)';
        ctx.fill();
        ctx.shadowBlur = 0;

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



    exports.sides = 5; // The number of sides that the player can turn
    var ticks = 0;
    var maxWait = 100;

    var enemies = [];
    var enemyPositions = [];
    var ENEMY_HEIGHT = 50;
    var ENEMY_WIDTH = 20;

    var prevColor = ''; // Temp variable to store player's color

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
                break;
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
                    }
                    else {
                        currentState = 'complete';
                        enemies = [];
                    }
                });
                break;
            case 'crushing':
                animateEnemies(29, 1, function() {
                    exports.player.alpha = 0;
                    setTimeout(function() {
                        exports.player.color = prevColor;
                        exports.player.alpha = 1;
                        currentState = 'complete';
                        enemies = [];
                    }, 1000);
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
        var DEC_RATE = 0.02; // Default decrease rate. Higher rate -> particles go faster

        exports.particleDraw = function() {
            for (var i = 0; i < particles.length; i++) {
                particles[i].draw();
            }
        };

        exports.particleLogic = function() {
            var garbageIndices = [];
            var i = particles.length;
            while (i--) {
                particles[i].logic();
                if (particles[i].alive === false) {
                    particles.splice(i, 1);
                }
            }
        };

        var addParticle = function(x, y, speed, color, angle) {
            var obj = {};
            obj.x = x;
            obj.y = y;
            obj.speed = speed || 5;
            obj.color = color || 'black';
            obj.angle = angle || 0;

            obj.opacity = 1;
            obj.decRate = DEC_RATE;
            obj.dx = Math.cos(obj.angle) * obj.speed;
            obj.dy = Math.sin(obj.angle) * obj.speed;

            var ctx = exports.ctx;
            obj.draw = function() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.globalCompositeOperation = 'lighter';
                ctx.translate(this.x, this.y);

                ctx.rotate(exports.player.angle); // Custom for this game

                ctx.fillStyle = this.color || 'red';
                ctx.fillRect(exports.player.dist, 0, W, H); // Customized too
                ctx.restore();
            };
            
            obj.logic = function() {
                this.x += this.dx;
                this.y += this.dy;
                this.opacity -= this.decRate;
                if (this.opacity <= 0) {
                    this.opacity = 0;
                    this.alive = false;
                }
            };
            
            particles.push(obj);
        };

        return function(num, x, y, colorList, speed, angle, range) {
            for (var i = 0; i < num; i++) {
                addParticle(x, y, speed, colorList[Math.floor(Math.random() * colorList.length)], angle - range + (Math.random() * 2 * range));
            }
        };
    })();
})(window.game);
// Draws the flashing, spinning background with co-ordination from gameHandler
(function(exports) {
    var shapes = [];
    var centerX = exports.canvas.width / 2;
    var centerY = exports.canvas.height / 2;
    var ctx = exports.ctx;

    var MIN_SIZE = 35;
    var DIST_BETWEEN = 30;

    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    // Taken from http://gizma.com/easing/
    var easeInOutCirc = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        t -= 2;
        return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
    };

    // x, y are the center co-ordinates of the shape
    var drawShape = function(x, y, side, angle, color) {

        ctx.beginPath();
        ctx.moveTo(x + side * Math.cos(angle), y + side * Math.sin(angle));
        for (var i = 1; i <= exports.sides; i++) {
            ctx.lineTo(x + side * Math.cos(angle + 2 * Math.PI * i / exports.sides), y + side * Math.sin(angle + 2 * Math.PI * i / exports.sides ));
        };
        ctx.closePath();

        ctx.fillStyle = color || 'green';
        ctx.fill();
    };

    var duration = 90 / 1.5;
    var createShape = function(x, y, side, color) {
        var obj = {};
        obj.x = x;
        obj.y = y;
        obj.side = side;
        obj.restAngle = Math.PI / exports.sides;
        obj.angle = obj.restAngle;
        obj.color = color;
        obj.time = 0;
        obj.draw = function() {
            drawShape(obj.x, obj.y, obj.side, obj.angle, obj.color);
        };
        obj.logic = function() {
            obj.time++;
            if (obj.spinning) {
                obj.angle = easeInOutCirc(obj.time, obj.restAngle, exports.turnStep, duration);
                if (obj.time > duration) {
                    obj.angle = obj.restAngle;
                    obj.time = 0;
                    obj.spinning = false;
                }
            }
        };
        return obj;
    };

    var init = function() {
        shapes = [];
        var colors = '#BF0C43,#F9BA15,#8EAC00,#127A97,#452B72'.split(',');
        for (var i = 14 - 1; i >= 0; i--) {
            shapes.push(createShape(centerX, centerY, MIN_SIZE + i * DIST_BETWEEN, colors[i % colors.length]));
        };
    };

    exports.triggerSpin = function() {
        var obj;
        for (var i = 0; i < shapes.length; i++) {
            obj = shapes[i];
            obj.spinning = true;
            obj.time = 2 * i;
        }
    };

    exports.backgroundDraw = function() {
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].draw();
        };
    };

    exports.backgroundLogic = function() {
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].logic();
        };
    };

    init();

})(window.game);