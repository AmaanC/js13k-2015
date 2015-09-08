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
    tracks.default.lead = [
      'G3 q',
      'E4 q',
      'C4 h'
    ];
    tracks.default.harm = [
      'G3 q',
      'E4 q',
      'C4 h'
    ];
    tracks.default.bass = [
      'G3 q',
      'E4 q',
      'C4 h'
    ];

    // Create magic
    var ac = new AudioContext();

    // Create audio
    var audio = {};
    exports.audio = audio;
    audio.tempo = 90;
    audio.track = tracks.default;

    // Give band tempo and music
    audio.lead = new TinyMusic.Sequence( ac, audio.tempo, audio.track.lead );
    audio.harm = new TinyMusic.Sequence( ac, audio.tempo, audio.track );
    audio.bass = new TinyMusic.Sequence( ac, audio.tempo, audio.track );

    exports.audioStart = function () {
        audio.lead.play();
        audio.harm.play();
        audio.bass.play();
    };

    exports.audioStop = function () {
        audio.lead.stop();
        audio.harm.stop();
        audio.bass.stop();
    };

})(window.game);
