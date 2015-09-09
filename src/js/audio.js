// Tiny audio with tinymusic!
// Tracks are sheet music,
// Audio contain the tempo, instruments ( + sheet music ).
// Audio can be stop / started.
(function(exports) {

    // Tracks
    var tracks = {};
    exports.tracks = tracks;

    // Tracks - Default
    tracks.default = {};

    // TODO: Move to eighths to mirror drum loop.
    tracks.default.lead = [
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
    ];
    tracks.default.harm = [
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
        '-   q',
    ];
    tracks.default.bass = [
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

    // Create magic
    var ac = new AudioContext();

    // Create audio
    var audio = {};
    exports.audio = audio;

    // Tempo and track
    audio.tempo = 120;
    audio.track = tracks.default;

    // Give band tempo and music
    var lead = new TinyMusic.Sequence( ac, audio.tempo, audio.track.lead );
    var harm = new TinyMusic.Sequence( ac, audio.tempo, audio.track.harm );
    var bass = new TinyMusic.Sequence( ac, audio.tempo, audio.track.bass );

    exports.lead = lead;
    exports.audio.harm = harm;
    exports.audio.bass = bass;

    // TODO: Make these easier to change, ala presets
    lead.staccato = 0.55;
    harm.staccato = 0;
    bass.staccato = 0.5;

    lead.gain.gain.value = 1.0;
    harm.gain.gain.value = 0.2;
    bass.gain.gain.value = 0.1;

    lead.mid.frequency.value = 800;
    lead.mid.gain.value = 3;
    harm.mid.frequency.value = 1200;
    bass.mid.gain.value = 3;
    bass.bass.gain.value = -6;
    bass.bass.frequency.value = 80;
    bass.mid.gain.value = -6;
    bass.mid.frequency.value = 100;
    bass.treble.gain.value = -2;
    bass.treble.frequency.value = 1400;

    exports.audioStart = function () {
        lead.play();
        harm.play();
        bass.play();
    };

    exports.audioStop = function () {
        lead.stop();
        harm.stop();
        bass.stop();
    };

    // Lazy...
    exports.audioStart();

})(window.game);
