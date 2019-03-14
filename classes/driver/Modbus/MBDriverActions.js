class ModbusDriverActions {
  constructor() {
    this._actions = {};
  }

  get AllActions() {
    return this._actions;
  }

  getAction(name) {
    return this._actions[name];
  }

  addAction(action) {
    return (this._actions[action.Name] = action);
  }

  removeAction(action) {
    delete this._actions[action.Name];
  }

  getAllActionNames() {
    return Object.keys(this._actions);
  }
}

module.exports = ModbusDriverActions;
