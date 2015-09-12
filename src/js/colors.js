(function(exports) {
    // Used in player.js
    exports.player.skins = {
        default: '13, 213, 252',
        flashColor: '255, 184, 253' // The color it flashes briefly when hit
    };
    exports.player.color = exports.player.skins.default;

    // Used in gameHandler.js
    exports.HIT_PARTICLE_COLORS = ['red']; // The color of the particles emitted when the player's triangle is crushed
    exports.NORMAL_ENEMY_COLOR = 'white';
    exports.REVERSER_ENEMY_COLOR = 'green';

    // Used in background.js
    exports.DEFAULT_BACKGROUND_COLORS = ['#BF0C43', '#F9BA15', '#8EAC00', '#127A97', '#452B72'];
    exports.INDICATOR_COLOR = 'white';
})(window.game);