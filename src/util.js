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

  getFrequencyByBuffer(buf, SAMPLE_RATE) {
    const SIZE = buf.length;
    const MAX_SAMPLES = SIZE / 2;

    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      let val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    // not enough signal
    if (rms < 0.01) {
      return -1;
    }

    let lastCorrelation = 1;
    let best_offset = -1;
    let best_correlation = 0;
    let foundGoodCorrelation = false;
    let correlations = [];

    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs((buf[i]) - (buf[i + offset]));
      }
      correlation = 1 - (correlation/MAX_SAMPLES);
      correlations[offset] = correlation; // store it, for the tweaking we need to do below.
      if ((correlation > 0.9) && (correlation > lastCorrelation)) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      } else if (foundGoodCorrelation) {
        let shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
        return SAMPLE_RATE / (best_offset + (8 * shift));
      }
      lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
      return SAMPLE_RATE / best_offset;
    }

    return -1;
  },
};

module.exports = util;
