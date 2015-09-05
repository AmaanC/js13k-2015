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
    player.cx = exports.cx;
    player.cy = exports.cy;
    player.dist = 30;
    player.halfBase = 10;
    player.halfHeight = 10;
    player.angle = 0;

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
        player.angle += exports.turnStep * dir;
        if (player.angle > 2 * Math.PI) {
            player.angle %= 2 * Math.PI;
        }
    };

    exports.playerLogic = function() {
        
    };
})(window.game);