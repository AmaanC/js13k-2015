(function(exports) {

    // Shamelessly borrowed - http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
    var shadeRGBColor = function(color, percent) {
        var f=color.split(","),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
        return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
    }
    var shadeColor2 = function(color, percent) {
        var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }
    var shade = exports.shade = function(color, percent){
        if (color.length > 7 ) return shadeRGBColor(color,percent);
        else return shadeColor2(color,percent);
    }
    var shuffleArray = function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    // Used in player.js
    // Shield needs to be 0,225,172
    exports.player.skins = {
        default: '255,255,255',
        flashColor: '255, 184, 253' // The color it flashes briefly when hit
    };
    exports.player.color = exports.player.skins.default;

    // Used in background.js
    exports.bgIndex = 0;
    exports.BACKGROUND_COLORS_LIST = shuffleArray([
        ['#272D4D'],
        ['#B83564'],
        ['#FF6A5A'],
        ['#FFB350'],
        ['#83B8AA'],

        ['#490A3D'],
        ['#BD1550'],
        ['#E97F02'],
        ['#F8CA00'],
        ['#8F293D'],

        ['#C75233'],
        ['#C78933'],
        ['#D6CEAA'],
        ['#79B5AC'],
        ['#5E2F46'],

        ['#FF003C'],
        ['#FF8A00'],
        ['#FABE28'],
        ['#88C100'],
        ['#00C176'],

        ['#FAF577'],
        ['#67DAD4'],
        ['#24AFA8'],
        ['#28716D'],
        ['#EF434B'],

        ['#482344'],
        ['#429867'],
        ['#2B5166'],
        ['#FAB243'],
        ['#E02130'],

        // emo mode
        ['#212121'],
        ['#efefef']
    ]);
    exports.INDICATOR_COLOR = '#1B9171';

    // Used in gameHandler.js
    exports.HIT_PARTICLE_COLORS = ['red', 'white']; // The color of the particles emitted when the player's triangle is crushed
    exports.NORMAL_ENEMY_COLOR = 'white';
    exports.REVERSER_ENEMY_COLOR = '#FD0251';


    // Used in uiScreens.js
    exports.MAIN_OVERLAY_RGBA = '0, 0, 0, 0.5';
    exports.MAIN_TEXT_COLOR = 'white';
    exports.END_OVERLAY_COLOR = '0, 0, 0';
    exports.END_TEXT_COLOR = '255, 255, 255';
    exports.MUSIC_ENABLED_COLOR = 'white';
    exports.MUSIC_DISABLED_COLOR = 'gray';

})(window.game);
