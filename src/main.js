const App = require('./app');

const app = new App({
  audioCtx: new AudioContext(),
  size:     2048,
});
app.start();
