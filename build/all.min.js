(function(exports) {
    var canvas = exports.canvas = document.getElementById('game');
    var ctx = exports.ctx = canvas.getContext('2d');
    if (window.innerWidth < canvas.width) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.style.margin = 0;
    }
    exports.smallerDimension = (canvas.width < canvas.height) ? canvas.width : canvas.height;
    exports.cx = canvas.width / 2;
    exports.cy = canvas.height / 2;
    exports.player = {};

    var drawLoop = function() {
        exports.backgroundDraw();
        exports.playerDraw();
        exports.particleDraw();
        exports.enemyDraw();

        if (exports.currentState === 'endScreen') {
            exports.endScreenDraw();
        }

        requestAnimationFrame(drawLoop);
    };

    var logicLoop = function() {
        exports.backgroundLogic();
        exports.particleLogic();
        exports.enemyLogic();

        setTimeout(logicLoop, 100 / 6);
    };

    var init = function() {
        drawLoop();
        logicLoop();
    };

    window.addEventListener('load', init, false);
})(window.game);
(function(exports) {
    var ctx = exports.ctx;

    var player = exports.player;
    player.cx = exports.cx;
    player.cy = exports.cy;
    player.time = 0;
    player.dist = 40;
    player.halfBase = 10;
    player.halfHeight = 10;
    player.angle = 0;
    player.canMove = true;
    player.pos = 0; // This indicates which multiple of turnStep it is. For example, with 4 sides, player would point down when pos is 1
    player.alpha = 1;
    player.DEFAULT_NUM_SHIELDS = 1;
    player.numShields = player.DEFAULT_NUM_SHIELDS; // Shields are automatically drawn with the player
    player.score = 0;
    var DIST_BETWEEN_SHIELDS = 20;
    var shieldMinDist = player.dist + 2 * player.halfHeight;
    var SHIELD_COLOR = 'white';
    var SHIELD_RANGE = 0.4;


    player.hidePlayer = function() {
        player.alpha = 0;
        setTimeout(function() {
            player.color = player.skins.default;
        }, 1000);
    };

    player.isColliding = function(objCenterDist) {
        // Only in terms of distance, not in position
        if (
            (player.numShields <= 0 && objCenterDist <= player.dist) ||
            (player.numShields > 0 && objCenterDist <= player.numShields * DIST_BETWEEN_SHIELDS + shieldMinDist)
        ) {
            return true;
        }
        return false;
    };

    var shieldDraw = function() {
        ctx.strokeStyle = SHIELD_COLOR;
        for (var i = 1; i <= player.numShields; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, shieldMinDist + i * DIST_BETWEEN_SHIELDS, -SHIELD_RANGE, SHIELD_RANGE, false);
            ctx.closePath();
            ctx.stroke();
        }
    };

    exports.playerDraw = function() {
        var cx = player.cx;
        var cy = player.cy;
        var hb = player.halfBase;
        var hh = player.halfHeight;
        ctx.save();

        ctx.translate(cx, cy);
        ctx.rotate(player.angle);
        shieldDraw();

        // The triangle points to the right by default
        ctx.translate(player.dist + hh, 0);

        // Draw path
        ctx.beginPath();
        ctx.moveTo(-hh, -hb);
        ctx.lineTo(-hh, hb);
        ctx.lineTo(hh, 0);
        ctx.closePath();
        ctx.restore();

        // Stroke
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba('+player.color+', ' + player.alpha + ')';
        ctx.stroke();

        // Fill
        ctx.fillStyle = 'rgba('+player.color+', 0)';
        ctx.fill();


    };

    exports.turnPlayer = function(dir) {
        player.pos += dir;
        if (player.pos >= exports.sides) {
            player.pos %= exports.sides;
        }
        if (player.pos < 0) {
            player.pos = exports.sides + player.pos;
        }
        player.angle = exports.turnStep * player.pos;
        player.restAngle = player.angle;
    };

    exports.setPlayerDirection = function(dir) {
        exports.playerDirection = dir;
        if (exports.playerDirection > 0) {
            exports.ctx.globalCompositeOperation = 'source-over';
        }
        else {
            exports.ctx.globalCompositeOperation = 'difference';
        }
    };

})(window.game);

(function(exports) {
    // Used in player.js
    exports.player.skins = {
        default: '13, 213, 252',
        flashColor: '255, 184, 253' // The color it flashes briefly when hit
    };
    exports.player.color = exports.player.skins.default;

    // Used in gameHandler.js
    exports.HIT_PARTICLE_COLORS = ['red']; // The color of the particles emitted when the player's triangle is crushed
    exports.NORMAL_ENEMY_COLOR = 'white';
    exports.REVERSER_ENEMY_COLOR = 'green';

    // Used in background.js
    exports.DEFAULT_BACKGROUND_COLORS = ['#BF0C43', '#F9BA15', '#8EAC00', '#127A97', '#452B72'];
    exports.INDICATOR_COLOR = 'white';
})(window.game);
(function ( root, factory ) {
  if ( typeof define === 'function' && define.amd ) {
    define( [ 'exports' ], factory );
  } else if ( typeof exports === 'object' && typeof exports.nodeName !== 'string' ) {
    factory( exports );
  } else {
    factory( root.TinyMusic = {} );
  }
}( this, function ( exports ) {

/*
 * Private stuffz
 */

var enharmonics = 'B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb',
  middleC = 440 * Math.pow( Math.pow( 2, 1 / 12 ), -9 ),
  numeric = /^[0-9.]+$/,
  octaveOffset = 4,
  space = /\s+/,
  num = /(\d+)/,
  offsets = {};

// populate the offset lookup (note distance from C, in semitones)
enharmonics.split('|').forEach(function( val, i ) {
  val.split('-').forEach(function( note ) {
    offsets[ note ] = i;
  });
});

/*
 * Note class
 *
 * new Note ('A4 q') === 440Hz, quarter note
 * new Note ('- e') === 0Hz (basically a rest), eigth note
 * new Note ('A4 es') === 440Hz, dotted eighth note (eighth + sixteenth)
 * new Note ('A4 0.0125') === 440Hz, 32nd note (or any arbitrary
 * divisor/multiple of 1 beat)
 *
 */

// create a new Note instance from a string
function Note( str ) {
  var couple = str.split( space );
  // frequency, in Hz
  this.frequency = Note.getFrequency( couple[ 0 ] ) || 0;
  // duration, as a ratio of 1 beat (quarter note = 1, half note = 0.5, etc.)
  this.duration = Note.getDuration( couple[ 1 ] ) || 0;
}

// convert a note name (e.g. 'A4') to a frequency (e.g. 440.00)
Note.getFrequency = function( name ) {
  var couple = name.split( num ),
    distance = offsets[ couple[ 0 ] ],
    octaveDiff = ( couple[ 1 ] || octaveOffset ) - octaveOffset,
    freq = middleC * Math.pow( Math.pow( 2, 1 / 12 ), distance );
  return freq * Math.pow( 2, octaveDiff );
};

// convert a duration string (e.g. 'q') to a number (e.g. 1)
// also accepts numeric strings (e.g '0.125')
// and compund durations (e.g. 'es' for dotted-eight or eighth plus sixteenth)
Note.getDuration = function( symbol ) {
  return numeric.test( symbol ) ? parseFloat( symbol ) :
    symbol.toLowerCase().split('').reduce(function( prev, curr ) {
      return prev + ( curr === 'w' ? 4 : curr === 'h' ? 2 :
        curr === 'q' ? 1 : curr === 'e' ? 0.5 :
        curr === 's' ? 0.25 : 0 );
    }, 0 );
};

/*
 * Sequence class
 */

// create a new Sequence
function Sequence( ac, tempo, arr ) {
  this.ac = ac || new AudioContext();
  this.createFxNodes();
  this.tempo = tempo || 120;
  this.loop = true;
  this.smoothing = 0;
  this.staccato = 0;
  this.notes = [];
  this.push.apply( this, arr || [] );
}

// create gain and EQ nodes, then connect 'em
Sequence.prototype.createFxNodes = function() {
  var eq = [ [ 'bass', 100 ], [ 'mid', 1000 ], [ 'treble', 2500 ] ],
    prev = this.gain = this.ac.createGain();
  eq.forEach(function( config, filter ) {
    filter = this[ config[ 0 ] ] = this.ac.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = config[ 1 ];
    prev.connect( prev = filter );
  }.bind( this ));
  prev.connect( this.ac.destination );
  return this;
};

// accepts Note instances or strings (e.g. 'A4 e')
Sequence.prototype.push = function() {
  Array.prototype.forEach.call( arguments, function( note ) {
    this.notes.push( note instanceof Note ? note : new Note( note ) );
  }.bind( this ));
  return this;
};

// create a custom waveform as opposed to "sawtooth", "triangle", etc
Sequence.prototype.createCustomWave = function( real, imag ) {
  // Allow user to specify only one array and dupe it for imag.
  if ( !imag ) {
    imag = real;
  }

  // Wave type must be custom to apply period wave.
  this.waveType = 'custom';

  // Reset customWave
  this.customWave = [ new Float32Array( real ), new Float32Array( imag ) ];
};

// recreate the oscillator node (happens on every play)
Sequence.prototype.createOscillator = function() {
  this.stop();
  this.osc = this.ac.createOscillator();

  // customWave should be an array of Float32Arrays. The more elements in
  // each Float32Array, the dirtier (saw-like) the wave is
  if ( this.customWave ) {
    this.osc.setPeriodicWave(
      this.ac.createPeriodicWave.apply( this.ac, this.customWave )
    );
  } else {
    this.osc.type = this.waveType || 'square';
  }

  this.osc.connect( this.gain );
  return this;
};

// schedules this.notes[ index ] to play at the given time
// returns an AudioContext timestamp of when the note will *end*
Sequence.prototype.scheduleNote = function( index, when ) {
  var duration = 60 / this.tempo * this.notes[ index ].duration,
    cutoff = duration * ( 1 - ( this.staccato || 0 ) );

  this.setFrequency( this.notes[ index ].frequency, when );

  if ( this.smoothing && this.notes[ index ].frequency ) {
    this.slide( index, when, cutoff );
  }

  this.setFrequency( 0, when + cutoff );
  return when + duration;
};

// get the next note
Sequence.prototype.getNextNote = function( index ) {
  return this.notes[ index < this.notes.length - 1 ? index + 1 : 0 ];
};

// how long do we wait before beginning the slide? (in seconds)
Sequence.prototype.getSlideStartDelay = function( duration ) {
  return duration - Math.min( duration, 60 / this.tempo * this.smoothing );
};

// slide the note at <index> into the next note at the given time,
// and apply staccato effect if needed
Sequence.prototype.slide = function( index, when, cutoff ) {
  var next = this.getNextNote( index ),
    start = this.getSlideStartDelay( cutoff );
  this.setFrequency( this.notes[ index ].frequency, when + start );
  this.rampFrequency( next.frequency, when + cutoff );
  return this;
};

// set frequency at time
Sequence.prototype.setFrequency = function( freq, when ) {
  this.osc.frequency.setValueAtTime( freq, when );
  return this;
};

// ramp to frequency at time
Sequence.prototype.rampFrequency = function( freq, when ) {
  this.osc.frequency.linearRampToValueAtTime( freq, when );
  return this;
};

// run through all notes in the sequence and schedule them
Sequence.prototype.play = function( when ) {
  when = typeof when === 'number' ? when : this.ac.currentTime;

  this.createOscillator();
  this.osc.start( when );

  this.notes.forEach(function( note, i ) {
    when = this.scheduleNote( i, when );
  }.bind( this ));

  this.osc.stop( when );
  this.osc.onended = this.loop ? this.play.bind( this, when ) : null;

  return this;
};

// stop playback, null out the oscillator, cancel parameter automation
Sequence.prototype.stop = function() {
  if ( this.osc ) {
    this.osc.onended = null;
    this.osc.disconnect();
    this.osc = null;
  }
  return this;
};

  exports.Note = Note;
  exports.Sequence = Sequence;
}));

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
    //exports.audioAddLoop(0,0,1);
    //exports.audioAddLoop(1,1,1);
    //exports.audioAddLoop(2,2,1);

    // Mess with all the things
    //exports.audioAddLoop(0,2,1);
    //exports.audioAddLoop(1,0,1);
    //exports.audioAddLoop(2,1,0);

})(window.game);

// Adapted from https://github.com/PaulBGD/PixelFont

(function(exports) {
    var letters = {
        'A': [
            [, 1],
            [1, , 1],
            [1, , 1],
            [1, 1, 1],
            [1, , 1]
        ],
        'B': [
            [1, 1],
            [1, , 1],
            [1, 1, 1],
            [1, , 1],
            [1, 1]
        ],
        'C': [
            [1, 1, 1],
            [1],
            [1],
            [1],
            [1, 1, 1]
        ],
        'D': [
            [1, 1],
            [1, , 1],
            [1, , 1],
            [1, , 1],
            [1, 1]
        ],
        'E': [
            [1, 1, 1],
            [1],
            [1, 1, 1],
            [1],
            [1, 1, 1]
        ],
        'F': [
            [1, 1, 1],
            [1],
            [1, 1],
            [1],
            [1]
        ],
        'G': [
            [, 1, 1],
            [1],
            [1, , 1, 1],
            [1, , , 1],
            [, 1, 1]
        ],
        'H': [
            [1, , 1],
            [1, , 1],
            [1, 1, 1],
            [1, , 1],
            [1, , 1]
        ],
        'I': [
            [1, 1, 1],
            [, 1],
            [, 1],
            [, 1],
            [1, 1, 1]
        ],
        'J': [
            [1, 1, 1],
            [, , 1],
            [, , 1],
            [1, , 1],
            [1, 1, 1]
        ],
        'K': [
            [1, , , 1],
            [1, , 1],
            [1, 1],
            [1, , 1],
            [1, , , 1]
        ],
        'L': [
            [1],
            [1],
            [1],
            [1],
            [1, 1, 1]
        ],
        'M': [
            [1, 1, 1, 1, 1],
            [1, , 1, , 1],
            [1, , 1, , 1],
            [1, , , , 1],
            [1, , , , 1]
        ],
        'N': [
            [1, , , 1],
            [1, 1, , 1],
            [1, , 1, 1],
            [1, , , 1],
            [1, , , 1]
        ],
        'O': [
            [1, 1, 1],
            [1, , 1],
            [1, , 1],
            [1, , 1],
            [1, 1, 1]
        ],
        'P': [
            [1, 1, 1],
            [1, , 1],
            [1, 1, 1],
            [1],
            [1]
        ],
        'Q': [
            [0, 1, 1],
            [1, , , 1],
            [1, , , 1],
            [1, , 1, 1],
            [1, 1, 1, 1]
        ],
        'R': [
            [1, 1],
            [1, , 1],
            [1, , 1],
            [1, 1],
            [1, , 1]
        ],
        'S': [
            [1, 1, 1],
            [1],
            [1, 1, 1],
            [, , 1],
            [1, 1, 1]
        ],
        'T': [
            [1, 1, 1],
            [, 1],
            [, 1],
            [, 1],
            [, 1]
        ],
        'U': [
            [1, , 1],
            [1, , 1],
            [1, , 1],
            [1, , 1],
            [1, 1, 1]
        ],
        'V': [
            [1, , , , 1],
            [1, , , , 1],
            [, 1, , 1],
            [, 1, , 1],
            [, , 1]
        ],
        'W': [
            [1, , , , 1],
            [1, , , , 1],
            [1, , , , 1],
            [1, , 1, , 1],
            [1, 1, 1, 1, 1]
        ],
        'X': [
            [1, , , , 1],
            [, 1, , 1],
            [, , 1],
            [, 1, , 1],
            [1, , , , 1]
        ],
        'Y': [
            [1, , 1],
            [1, , 1],
            [, 1],
            [, 1],
            [, 1]
        ],
        'Z': [
            [1, 1, 1, 1, 1],
            [, , , 1],
            [, , 1],
            [, 1],
            [1, 1, 1, 1, 1]
        ],
        '0': [
            [1, 1, 1],
            [1, , 1],
            [1, , 1],
            [1, , 1],
            [1, 1, 1]
        ],
        '1': [
            [, 1],
            [, 1],
            [, 1],
            [, 1],
            [, 1]
        ],
        ' ': [
            [, ,],
            [, ,],
            [, ,],
            [, ,],
            [, ,]
        ],
        ':': [
            [, ,],
            [, 1,],
            [, ,],
            [, ,],
            [, 1,]
        ]
    };
    var ctx = exports.ctx;
    var canvas = exports.canvas;

    exports.write = function(string, xPos, yPos, size, color) {
        var needed = [];
        string = string.toUpperCase(); // because I only did uppercase letters
        for (var i = 0; i < string.length; i++) {
            var letter = letters[string.charAt(i)];
            if (letter) { // because there's letters I didn't do
                needed.push(letter);
            }
        }

        ctx.fillStyle = color || 'black';
        var currX = xPos;
        var totalLen;
        if (xPos === 'center') {
            totalLen = letter[0].length * size * needed.length + (needed.length - 1) * size;
            // The above is basically = sizeof(all characters) + sizeof(spaces between characters)
            currX = exports.cx - totalLen / 2;
        }
        if (yPos === 'center') {
            totalLen = letter.length * size;
            yPos = exports.cy - totalLen / 2;
        }
        for (i = 0; i < needed.length; i++) {
            letter = needed[i];
            var currY = yPos;
            var addX = 0;
            for (var y = 0; y < letter.length; y++) {
                var row = letter[y];
                for (var x = 0; x < row.length; x++) {
                    if (row[x]) {
                        ctx.fillRect(currX + x * size, currY, size, size);
                    }
                }
                addX = row.length * size;
                currY += size;
            }
            currX += size + addX;
        }
    };
})(window.game);
(function(exports) {
    exports.keys = {};
    exports.playerDirection = 1; // Becomes -1 when things should be reversed

    var inputPressed = function(direction) {
        if (!exports.player.canMove) {
            return;
        }
        if (direction === 'left') {
            exports.turnPlayer(-exports.playerDirection);
        }
        else if (direction === 'right') {
            exports.turnPlayer(exports.playerDirection);
        }
    };

    document.body.addEventListener('keydown', function(e) {
        exports.keys[e.keyCode] = true;
        if (e.keyCode === 39) {
            inputPressed('right');
        }
        else if (e.keyCode === 37) {
            inputPressed('left');
        }
    });
    document.body.addEventListener('keyup', function(e) {
        exports.keys[e.keyCode] = false;
    });

    document.body.addEventListener('touchstart', function(e) {
        console.log(e.changedTouches[0].pageX);
        if (e.changedTouches[0].pageX < exports.cx) {
            inputPressed('left');
        }
        else {
            inputPressed('right');
        }
    });
})(window.game);
// The game has "stages", which are represented by different shapes, i.e. the square is one stage, and then the pentagon is the next.
// Within each stage, there are the following levels:
// 1) Faster enemies
// 2) Player spins X degrees just before the enemies attack. Player has to start accounting for this
// To cross one level, the player has to dodge the enemy blocks N times. N is the number of waves.
// When these levels have been crossed, the player goes to the next stage.

// (function(exports) {
    var exports = window.game;



    exports.sides = 4; // The number of sides that the player can turn
    var ticks = 0;
    var maxWait = 20;
    var spinAmount = 2; // Will be randomized on different levels

    var enemies = [];
    var enemyPositions = [];
    var ENEMY_HEIGHT = 50;
    var ENEMY_WIDTH = 20;
    var DEFAULT_ENEMY_SPEED = 10;
    var SPEED_LIMIT = 20;
    var ENEMY_CENTER_DIST = 500;
    var MIN_ENEMIES = 1;
    var MIN_EMPTY_SPOTS = 1; // Minimum number of spots the player has to dodge enemies
    var crusherEnemyIndex = -1; // The index of the enemy which crushed the player

    var ODDS_OF_REVERSER = 0.15; // The odds of an enemy having the power to reverse the player's controls when it hits the player

    var difficultyLevel = 1; // This follows the level progression description at the top of the file
    var numCrossed = 0; // How many "waves" has the player already dodged? When they cross X waves, we increase the difficulty level
    var enemySpeed = DEFAULT_ENEMY_SPEED; // Changed for level 2
    var spinPlayer = false;
    var LAST_STAGE = 5; // When you get to the end of this stage (shape), the levels reverse
    var FIRST_STAGE = 4;
    var progressionDirection = 1; // Becomes -1 when you cross the last shape

    var WAIT_DIST = 0.35 * exports.smallerDimension;
    var MOVE_IN_SPEED = 5; // Speed at which it moves in from outside the screen to the wait position
    var CRUSH_SPEED = 1;

    var NUM_PARTICLES = 5; // Particles created on collision
    var PARTICLE_SPEED_FOR_SHIELD = 1;
    var PARTICLE_SPEED_FOR_PLAYER = 0.3;
    var PARTICLE_OFFSET = Math.PI / 2;
    var PARTICLE_RANGE = 0.4;
    var SHAKE_INTENSITY = 4;
    var DEC_RATE_FOR_SHIELD_PARTICLES = 0.02;
    var DEC_RATE_FOR_PLAYER_PARTICLES = 0.005;

    var MAX_SHIELDS = 3;

    // How much the score increases by when you cross a wave, a level, or a stage (shape)
    var WAVE_CROSSED_SCORE = 10; // Multiplied by the level you're on, so you get more points on level 2 than on level 1
    var LEVEL_CHANGE_SCORE = 100;
    var SHAPE_CHANGE_SCORE = 300;
    var SHIELD_LOST_SCORE = -30;


    exports.turnStep = 2 * Math.PI / exports.sides;

    // Possible states: complete, movingIn, waiting, attacking
    // Complete: an attack was just completed and new enemies need to slide in
    // Moving In: enemies are moving to position from outside the screen
    // Waiting: enemies are in position, and we're waiting to give the player time
    // Spinning: player is spinning with the background (only when the difficulty is appropriate)
    // Attacking: Animate enemies moving in toward the player from their waiting position
    // Crushing: The player didn't dodge, so the crushing animation is playing right now
    exports.currentState = 'complete';

    exports.reset = function() {
        exports.changeSides(FIRST_STAGE);
        enemies = [];
        numCrossed = 0;
        difficultyLevel = 1;
        spinPlayer = false;
        progressionDirection = 1;
        exports.setPlayerDirection(1);
        exports.player.alpha = 1;
        exports.player.numShields = exports.player.DEFAULT_NUM_SHIELDS;

        exports.currentState = 'complete';
    };

    exports.changeSides = function(n) {
        enemies = [];
        exports.currentState = 'complete';
        exports.sides = n;
        exports.turnStep = 2 * Math.PI / exports.sides;
        exports.player.pos = 0;
        exports.player.angle = 0;
        exports.player.restAngle = 0;
        exports.initBackground();
    };

    exports.enemyDraw = function() {
        var enemy;
        var ctx = exports.ctx;
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            ctx.save();
            ctx.translate(exports.cx, exports.cy);
            ctx.rotate(enemy.angle);
            ctx.fillStyle = enemy.reverser ? exports.REVERSER_ENEMY_COLOR : exports.NORMAL_ENEMY_COLOR;
            ctx.fillRect(enemy.centerDist, -ENEMY_HEIGHT / 2, ENEMY_WIDTH, ENEMY_HEIGHT);
            ctx.restore();
        }
    };

    var addEnemy = function(angle) {
        var obj = {};
        obj.angle = angle || 0;
        obj.centerDist = ENEMY_CENTER_DIST;
        obj.reverser = (progressionDirection === 1) ? Math.random() < ODDS_OF_REVERSER : false;

        obj.time = 0;

        enemies.push(obj);
    };

    var range = function(min, max) {
        var ret = [];
        for (var i = min; i < max; i++) {
            ret.push(i);
        }
        return ret;
    };

    var makeEnemyWave = function() {
        var possible = range(0, exports.sides);
        var numToRemove = MIN_ENEMIES + Math.floor(Math.random() * (exports.sides - MIN_EMPTY_SPOTS - 1));

        for (var i = 0; i < numToRemove; i++) {
            possible.splice(Math.floor(Math.random() * possible.length), 1);
        }

        for (i = 0; i < possible.length; i++) {
            addEnemy(exports.turnStep * possible[i]);
        }

        exports.currentState = 'movingIn';
        return possible;
    };

    var playerInTheWay = function() {
        crusherEnemyIndex = enemyPositions.indexOf(exports.player.pos);
        if (crusherEnemyIndex != -1) {
            return true;
        }
        return false;
    };
    // Animate enemies to a certain position and call cb when it reaches it
    var animateEnemies = function(min, speed, cb, checkFn) {
        var allReached = true;
        
        for (var i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            enemy.centerDist -= speed || 5;
            if (enemy.centerDist <= min) {
                enemy.centerDist = min;
            }
            else {
                allReached = false;
            }
        }
        if (allReached) {
            cb();
        }
        else if (checkFn) {
            checkFn();
        }
    };

    var updateIndicator = function() {
        exports.indicatorObj.numSides = numCrossed;
    };

    var makePlayerSpin = function(cb) {
        exports.spinAnimate(exports.player, function() {
            exports.turnPlayer(exports.steps);
            exports.spinning = false;
            cb();
        });
    };

    var resetNumCrossed = function() {
        numCrossed = (progressionDirection === 1) ? 0 : exports.sides;
    };

    var afterDifficultySpin = function() {
        resetNumCrossed();
        updateIndicator();
        exports.currentState = 'complete';
    };

    var addShield = function() {
        if (exports.player.numShields < MAX_SHIELDS) {
            exports.player.numShields++;
        }
    };

    var playerHit = function() {
        if (crusherEnemyIndex < 0) {
            return;
        }
        // Here's what happens when the player is hit
        if (enemies[crusherEnemyIndex].reverser) {
            exports.setPlayerDirection(-exports.playerDirection);
        }
        resetNumCrossed();
        updateIndicator();
        if (exports.player.numShields > 0) {
            exports.player.numShields--;
            exports.player.score += SHIELD_LOST_SCORE;
            // Explode the block into pieces
            exports.createParticles(
                Math.random() * NUM_PARTICLES + 1,
                exports.cx,
                exports.cy,
                exports.HIT_PARTICLE_COLORS,
                PARTICLE_SPEED_FOR_SHIELD,
                exports.player.angle + Math.PI,
                PARTICLE_RANGE,
                DEC_RATE_FOR_SHIELD_PARTICLES
            );
            exports.currentState = 'complete';
            exports.shakeScreen(SHAKE_INTENSITY);
            return;
        }
        exports.currentState = 'crushing';
        exports.player.color = exports.player.skins.flashColor;
        setTimeout(function() {
            exports.player.color = exports.player.skins.default;
        }, 100);
        exports.createParticles(
            Math.random() * NUM_PARTICLES + 1,
            exports.cx,
            exports.cy,
            exports.HIT_PARTICLE_COLORS,
            PARTICLE_SPEED_FOR_PLAYER,
            exports.player.angle + PARTICLE_OFFSET,
            PARTICLE_RANGE,
            DEC_RATE_FOR_PLAYER_PARTICLES
        );
        exports.createParticles(
            Math.random() * NUM_PARTICLES + 1,
            exports.cx,
            exports.cy,
            exports.HIT_PARTICLE_COLORS,
            PARTICLE_SPEED_FOR_PLAYER,
            exports.player.angle - PARTICLE_OFFSET,
            PARTICLE_RANGE,
            DEC_RATE_FOR_PLAYER_PARTICLES
        );

        exports.shakeScreen(SHAKE_INTENSITY);
    };

    var increaseDifficulty = function() {
        numCrossed += progressionDirection;
        exports.player.score += WAVE_CROSSED_SCORE * difficultyLevel;
        if (numCrossed > exports.sides || numCrossed < 0) {
            exports.player.score += LEVEL_CHANGE_SCORE;
            difficultyLevel += progressionDirection;
            exports.triggerSpin(exports.sides * progressionDirection);
            enemies = [];
            exports.player.time = 2 * exports.NUM_SHAPES;
            exports.currentState = 'increasingDifficulty';
            addShield();
            console.log('Difficulty:', difficultyLevel);
        }
        updateIndicator();

        switch(difficultyLevel) {
            case 1:
                spinPlayer = false;
                enemySpeed += progressionDirection * (SPEED_LIMIT - DEFAULT_ENEMY_SPEED) / exports.sides;
                if (enemySpeed > SPEED_LIMIT) {
                    enemySpeed = SPEED_LIMIT;
                }
                if (enemySpeed < DEFAULT_ENEMY_SPEED) {
                    enemySpeed = DEFAULT_ENEMY_SPEED;
                }
                break;
            case 2:
                spinPlayer = true;
                break;
            // If we're going in reverse or if we're going straight ahead, we want to loop over to whichever level is apt
            case 0:
            case 3:
                // Check if we're at either ends of the "stages"
                exports.player.score += SHAPE_CHANGE_SCORE;
                if ((exports.sides >= LAST_STAGE && difficultyLevel === 3) || (exports.sides <= FIRST_STAGE && difficultyLevel === 0)) {
                    progressionDirection *= -1;
                    exports.sides -= progressionDirection;
                    exports.setPlayerDirection(progressionDirection);
                }
                exports.changeSides(exports.sides + progressionDirection);
                exports.currentState = 'increasingDifficulty';
                exports.triggerSpin(exports.sides * progressionDirection);
                if (progressionDirection === 1) {
                    difficultyLevel = 1;
                    enemySpeed = DEFAULT_ENEMY_SPEED;
                    spinPlayer = false;
                }
                else {
                    difficultyLevel = 2;
                    enemySpeed = SPEED_LIMIT;
                    spinPlayer = true;
                }
                break;
        }
    };

    exports.enemyLogic = function() {
        switch(exports.currentState) {
            case 'complete':
                exports.player.canMove = true;
                enemies = [];
                enemyPositions = makeEnemyWave();
                break;
            case 'movingIn':
                animateEnemies(WAIT_DIST, MOVE_IN_SPEED, function() {
                    exports.currentState = 'waiting';
                });
                break;
            case 'waiting':
                ticks++;
                if (ticks > maxWait) {
                    ticks = 0;
                    exports.currentState = 'attacking';
                    if (spinPlayer) {
                        exports.triggerSpin(progressionDirection * spinAmount);
                        exports.player.time = 2 * exports.NUM_SHAPES;
                        exports.currentState = 'spinning';
                        exports.player.canMove = false;
                    }
                }
                break;
            case 'spinning':
                if (exports.spinning) {
                    makePlayerSpin(function() {
                        exports.currentState = 'attacking';
                    });
                }
                break;
            case 'attacking':
                exports.player.canMove = true;
                animateEnemies(exports.player.dist + exports.player.halfHeight, enemySpeed, function() {
                    if (playerInTheWay()) {
                        playerHit();
                    }
                    else {
                        exports.currentState = 'complete';
                        increaseDifficulty();
                    }
                }, function() {
                    if (playerInTheWay() && exports.player.isColliding(enemies[0].centerDist)) {
                        // A shield was hit
                        playerHit();
                        return;
                    }
                });
                break;
            case 'crushing':
                exports.player.canMove = false;
                animateEnemies(exports.player.dist, CRUSH_SPEED, function() {
                    exports.player.hidePlayer();
                    exports.currentState = 'endScreen';
                    exports.ctx.globalCompositeOperation = 'xor';
                });
                break;
            case 'increasingDifficulty':
                exports.player.canMove = false;
                makePlayerSpin(afterDifficultySpin);
                if (exports.allShapesDoneSpinning) {
                    afterDifficultySpin();
                }
                break;
        }
    };

// })(window.game);
// This file contains most of the visual effects used in the game. I've tried to make every function self contained so that copying just that
// function itself is enough to get that effect.
(function(exports) {
    exports.shakeScreen = (function() {    
        var polarity = function() {
            return Math.random() > 0.5 ? 1 : -1;
        };

        // Amount we've moved so far
        var totalX = 0;
        var totalY = 0;

        return function(intensity) {
            var ctx = exports.ctx;
            if (totalX === 0) {
                ctx.save();
            }
            if (!intensity) {
                intensity = 2;
            }
            var dX = Math.random() * intensity * polarity();
            var dY = Math.random() * intensity * polarity();
            totalX += dX;
            totalY += dY;

            // Bring the screen back to its usual position every "2 intensity" so as not to get too far away from the center
            if (intensity % 2 < 0.2) {
                ctx.translate(-totalX, -totalY);
                totalX = totalY = 0;
                if (intensity <= 0.15) {
                    ctx.restore(); // Just to make sure it goes back to normal
                    return true;
                }
            }
            ctx.translate(dX, dY);
            setTimeout(function() {
                exports.shakeScreen(intensity - 0.1);
            }, 5);
        };
    })();

    
    exports.createParticles = (function() {
        var particles = [];
        var W = 7, H = 7;
        var DEC_RATE = 0.02; // Default decrease rate. Higher rate -> particles go faster

        exports.particleDraw = function() {
            for (var i = 0; i < particles.length; i++) {
                particles[i].draw();
            }
        };

        exports.particleLogic = function() {
            var garbageIndices = [];
            var i = particles.length;
            while (i--) {
                particles[i].logic();
                if (particles[i].alive === false) {
                    particles.splice(i, 1);
                }
            }
        };

        var addParticle = function(x, y, speed, color, angle, decRate) {
            var obj = {};
            obj.x = x;
            obj.y = y;
            obj.speed = speed || 5;
            obj.color = color || 'black';
            obj.angle = angle || 0;
            obj.rotAngle = exports.player.angle;

            obj.opacity = 1;
            obj.decRate = decRate || DEC_RATE;
            obj.dx = Math.cos(obj.angle) * obj.speed;
            obj.dy = Math.sin(obj.angle) * obj.speed;

            var ctx = exports.ctx;
            obj.draw = function() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.globalCompositeOperation = 'lighter';
                ctx.translate(this.x, this.y);

                ctx.rotate(this.rotAngle); // Custom for this game

                ctx.fillStyle = this.color || 'red';
                ctx.fillRect(exports.player.dist, 0, W, H); // Customized too
                ctx.restore();
            };
            
            obj.logic = function() {
                this.x += this.dx;
                this.y += this.dy;
                this.opacity -= this.decRate;
                if (this.opacity <= 0) {
                    this.opacity = 0;
                    this.alive = false;
                }
            };
            
            particles.push(obj);
        };

        return function(num, x, y, colorList, speed, angle, range, decRate) {
            for (var i = 0; i < num; i++) {
                addParticle(x, y, speed, colorList[Math.floor(Math.random() * colorList.length)], angle - range + (Math.random() * 2 * range), decRate);
            }
        };
    })();
})(window.game);
// Draws the flashing, spinning background with co-ordination from gameHandler
(function(exports) {
    var shapes = [];
    var ctx = exports.ctx;

    var minSize = exports.player.dist * 2;
    var DIST_BETWEEN = 80;

    exports.NUM_SHAPES = 12;
    exports.steps = 1;
    exports.allShapesDoneSpinning = true;

    exports.indicatorObj = {}; // It indicates how many waves you've crossed by highlighting the center shape

    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    // Taken from http://gizma.com/easing/
    var easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };



    // x, y are the center co-ordinates of the shape
    var drawShape = function(x, y, centerDist, angle, color, numSides) {
        var side = centerDist / (2 * Math.cos(exports.turnStep / 2));
        if (numSides <= 0) {
            return;
        }
        numSides = numSides || exports.sides;
        ctx.beginPath();
        ctx.moveTo(x + side * Math.cos(angle), y + side * Math.sin(angle));
        for (var i = 1; i <= numSides; i++) {
            ctx.lineTo(x + side * Math.cos(angle + i * exports.turnStep), y + side * Math.sin(angle + i * exports.turnStep));
        };
        ctx.lineTo(x, y);
        ctx.closePath();

        ctx.fillStyle = color || 'green';
        ctx.fill();
    };

    var duration = 70;
    exports.spinAnimate = function(obj, cb) {
        obj.time++;
        if (typeof obj.restAngle === 'undefined') {
            obj.restAngle = obj.angle;
        }
        var absSteps = Math.abs(exports.steps);
        obj.angle = easeInOutQuad(obj.time, obj.restAngle, exports.steps * exports.turnStep, absSteps * duration);
        if (obj.time > duration * absSteps) {
            obj.angle = (obj.restAngle + exports.turnStep * exports.steps) % (2 * Math.PI);
            obj.time = 0;
            obj.spinning = false;
            if (obj === exports.indicatorObj) {
                // obj.restAngle = obj.angle;
            }
            if (cb) {
                cb();
            }
        }
    };

    var createShape = function(x, y, side, color) {
        var obj = {};
        obj.x = x;
        obj.y = y;
        obj.side = side;
        obj.restAngle = Math.PI / exports.sides;
        obj.angle = obj.restAngle;
        obj.color = color;
        obj.time = 0;
        obj.draw = function() {
            drawShape(obj.x, obj.y, obj.side, obj.angle, obj.color, obj.numSides); // obj.numSides is set manually in initBackground
        };
        obj.logic = function() {
            exports.spinAnimate(obj);
        };
        return obj;
    };

    exports.initBackground = function() {
        shapes = [];
        var colors = exports.DEFAULT_BACKGROUND_COLORS;
        for (var i = exports.NUM_SHAPES - 1; i >= 0; i--) {
            shapes.push(createShape(exports.cx, exports.cy, minSize + i * DIST_BETWEEN, colors[i % colors.length]));
        };
        exports.indicatorObj = createShape(exports.cx, exports.cy, minSize, exports.INDICATOR_COLOR);
        exports.indicatorObj.numSides = 0;
    };

    exports.triggerSpin = function(step) {
        var obj;
        exports.steps = step;
        exports.spinning = true;
        
        for (var i = 0; i < shapes.length; i++) {
            obj = shapes[i];
            obj.spinning = true;
            obj.time = 2 * i;
        }
        exports.indicatorObj.spinning = true;
        exports.indicatorObj.time = 2 * (i - 1);
        exports.indicatorObj.restAngle = exports.indicatorObj.angle;
    };

    exports.backgroundDraw = function() {
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].draw();
        };
        exports.indicatorObj.draw();
    };

    exports.backgroundLogic = function() {
        exports.allShapesDoneSpinning = true;
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].spinning) {
                exports.allShapesDoneSpinning = false;
                shapes[i].logic();
            }
        };
        if (exports.indicatorObj.spinning) {
            exports.indicatorObj.logic();
        }
    };

    exports.initBackground();

})(window.game);
(function(exports) {
    var ctx = exports.ctx;
    var canvas = exports.canvas;
    var alpha = 0;
    exports.endScreenDraw = function() {
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')'
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        alpha += 0.01;
        if (alpha >= 0.5) {
            alpha = 0.5;
            exports.write('Score: ' + exports.player.score, 'center', 'center', 5, 'white');
        }
    };
})(window.game);