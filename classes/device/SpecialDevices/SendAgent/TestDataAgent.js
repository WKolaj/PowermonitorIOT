const SendDataAgent = require("./SendDataAgent");

class TestDataAgent extends SendDataAgent {
  constructor() {
    super();
    this._sendDataPossible = true;
  }
  async _sendData(data) {
    if (this._sendDataPossible) {
      console.log(data);
    } else {
      throw new Error("Data not send");
    }
  }

  async initSendingMechanism() {
    this._readyToSend = true;
  }
}

module.exports = TestDataAgent;
