// Tiny audio with tinymusic!
// Tracks are sheet music,
// Nano emulates nanoloop app.
(function(exports) {

    // Tracks
    var tracks = {};
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

    // Create audio ctx, Tiny Music handles interaction
    var ac = new AudioContext();

    // Emulate nanoloops
    var nano = {};

    // Export nano
    exports.nano = nano;

    // Set tempo and patten
    nano.tempo = 120;
    nano.pattern = tracks.default;

    // Create nanoloops channels
    var chanA = new TinyMusic.Sequence( ac, nano.temp, nano.pattern.lead );
    var chanB = new TinyMusic.Sequence( ac, nano.temp, nano.pattern.bass );
    var chanC = new TinyMusic.Sequence( ac, nano.temp, nano.pattern.lead );
    var chanD = new TinyMusic.Sequence( ac, nano.temp, nano.pattern.lead );

    exports.nanoStart = function () {
        chanA.play();
        chanB.play();
        chanC.play();
        chanD.play();
    };

    exports.nanoStop = function () {
        chanA.stop();
        chanB.stop();
        chanC.stop();
        chanD.stop();
    };

    // Tests.
    //exports.nanoStart();

})(window.game);
