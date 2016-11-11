const util = {
  /**
   * 周波数からノート番号を割り出す
   *
   * 440 -> 69
   *
   * @param {number} frequency
   * @return {number}
   *
   */
  getNoteNoByFrequency(frequency) {
    frequency = frequency|0;
    return 69 + Math.round(12 * (Math.log(frequency / 440) / Math.log(2)));
  },

  /**
   * ノート番号から周波数を割り出す
   *
   * 69 -> 440
   *
   * @param {number} noteNo
   * @return {number}
   *
   */
  getFrequencyByNoteNo(noteNo) {
    noteNo = noteNo|0;
    return 440 * Math.pow(2, (noteNo - 69) / 12);
  },

  /**
   * ノート番号から音階を割り出す
   *
   * 69 -> A
   *
   * @param {number} noteNo
   * @return {string}
   *
   */
  getNoteStrByNoteNo(noteNo) {
    return [
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    ][noteNo % 12];
  },

  /**
   * 周波数とベースとなるノート番号から周波数の比を割り出す
   *
   * 400, 69 -> -166
   *
   * @param {number} frequency
   * @param {number} noteNo
   * @return {number}
   *
   */
  getCentGapByFrequencyAndNoteNo(frequency, noteNo) {
    const baseFreq = util.getFrequencyByNoteNo(noteNo);
    return Math.floor(1200 * Math.log(frequency / baseFreq) / Math.log(2));
  },

  /**
   * AnalyzerNodeから取ったTimeDomainデータから、周波数を割り出す
   *
   * @param {Array} buf
   * @param {number} SAMPLE_RATE
   * @return {number}
   *
   */
  getFrequencyByBuffer(buf, SAMPLE_RATE) {
    // 一定量以上の入力がないと無視するように
    // 低周波数だと音量がないせいで無音扱いになることもある
    let rms = 0;
    for (let i = 0; i < buf.length; i++) {
      let val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / buf.length);
    // 200Hzくらいは拾う
    if (rms < 0.001) { return -1; }


    const MAX_SAMPLES = buf.length / 2;
    let lastCorrelation = 1;
    let bestOffset      = -1;
    let bestCorrelation = 0;
    let foundGoodCorrelation = false;
    const correlations = [];

    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs((buf[i]) - (buf[i + offset]));
      }
      correlation = 1 - (correlation / MAX_SAMPLES);
      correlations[offset] = correlation;

      // 9割超えで決定
      if ((correlation > 0.9) && (correlation > lastCorrelation)) {
        foundGoodCorrelation = true;
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }
      else if (foundGoodCorrelation) {
        let shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset];
        return SAMPLE_RATE / (bestOffset + (8 * shift));
      }

      lastCorrelation = correlation;
    }

    return -1;
  },
};

module.exports = util;
