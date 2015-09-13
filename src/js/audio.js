// Tiny audio with tinymusic!
// Tracks are sheet music,
// Audio emulates nanoloop app.
(function(exports) {
    exports.musicEnabled = ('musicEnabled' in localStorage) ? localStorage.musicEnabled === 'true' : true;
    console.log(exports.musicEnabled);

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
        'D5  s',
        'D5  s',
        'D5  e',
        'D5  e',
        'D5  s',
        'D5  s',
        'D5  s',
        'D5  s',
        'D5  e',
        'D5  s',
        'D5  s',
        'D5  s',
        'D5  s',

        'D5  s',
        'D5  s',
        'D5  e',
        'D5  e',
        'D5  s',
        'D5  s',
        'D5  s',
        'D5  s',
        'D5  e',
        'D5  s',
        'D5  e',
        '_   e'
    ];
    patterns[0][1] = [
        'A4  s',
        'A4  s',
        'A4  e',
        'A4  e',
        'A4  s',
        'A4  s',
        'A4  s',
        'A4  s',
        'A4  e',
        'A4  s',
        'A4  s',
        'A4  s',
        'A4  s',

        'A4  s',
        'A4  s',
        'A4  e',
        'A4  e',
        'A4  s',
        'A4  s',
        'A4  s',
        'A4  s',
        'A4  e',
        'A4  s',
        'A4  e',
        '_4  s'
    ];

    // Harmony
    patterns[1] = [];
    patterns[1][0] = [
        'G4  w',

        'F4  w',

        'B4  w',

        'F4  w',
    ];

    // Lead.
    patterns[2] = [];
    patterns[2][0] = [
        '-  w',

        '-  w',

        '-  w',

        '-  w',
    ];
    patterns[2][1] = [
        'G5  e',
        'G5  e',
        'G5  e',
        'B5  e',
        'B5  e',
        'A5  e',
        'G5  e',
        'G5  e',

        'F5  e',
        'F5  e',
        'F5  e',
        'F5  e',
        'F5  e',
        'F5  e',
        'A5  e',
        'B5  e',

        'B5  e',
        'B5  e',
        'B5  e',
        'D6  e',
        'D6  e',
        'A5  e',
        'B5  e',
        'B5  e',

        'F5  e',
        'A5  e',
        'A5  e',
        'F5  e',
        'F5  e',
        'F5  e',
        'F5  e',
        'A5  e',
    ];
    // Create sequences
    var seqs = [];
    seqs[0] = new TinyMusic.Sequence(ac, audio.tempo, []);
    seqs[1] = new TinyMusic.Sequence(ac, audio.tempo, []);
    seqs[2] = new TinyMusic.Sequence(ac, audio.tempo, []);

    // Set volume
    seqs[0].gain.gain.value = 0.3;
    seqs[1].gain.gain.value = 0.1;
    seqs[2].gain.gain.value = 0.5;

    // Set coolness
    seqs[0].smoothing = 0.5;
    seqs[1].smoothing = 0.2;
    seqs[2].smoothing = 0.1;
    seqs[0].staccato = 0.4;
    seqs[1].staccato = 0.3;
    seqs[2].staccato = 0.4;

    // Set wave - square, sine, sawtooth, triangle, custom
    seqs[0].waveType = 'sine';
    seqs[1].waveType = 'square';
    seqs[2].waveType = 'square';

    // Start all sequence
    exports.audioStart = function() {
        if (exports.musicEnabled !== true) {
            return;
        }
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
        localStorage.musicEnabled = exports.musicEnabled;
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
    exports.audioAddLoop(0,0,0);
    exports.audioAddLoop(1,1,0);
    exports.audioAddLoop(2,2,0);

    exports.audioStart();

})(window.game);
