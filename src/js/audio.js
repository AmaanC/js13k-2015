// Tiny audio with tinymusic!
// Tracks are sheet music,
// Audio emulates nanoloop app.
(function(exports) {
    exports.musicEnabled = true;

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
    patterns[1] = [];
    patterns[1][0] = [
        'G1  w',

        'Bb1 w',

        'B1  w',

        'C1  h',
        'C1  q',
        'B1  e',
        'A1  e',

    ];
    patterns[1][1] = [
        'G1  w',

        'Bb1 w',

        'B1  w',

        'C1  w'
    ];

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
    ];
    patterns[2][1] = [
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
    patterns[2][2] = [
        '-   w',

        '-   w',

        '-   w',

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
    patterns[2][3] = [
        'F2  e',
        'F2  e',
        'E2  e',
        'E2  e',
        'A1  e',
        'A1  e',
        'A1  e',
        'A1  s',
        'A1  s',

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

    // Create sequences
    var seqs = [];
    seqs[0] = new TinyMusic.Sequence(ac, audio.tempo, []);
    seqs[1] = new TinyMusic.Sequence(ac, audio.tempo, []);
    seqs[2] = new TinyMusic.Sequence(ac, audio.tempo, []);

    // Set volume
    seqs[0].gain.gain.value = 0.35;
    seqs[1].gain.gain.value = 0.25;
    seqs[2].gain.gain.value = 0.45;

    // Set coolness
    seqs[0].smoothing = 0.5;
    seqs[1].smoothing = 0.4;
    seqs[2].smoothing = 0.1;
    seqs[0].staccato = 0.4;
    seqs[1].staccato = 0.1;
    seqs[2].staccato = 0.4;

    // Set wave - square, sine, sawtooth, triangle, custom
    seqs[0].waveType = 'triangle';
    seqs[1].createCustomWave([-1,1,-1,1,-1,1],[1,0,1,0,1,0]);
    seqs[2].createCustomWave([-1,-0.9,-0.6,-0.3, 0, 0.3, 0.6, 0.9,1]);

    seqs[0].mid.gain.value = -6;
    seqs[0].mid.frequency.value = 500;
    seqs[1].mid.frequency.value = 800;
    seqs[1].mid.gain.value = 3;
    seqs[2].mid.frequency.value = 1200;
    seqs[2].mid.gain.value = 3;

    seqs[0].treble.gain.value = -2;
    seqs[0].treble.frequency.value = 1400;
    seqs[0].bass.gain.value = 6;
    seqs[0].bass.frequency.value = 80;

    // Start all sequence
    exports.audioStart = function() {
        seqs[0].play();
        seqs[1].play();
        seqs[2].play();
    };

    exports.audioStop = function() {
        seqs[0].stop();
        seqs[1].stop();
        seqs[2].stop();
    };

    exports.toggleMusic = function() {
        exports.musicEnabled = !exports.musicEnabled;
        if (exports.musicEnabled) {
            exports.audioStart();
        }
        else {
            exports.audioStop();
        }
    };

    exports.audioAddPreset = function(seq, preset) {

    };

    // Adds loop to seq
    exports.audioAddLoop = function(seq, pattern, loop) {
        seqs[seq].push.apply(seqs[seq], patterns[pattern][loop]);
    };

    // Add loop one
    //exports.audioAddLoop(0,0,0);
    //exports.audioAddLoop(1,1,0);
    //exports.audioAddLoop(2,2,0);

    // Add loop two
    //exports.audioAddLoop(0,0,1);
    //exports.audioAddLoop(1,1,1);
    //exports.audioAddLoop(2,2,1);

    // Add loop three
    //exports.audioAddLoop(2,2,2);

    // Add loop four
    //exports.audioAddLoop(2,2,3);

    // Mess with all the things
    //exports.audioAddLoop(0,2,1);
    //exports.audioAddLoop(1,0,1);
    //exports.audioAddLoop(2,1,0);

})(window.game);
