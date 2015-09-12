// Tiny audio with tinymusic!
// Tracks are sheet music,
// Audio emulates nanoloop app.
(function(exports) {

    // Create audio ctx, Tiny Music handles interaction
    var ac = new AudioContext();

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

    // Bass
    var bass = [];

    bass[0] = [
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
        'B1  e',
    ];
    bass[1] = [
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
        'B1  e',
    ];

    // Harmony
    var harmony = [];
    harmony[0] = [
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
    harmony[1] = [
        'G2  w',

        'Bb2 w',

        'B2  w',

        'C2  h',
        'C2  q',
        'B2  e',
        'A2  e',

        'G2  w',

        'Bb2 w',

        'B2  w',

        'C2  h',
        'C2  q',
        'B2  e',
        'A2  e'
    ];

    // Lead.
    var lead = [];
    lead[0] = [
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
        'D2  e',
    ];

    lead[1] = [
    ];

    // Create sequences
    var seqs = {};
    var seq1 = new TinyMusic.Sequence( ac, audio.tempo, bass[0] );
    var seq2 = new TinyMusic.Sequence( ac, audio.tempo, harmony[0] );
    var seq3 = new TinyMusic.Sequence( ac, audio.tempo, lead[0] );

    // Set volume
    seq1.gain.gain.value = 0.6;
    seq2.gain.gain.value = 0.8;
    seq3.gain.gain.value = 0.8;

    // Set coolness
    seq1.smoothing = 0.5;
    seq2.smoothing = 0.1;
    seq3.smoothing = 0.1;
    seq1.staccato = 0.4;
    seq2.staccato = 0.4;
    seq3.staccato = 0.4;

    // Set wave
    seq1.createCustomWave([-1,0,1,0.5,-1,0,1]);
    seq2.createCustomWave([-1,1,-1,1,-1,1],[1,0,1,0,1,0]);
    seq3.createCustomWave([-1,-0.9,-0.6,-0.3, 0, 0.3, 0.6, 0.9,1]);

    seq1.play();
    seq2.play();
    seq3.play();

})(window.game);
