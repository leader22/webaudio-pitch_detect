const { autorun } = require('mobx');
const util = require('./util');
const Store = require('./store');
const View  = require('./view');


class PitchDetector {
  constructor(size) {
    this.store = new Store();
    this.view  = new View(document);

    this.micStream = null;

    this.audioCtx = new AudioContext();
    this.audioNode = {
      source:   null,
      analyser: this.audioCtx.createAnalyser(),
    };
    this.buffer = new Float32Array(size);

    this.timer = null;

    this.detectPitch = this.detectPitch.bind(this);

    autorun(() => { this.view.render(this.store); });
  }

  start() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.micStream = stream;
        this.audioNode.source = this.audioCtx.createMediaStreamSource(stream);
        this.audioNode.source.connect(this.audioNode.analyser);

        this.detectPitch();
      })
      .catch((err) => { console.error(err); });
  }

  stop() {
    cancelAnimationFrame(this.timer);

    this.micStream.getAudioTracks().forEach((track) => { track.stop(); });
    this.audioNode.source.disconnect();

    this.micStream = this.audioNode.source = this.timer = null;
  }

  detectPitch() {
    this.audioNode.analyser.getFloatTimeDomainData(this.buffer);
    this.store.update(util.getFrequencyByBuffer(this.buffer, this.audioCtx.sampleRate));

    this.timer = requestAnimationFrame(this.detectPitch);
  }
}

const app = new PitchDetector(2048);
app.start();
