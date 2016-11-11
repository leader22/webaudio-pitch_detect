class View {
  constructor(doc) {
    this.pitchEl  = doc.getElementById('pitch');
    this.noteEl   = doc.getElementById('note');
    this.detuneEl = doc.getElementById('detune');
  }

  render(store) {
    if (store.pitch === -1) {
      this.pitchEl.innerText  = '';
      this.noteEl.innerText   = 'N/A';
      this.detuneEl.innerText = '';
    } else {
      this.pitchEl.innerText  = store.pitch|0;
      this.noteEl.innerText   = store.noteStr;
      this.detuneEl.innerText = store.centDir + store.centGap;
    }
  }
}

module.exports = View;
