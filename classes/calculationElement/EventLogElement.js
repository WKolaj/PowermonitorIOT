const CalculationElement = require("./CalculationElement");
const EventStorage = require("../EventStorage/EventStorage");
const path = require("path");
const {
  exists,
  checkIfDirectoryExistsAsync,
  createDirAsync,
  existsAndIsNotEmpty,
  isObjectEmpty,
  snooze
} = require("../../utilities/utilities");

class EventLogElement extends CalculationElement {
  constructor(device) {
    super(device);
    this._eventStorage = new EventStorage();
    this._variables = [];
    this._descriptions = {};
    this._filePath = null;
  }

  get BufferSize() {
    return this.Variables.length;
  }

  get Descriptions() {
    return this._descriptions;
  }

  get Variables() {
    return this._variables;
  }

  get FilePath() {
    return this._filePath;
  }

  get EventStorage() {
    return this._eventStorage;
  }

  /**
   * Method for initializing element according to payload
   * @param {object} payload Initial payload of eventLog element
   */
  async init(payload) {
    await super.init(payload);

    //Initializing variables
    if (exists(payload.logVariables)) {
      this._initLogVariables(payload.logVariables);
    }

    //Initializing event descriptions
    if (exists(payload.eventDescriptions)) {
      this._descriptions = payload.eventDescriptions;
    }

    let currentProject = require("../project/Project").CurrentProject;

    //initializing eventLogDir and file
    let eventLogDirExists = await checkIfDirectoryExistsAsync(
      currentProject.ProjectContentManager.EventLogDirPath
    );

    if (!eventLogDirExists)
      await createDirAsync(
        currentProject.ProjectContentManager.EventLogDirPath
      );

    this._filePath = path.join(
      currentProject.ProjectContentManager.EventLogDirPath,
      `${this.Id}.db`
    );

    //Initializing event storage
    let bufferSize = this.Variables.length;

    await this.EventStorage.init(this.FilePath, bufferSize);
  }

  /**
   * Method for initializing log variables
   * @param {object} logVariables Log variables payload
   */
  _initLogVariables(logVariables) {
    for (let variableObject of logVariables) {
      let tickVarId = variableObject.tickVarId;
      let valueVarId = variableObject.valueVarId;

      let tickVar = this.Device.Variables[tickVarId];
      let valueVar = this.Device.Variables[valueVarId];

      //Adding variable only if exists
      if (exists(tickVar) && exists(valueVar)) {
        this._addVaraibles(tickVar, valueVar);
      }
    }
  }

  /**
   * Method for adding variables to storage
   * @param {object} tickVar tick variable
   * @param {object} valueVar value variable
   */
  _addVaraibles(tickVar, valueVar) {
    this.Variables.push({
      tick: tickVar,
      value: valueVar
    });
  }

  /**
   * @description Method for getting value of calculation element
   */
  _getValue() {
    return null;
  }

  get LastEvent() {
    return this._convertEventFromStorageToEventWithDescription({
      value: this.EventStorage.getLastEvent()
    }).value;
  }

  get LastEventTickId() {
    return this._convertEventFromStorageToEventWithDescription({
      value: this.EventStorage.getLastEvent()
    }).tickId;
  }

  /**logVariables
   * @description Method for setting value of calculation element
   * @param {number} newValue new value of calculation element
   */
  _setValue(newValue) {}

  /**
   * @description Method for generating type name that represents sum element name
   */
  _getTypeName() {
    return "eventLogElement";
  }

  /**payload
   * @description Method for generating type name that represents sum element type
   */
  _getValueType() {
    return "string";
  }

  /**
   * @description Should variable be archived
   */
  get Archived() {
    //Event log is always archived but by different mechanism
    return false;
  }

  /**
   * Method invoked on first refreshing
   * @param {number} tickNumber tickNumber of refeshing action
   */
  async _onFirstRefresh(tickNumber) {
    return this._refreshEventStorage();
  }

  /**
   * Method invoked on every refreshing action despite first
   * @param {number} lastTickNumber tick number of last refreshing action
   * @param {number} tickNumber tick number of actual refreshing action
   */
  async _onRefresh(lastTickNumber, tickNumber) {
    return this._refreshEventStorage();
  }

  _convertEventFromStorageToEventWithDescription(eventObject) {
    if (!existsAndIsNotEmpty(eventObject)) return {};

    let eventDescription = this.Descriptions[eventObject.value];

    if (!exists(eventDescription)) return { ...eventObject };
    else return { ...eventObject, value: eventDescription };
  }

  async _refreshEventStorage() {
    let eventPayload = this._generateEventPayloadFromVariables();

    let result = await this.EventStorage.refreshEvents(eventPayload);

    let resultToReturn = [];

    for (let eventObject of result) {
      resultToReturn.push(
        this._convertEventFromStorageToEventWithDescription(eventObject)
      );
    }

    return resultToReturn;
  }

  _generateEventPayloadFromVariables() {
    let eventPayload = [];

    for (let variableObject of this.Variables) {
      eventPayload.push({
        tickId: variableObject.tick.Value,
        value: variableObject.value.Value
      });
    }

    return eventPayload;
  }

  /**
   * @description Method for generation payload that represents eventLog element
   */
  _generatePayload() {
    let payloadToReturn = super._generatePayload();

    payloadToReturn.logVariables = [];

    for (let variableObject of this.Variables) {
      let tickVarId = variableObject.tick.Id;
      let valueVarId = variableObject.value.Id;

      payloadToReturn.logVariables.push({ tickVarId, valueVarId });
    }

    payloadToReturn.eventDescriptions = this.Descriptions;

    return payloadToReturn;
  }

  /**
   * @description Overrwriting method for getting archive value
   */
  async getEventFromDB(variableId, date) {
    if (this.EventStorage.Initialized) {
      let eventObject = await this.EventStorage.getEvent(date);

      if (isObjectEmpty(eventObject)) return Promise.resolve(null);

      let tickId = Object.keys(eventObject)[0];

      let convertedObject = this._convertEventFromStorageToEventWithDescription(
        {
          value: eventObject[tickId],
          tickId: tickId
        }
      );

      return { [convertedObject.tickId]: convertedObject.value };
    } else {
      return Promise.resolve(undefined);
    }
  }

  /**
   * @description Overrwriting method for getting archive values
   */
  async getEventsFromDB(variableId, fromDate, endDate) {
    if (this.EventStorage.Initialized) {
      let events = await this.EventStorage.getEvents(fromDate, endDate);

      if (isObjectEmpty(events)) return Promise.resolve([]);

      let eventsToReturn = [];

      for (let eventObject of events) {
        let tickId = Object.keys(eventObject)[0];

        let convertedObject = this._convertEventFromStorageToEventWithDescription(
          {
            value: eventObject[tickId],
            tickId: tickId
          }
        );

        eventsToReturn.push({
          [convertedObject.tickId]: convertedObject.value
        });
      }

      return eventsToReturn;
    } else {
      return Promise.resolve(undefined);
    }
  }
}

module.exports = EventLogElement;
