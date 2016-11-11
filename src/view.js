const styles = `
.App {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 500px;
  min-height: 250px;

  margin: 20px auto;

  text-align: center;
  background-color: #000;
  color: #fff;
  font-family: impact;
}
.App-noteWrap {
  margin-right: 50px;
}
.App-note {
  color: #f00;
  font-size: 120px;
}
.App-detune {
  font-size: 40px;
}
.App-cent {
  color: #0f0;
  font-size: 20px;
}
`;

class View {
  constructor(doc) {
    this.el = doc.querySelector('#jsApp');

    const style = doc.createElement('style');
    const css = doc.createTextNode(styles);
    style.appendChild(css);
    doc.head.appendChild(style);
  }

  render(store) {
    let dom = '';

    if (store.pitch === -1) {
      dom = `
        <div>
          <span class="App-note">N/A</span>
        </div>
      `;
    } else {
      dom = `
        <div class="App-noteWrap">
          <span class="App-note">${store.noteStr}</span>
        </div>
        <div>
          <div>
            <span class="App-detune">${store.pitch|0}Hz</span>
          </div>
          <div>
            <span class="App-cent">${store.centDir}${store.centGap}cents</span>
          </div>
        </div>
      `;
    }

    this.el.innerHTML = dom;
  }
}

module.exports = View;
