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