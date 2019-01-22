declare module 'worker-loader!*' {
  var WebpackWorker: {
    prototype: Worker;
    new(): Worker;
  };
  export default WebpackWorker;
}