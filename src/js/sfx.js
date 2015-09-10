// Tiny sfx with tinymusic!
(function(exports) {

    // Create audio ctx, Tiny Music handles interaction
    var ac = new AudioContext();
    var tempo = 120;

    // Damage
    var damage = new TinyMusic.Sequence( ac, tempo, ['B0 h'] );

    damage.loop = false;
    damage.smoothing = 0.2;
    damage.staccato = 0.8;
    damage.waveType = 'sawtooth';
    damage.gain.gain.value = 10;
    damage.mid.gain.value = -10;
    damage.mid.frequency.value = 2000;
    damage.treble.gain.value = -10;
    damage.treble.frequency.value = 1000;
    damage.bass.gain.value = 10;
    damage.bass.frequency.value = 100;

    exports.sfxDamage = function() {
        damage.play();
    };

})(window.game);
