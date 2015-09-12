(function(exports) {
    // Used in player.js
    exports.player.skins = {
        default: '13, 213, 252',
        flashColor: '255, 184, 253' // The color it flashes briefly when hit
    };
    exports.player.color = exports.player.skins.default;

    // Used in gameHandler.js
    exports.HIT_PARTICLE_COLORS = ['red', 'white']; // The color of the particles emitted when the player's triangle is crushed
    exports.NORMAL_ENEMY_COLOR = 'white';
    exports.REVERSER_ENEMY_COLOR = 'green';

    // Used in background.js
    exports.bgIndex = 0;
    exports.BACKGROUND_COLORS_LIST = [
        ['#BF0C43', '#F9BA15', '#8EAC00', '#127A97', '#452B72'],
        ['#BF0C43', '#F9BA15', '#452B72', '#127A97', '#8EAC00']
    ];
    exports.INDICATOR_COLOR = 'white';

    // Used in uiScreens.js
    exports.MAIN_OVERLAY_RGBA = '0, 0, 0, 0.5';
    exports.MAIN_TEXT_COLOR = 'white';
    exports.END_OVERLAY_COLOR = '0, 0, 0';
    exports.END_TEXT_COLOR = '255, 255, 255';
})(window.game);