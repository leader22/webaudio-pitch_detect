const { autorun } = require('mobx');
const util = require('./util');
const Store = require('./store');
const View  = require('./view');


class PitchDetector {
  constructor(options) {
    this.audioCtx = options.audioCtx;
    this.audioNode = {
      source:   null,
      analyser: this.audioCtx.createAnalyser(),
    };
    this.buffer = new Float32Array(options.size);

    this.micStream = null;
    this.timer     = null;

    this.store = new Store();
    this.view  = new View(document);

    this._detectPitch = this._detectPitch.bind(this);

    autorun(() => { this.view.render(this.store); });
  }

  start() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.micStream = stream;
        this.audioNode.source = this.audioCtx.createMediaStreamSource(stream);
        this.audioNode.source.connect(this.audioNode.analyser);

        this._detectPitch();
      })
      .catch((err) => { console.error(err); });
  }

  stop() {
    cancelAnimationFrame(this.timer);

    this.micStream.getAudioTracks().forEach((track) => { track.stop(); });
    this.audioNode.source.disconnect();

    this.micStream = this.audioNode.source = this.timer = null;
  }

  _detectPitch() {
    this.audioNode.analyser.getFloatTimeDomainData(this.buffer);
    this.store.update(util.getFrequencyByBuffer(this.buffer, this.audioCtx.sampleRate));

    this.timer = requestAnimationFrame(this._detectPitch);
  }
}

module.exports = PitchDetector;
