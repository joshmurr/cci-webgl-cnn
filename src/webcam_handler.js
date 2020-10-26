export default class WebcamHandler {
  constructor(_videoElem) {
    this.videoElem = _videoElem;
    this.camActive = false;
  }

  initCam() {
    let self = this;
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          self.videoElem.srcObject = stream;
          self.camActive = true;
        })
        .catch(function (error) {
          console.log('Something went wrong with the webcam...');
          console.log(error);
          self.camActive = false;
        });
    }
  }

  stopCam() {
    const stream = this.videoElem.srcObject;
    const tracks = stream.getTracks();

    for (let i = 0; i < tracks.length; i++) {
      tracks[i].stop();
    }

    this.videoElem.srcObject = null;
  }
}
