const EventEmitter = require("events");
const mongoose = require("mongoose");
const Sampler = require("../sampler/Sampler");
const Element = require("../element/Element");

class CalculationElement extends Element {
  /**
   * @description Tick number of last operation
   */
  get LastTickNumber() {
    return this._lastTickNumber;
  }

  /**
   * @description Method for refreshing whole calcuation element
   * @param {number} tickNumber Tick number of current refresh action
   */
  async refresh(tickNumber) {
    let refreshResult = {};
    if (this.LastTickNumber) {
      //Checking if time is increasing - skipping old async refresh actions
      if (tickNumber < this.LastTickNumber) return refreshResult;

      refreshResult = await this._onRefresh(this.LastTickNumber, tickNumber);
    } else {
      refreshResult = await this._onFirstRefresh(tickNumber);
    }

    this._lastTickNumber = tickNumber;

    this.Events.emit("Refreshed", [this, tickNumber, refreshResult]);

    return refreshResult;
  }

  /**
   * Method invoked on first refreshing
   * @param {number} tickNumber tickNumber of refeshing action
   */
  async _onFirstRefresh(tickNumber) {
    throw new Error("Method not implemented");
  }

  /**
   * Method invoked on every refreshing action despite first
   * @param {number} lastTickNumber tick number of last refreshing action
   * @param {number} tickNumber tick number of actual refreshing action
   */
  async _onRefresh(lastTickNumber, tickNumber) {
    throw new Error("Method not implemented");
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "calcElement";
  }
}

module.exports = CalculationElement;
