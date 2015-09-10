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

    // Patterns
    // w  - 1
    // h  - 1/2
    // q  - 1/4
    // e  - 1/8
    // s  - 1/16
    // es - 1/8 + 1/16
    var patterns = {};

    patterns[0] = [
        'B2 e',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
        '-  s',
    ];


    // Create tracks
    var tracks = [];
    for (var i = 0; i < audio.trackCount; i++) {
        var track = new TinyMusic.Sequence( ac, audio.tempo, patterns[i] );
        track.loop = true;
        tracks.push( track );
    }

    // Configure track 1
    // Smoothing
    tracks[0].smoothing = 0.2;
    tracks[0].staccato = 0.8;
    // Wave - square, sine, sawtooth, triangle
    tracks[0].waveType = 'sine';
    // Volume
    tracks[0].gain.gain.value = 1;
    // Others
    tracks[0].mid.gain.value = -6;
    tracks[0].mid.frequency.value = 2000;
    tracks[0].treble.gain.value = -6;
    tracks[0].treble.frequency.value = 800;
    tracks[0].bass.gain.value = 10;
    tracks[0].bass.frequency.value = 60;


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
