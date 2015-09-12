// Tiny audio with tinymusic!
// Tracks are sheet music,
// Audio emulates nanoloop app.
(function(exports) {

    // Change Octave
    var changeOctave = function(originalArray, changeBy) {
        var ret = [];
        var num = 0;
        var newNote;
        ret = originalArray.map(function(note) {
            newNote = note;
            num = Number(note.match(/\d/));
            return note.replace(num, num + changeBy);
        });
        return ret;
    };

    var changePreset = function(seq, preset) {

    };

    // Create audio ctx, Tiny Music handles interaction
    var ac = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext;

    // Emulate nanoloops
    var audio = exports.audio = {};

    // Set tempo and track count
    audio.tempo = 120;

    // Patterns
    // w  - 1
    // h  - 1/2
    // q  - 1/4
    // e  - 1/8
    // s  - 1/16
    // es - 1/8 + 1/16
    var patterns = [];

    // Bass
    patterns[0] = [];
    patterns[0][0] = [
        'E1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',

        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',

        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',

        'B1  e',
        'B1  e',
        'B1  e',
        'B1  e',
        'B1  e',
        'B1  e',
        'B1  e',
        'B1  e'
    ];
    patterns[0][1] = [
        'E1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',
        'F1  e',

        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',
        'G1  e',

        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  e',

        'B1  s',
        'B1  s',
        'B1  e',
        'B1  e',
        'B1  s',
        'B1  s',
        'B1  e',
        'B1  e'
    ];

    // Harmony
    patterns[1]= [];
    patterns[1][0] = [
        'G1  w',

        'Bb1 w',

        'B1  w',

        'C1  h',
        'C1  q',
        'B1  e',
        'A1  e',

        'G1  w',

        'Bb1 w',

        'B1  w',

        'C1  h',
        'C1  q',
        'B1  e',
        'A1  e'
    ];
    patterns[1][1] = changeOctave(patterns[1][0], 1);

    // Lead.
    patterns[2] = [];
    patterns[2][0] = [
        '-   w',

        '-   w',

        '-   w',

        '-   w',

        '-   w',

        '-   w',

        '-   w',

        '-   h',
        'E3  e',
        'E3  e',
        'D3  s',
        'D3  s',
        'D3  e',

        'F2  h',
        'F2  e',
        'F2  e',
        'F2  e',
        'E1  e',

        '-   h',
        'F2  e',
        'F2  e',
        'F2  s',
        'F2  s',
        'E1  e',

        'F2  h',
        'F2  e',
        'F2  e',
        'F2  e',
        'E1  e',

        'F2  q',
        'F2  q',
        'E2  e',
        'E2  e',
        'D2  e',
        'D2  e'
    ];
    patterns[2][1] = changeOctave(patterns[2][0], 1);

    // Create sequences
    var seqs = [];
    seqs[0] = new TinyMusic.Sequence(ac, audio.tempo, []);
    seqs[1] = new TinyMusic.Sequence(ac, audio.tempo, []);
    seqs[2] = new TinyMusic.Sequence(ac, audio.tempo, []);

    // Set volume
    seqs[0].gain.gain.value = 0.6;
    seqs[1].gain.gain.value = 0.8;
    seqs[2].gain.gain.value = 0.8;

    // Set coolness
    seqs[0].smoothing = 0.5;
    seqs[1].smoothing = 0.1;
    seqs[2].smoothing = 0.1;
    seqs[0].staccato = 0.4;
    seqs[1].staccato = 0.4;
    seqs[2].staccato = 0.4;

    // Set wave
    seqs[0].createCustomWave([-1,0,1,0.5,-1,0,1]);
    seqs[1].createCustomWave([-1,1,-1,1,-1,1],[1,0,1,0,1,0]);
    seqs[2].createCustomWave([-1,-0.9,-0.6,-0.3, 0, 0.3, 0.6, 0.9,1]);

    // Start all sequence
    exports.audioStart = function() {
        seqs[0].play();
        seqs[1].play();
        seqs[2].play();
    };

    exports.audioAddPreset = function(seq,preset) {

    };

    // Adds loop to seq
    exports.audioAddLoop = function(seq,pattern,loop) {
        seqs[seq].push.apply(seqs[seq], patterns[pattern][loop]);
    };

    exports.audioStart();

    // Add loop one.
    exports.audioAddLoop(0,0,0);
    exports.audioAddLoop(1,1,0);
    exports.audioAddLoop(2,2,0);

    // Add loop two.
    exports.audioAddLoop(0,0,1);
    exports.audioAddLoop(1,1,1);
    exports.audioAddLoop(2,2,1);

    // Mess with all the things
    exports.audioAddLoop(0,2,1);
    exports.audioAddLoop(1,0,1);
    exports.audioAddLoop(2,1,0);

})(window.game);
