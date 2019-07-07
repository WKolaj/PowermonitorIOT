const EventEmitter = require("events");
const Sampler = require("../sampler/Sampler");
const Element = require("../element/Element");
const mongoose = require("mongoose");

class Variable extends Element {
  /**
   * @description Base class representing Variable
   * @param {object} device device associated with variable
   */
  constructor(device) {
    super(device);
  }

  /**
   * @description Method for editing variable based on given payload
   */
  async editWithPayload(payload) {
    //Coping all neccessary data to payload
    if (payload.id && payload.id !== this.Id)
      throw new Error(
        `Given id: ${payload.id} is different than variable id: ${this.Id}`
      );

    //If payload has no varaibles define - define it on the basis of current values;
    if (payload.sampleTime) this.SampleTime = payload.sampleTime;
    if (payload.name) this._name = payload.name;
    if (payload.archived !== undefined) this._archived = payload.archived;
    if (payload.unit) this._unit = payload.unit;
    if (payload.archiveSampleTime)
      this.ArchiveSampleTime = payload.archiveSampleTime;

    //returning edited variable
    return this;
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "variable";
  }
}

module.exports = Variable;
