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
    damage.createCustomWave([-0.8, 1, 0.8, 0.8, -0.8, -0.8, -1]);

    var shield = new TinyMusic.Sequence( ac, tempo, ['C4 s','E4 s'] );

    shield.loop = false;
    shield.gain.gain.value = 0.8;
    shield.smoothing = 0.3;
    shield.staccato = 0.3;
    shield.createCustomWave([-0.8, 1, 0.8, 0.8, -0.8, -0.8, -1]);

    exports.sfxDamage = function() {
        damage.play();
    };

    exports.sfxShield = function() {
        shield.play();
    };

    //damage.play();
    //shield.play();

})(window.game);
