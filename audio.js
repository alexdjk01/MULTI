window.onload = function () {
    
    let oscillatorSounds = new Array(128).fill(null);

    var emulatedKeys = {
        q: 60, 2: 61, w: 62, 3: 63, e: 64,
        r: 65, 5: 66, t: 67, 6: 68, y: 69,
        7: 70, u: 71, i: 72
    }

    function initialize() {
        for (let i = 36; i <= 96; i++) {
            let noteName = document.querySelector(`[data-midi-code="${i}"]`)
                .getAttribute('data-note');

            let audio = new Audio(`../notes/${noteName}.mp3`);
            pianoSounds[i] = audio;

            oscillatorSounds[i] = createOscillator(i);
        }
    }

    function createOscillator(midiCode)
    {
        let context = new AudioContext();
        let oscillator = context.createOscillator();
        oscillator.type = 'sawtooth';
        let frequency = 440 * Math.pow(2, (midiCode - 69) / 12);
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        oscillator.connect(context.destination);
        oscillator.start();

        return {
            context: context,
            oscillator: oscillator
        }
    }

    function playOscillator(midiCode)
    {
        oscillatorSounds[midiCode].context.resume();
    }

    function stopOscillator(midiCode)
    {
        oscillatorSounds[midiCode].context.suspend();
    }

    
    window.addEventListener('keydown', function (e) {
        let key = e.key;
        if (emulatedKeys.hasOwnProperty(key)) {
            playOscillator(emulatedKeys[key]);
        }
    })

    window.addEventListener('keyup', function (e) {
        let key = e.key;
        if (emulatedKeys.hasOwnProperty(key)) {
            stopOscillator(emulatedKeys[key]);
        }
    });

    navigator.requestMIDIAccess().then((access) => {
        access.inputs.forEach((input) => {
            input.open().then(() => {
                console.log("Connected");
                input.onmidimessage = function (m) {
                    let code = m.data[0];
                    if (code == 144) {
                        if (m.data[2] > 0) {
                            playOscillator(m.data[1]);
                        }
                        else {
                            stopOscillator(m.data[1]);
                        }
                    }
                }
            })
        })
    })

    initialize();
}