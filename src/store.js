const {
  computed,
  extendObservable,
} = require('mobx');
const util = require('./util');

class Store {
  constructor() {
    extendObservable(this, {
      pitch: -1,

      noteStr: computed(() => {
        const noteNo = util.getNoteNoByFrequency(this.pitch);
        return util.getNoteStrByNoteNo(noteNo);
      }),
      centGap: computed(() => {
        const noteNo = util.getNoteNoByFrequency(this.pitch);
        return util.getCentGapByFrequencyAndNoteNo(this.pitch, noteNo);
      }),
      centDir: computed(() => {
        if (this.centGap === 0) {
          return '±';
        }
        return (this.centGap < 0) ? '' : '+';
      }),
    });
  }

  update(frequency) {
    this.pitch = frequency;
  }
}

module.exports = Store;
