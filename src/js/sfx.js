// Tiny sfx with tinymusic!
(function(exports) {

    // Effects
    var effects = {};
    effects.default = [
        'A1 e',
    ];
    effects.damage = [
        'D1 q',
    ];
    exports.effects = effects;

    // Create audio ctx, Tiny Music handles interaction
    var ac = new AudioContext();

    // SFX
    var sfx = {};
    exports.sfx = sfx;

    sfx.tempo = 120;

    // Cheap pattern changer
    exports.sfxLoader = function(pattern) {

        // Create instance for each effect as TinyNote can't change
        // patterns using start / stop
        var chan = new TinyMusic.Sequence( ac, sfx.tempo, pattern );
        chan.loop = false;
        chan.play();

    };

    // Tests
    //exports.sfxLoader(effects.default);

    //setTimeout(function() {
        //exports.sfxLoader(effects.damage);
    //}, 1000 );

})(window.game);
