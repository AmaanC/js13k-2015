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
    audio.trackCount = 12;

    // Patterns - 4 x 16 bar.
    // w  - 1
    // h  - 1/2
    // q  - 1/4
    // e  - 1/8
    // s  - 1/16
    // es - 1/8 + 1/16
    var patterns = {};

    patterns[0] = [
        'A1 q',
        '_  q',
        'A1 q',
        '_  q',
        'A1 q',
        'A2 q',
        'A1 q',
        '_  q',
        'A1 q',
        '_  q',
        'A1 q',
        '_  q',
        'A1 q',
        'A2 q',
        'A1 q',
        '_  q',
    ];

    // Create tracks
    var tracks = [];
    for (var i = 0; i < audio.trackCount; i++) {

        var track = new TinyMusic.Sequence( ac, audio.tempo, patterns[i] );
        track.loop = true;
        tracks.push( track );

    }

    // Configure instruments
    // Smoothing
    tracks[0].smoothing = 0;
    tracks[0].staccato = 0;

    // Volume
    tracks[0].gain.gain.value = 1;

    // Mid
    tracks[0].mid.frequency.value = 800;
    tracks[0].mid.gain.value = 3;

    // Bass
    tracks[0].bass.gain.value = 6;
    tracks[0].bass.frequency.value = 80;

    // Trebile
    tracks[0].treble.gain.value = -2;
    tracks[0].treble.frequency.value = 1400;


    // Start tracks
    exports.startAudio = function() {
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].play();
        }
    };

    // Stop tracks
    exports.startStop = function() {
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
    };

})(window.game);
