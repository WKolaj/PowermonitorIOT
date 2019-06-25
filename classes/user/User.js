const jwt = require("jsonwebtoken");
const { hashString, hashedStringMatch } = require("../../utilities/utilities");
const _ = require("lodash");

class User {
  /**
   * @description Application user
   * @param {Object} project project associated with user
   */
  constructor(project) {
    if (!project) throw new Error("project object in user cannot be empty!");
    this._project = project;
  }

  /**
   * @description Method for initializing user
   * @param {Object} payload User payload
   * @param {Boolean} hashedPassword Does payload use hashed version of password or normal?
   */
  async init(payload, hashedPassword) {
    if (!payload.login) throw new Error("login in payload cannot be empty");
    if (!payload.password)
      throw new Error("password in payload cannot be empty");
    if (payload.permissions === undefined || payload.permissions === null)
      throw new Error("permissions in payload cannot be empty");
    //Setting default polish language if it is not defined in payload
    if (payload.lang === undefined || payload.lang === null)
      payload.lang = "pl";

    this._login = payload.login;
    //Checking id payload uses normal version of password (when creating new user)
    if (hashedPassword) this._password = payload.password;
    //or hashed version of password - read from file
    else this._password = await this._hashPassword(payload.password);

    this._permissions = payload.permissions;
    this._lang = payload.lang;
  }

  /**
   * @description Method for editing user
   * @param {Object} payload payload of user
   * @param {Boolean} hashedPassword Does payload use hashed version of password or normal?
   */
  async edit(payload, hashedPassword) {
    if (payload.login && payload.login !== this.Login)
      throw new Error(
        `Login in payload ${payload.login} and Login of user: ${
          this.Login
        } are different!`
      );

    if (payload.password) {
      //Checking id payload uses normal version of password (when creating new user)
      if (hashedPassword) this._password = payload.password;
      //or hashed version of password - read from file
      else this._password = await this._hashPassword(payload.password);
    }

    if (payload.permissions !== undefined && payload.permissions !== null)
      this._permissions = payload.permissions;

    if (payload.lang !== undefined && payload.lang !== null)
      this._lang = payload.lang;
  }

  /**
   * @description user login
   */
  get Login() {
    return this._login;
  }

  /**
   * @description user password
   */
  get Password() {
    return this._password;
  }

  /**
   * @description user default language
   */
  get Lang() {
    return this._lang;
  }

  /**
   * @description project associated with user
   */
  get Project() {
    return this._project;
  }

  /**
   * @description permissions of user
   */
  get Permissions() {
    return this._permissions;
  }

  /**
   * @description payload of user
   */
  get Payload() {
    return {
      login: this.Login,
      password: this.Password,
      permissions: this.Permissions,
      lang: this.Lang
    };
  }

  /**
   * Mehtod for hashing users password
   * @param {string} password password to hash
   */
  async _hashPassword(password) {
    return hashString(password);
  }

  /**
   * @description Method to check whether given password matches user password
   * @param {string} password Given password to check
   */
  async passwordMatches(password) {
    return hashedStringMatch(password, this.Password);
  }

  async generateToken() {
    //Do not pick password in jwt!
    return jwt.sign(
      _.pick(this.Payload, ["login", "permissions"]),
      this.Project.PrivateKey
    );
  }

  get canVisualizeData() {
    return User.canVisualizeData(this.Permissions);
  }

  get canOperateData() {
    return User.canOperateData(this.Permissions);
  }

  get isDataAdmin() {
    return User.isDataAdmin(this.Permissions);
  }

  get isSuperAdmin() {
    return User.isSuperAdmin(this.Permissions);
  }

  static canVisualizeData(permissions) {
    if (permissions === undefined || permissions === null) return false;
    return User._getBit(permissions, 0);
  }

  static canOperateData(permissions) {
    if (permissions === undefined || permissions === null) return false;
    return User._getBit(permissions, 1);
  }

  static isDataAdmin(permissions) {
    if (permissions === undefined || permissions === null) return false;
    return User._getBit(permissions, 2);
  }

  static isSuperAdmin(permissions) {
    if (permissions === undefined || permissions === null) return false;
    return User._getBit(permissions, 3);
  }

  static getPermissionsArray(permissions) {
    // bit 0 - vizualize data
    // bit 1 - operate data
    // bit 2 - data admin
    // bit 3 - super admin

    let arrayToReturn = [];

    for (let i = 0; i < 3; i++) {
      arrayToReturn[i] = this._getBit(permissions, i);
    }

    return arrayToReturn;
  }

  /**
   * @description method for getting bit in given variable
   * @param {number} number variable
   * @param {number} bitPosition bit position
   */
  static _getBit(number, bitPosition) {
    return (number & (1 << bitPosition)) === 0 ? false : true;
  }

  /**
   * @description method for setting bit in given variable
   * @param {number} number variable
   * @param {number} bitPosition bit position
   */
  static _setBit(number, bitPosition) {
    return number | (1 << bitPosition);
  }

  /**
   * @description method for clearing bit in given variable
   * @param {number} number variable
   * @param {number} bitPosition bit position
   */
  static _clearBit(number, bitPosition) {
    const mask = ~(1 << bitPosition);
    return number & mask;
  }
}

module.exports = User;
