// Tiny sfx with tinymusic!
(function(exports) {

    // Create audio ctx, Tiny Music handles interaction
    var ac = new AudioContext();
    var tempo = 120;

    // Damage
    var damage = new TinyMusic.Sequence( ac, tempo, ['C1 s','C1 e'] );

    damage.loop = false;
    damage.gain.gain.value = 1;
    damage.smoothing = 0.3;
    damage.staccato = 0.3;
    damage.waveType = 'square';

    var shield = new TinyMusic.Sequence( ac, tempo, ['C3 s','C3 e'] );

    shield.loop = false;
    shield.gain.gain.value = 0.8;
    shield.smoothing = 0.3;
    shield.staccato = 0.3;
    shield.waveType = 'sine';

    exports.sfxDamage = function() {
        if (exports.musicEnabled) {
            damage.play();
        }
    };

    exports.sfxShield = function() {
        if (exports.musicEnabled) {
            shield.play();
        }
    };

    //damage.play();
    //shield.play();

})(window.game);
