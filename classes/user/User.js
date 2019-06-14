const { hashString, hashedStringMatch } = require("../../utilities/utilities");

class User {
  /**
   * @description Application user
   */
  constructor() {}

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

    this._login = payload.login;
    //Checking id payload uses normal version of password (when creating new user)
    if (hashedPassword) this._password = payload.password;
    //or hashed version of password - read from file
    else this._password = await this._hashPassword(payload.password);

    this._permissions = payload.permissions;
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
   * @description permissions of user
   */
  get Permissions() {
    return this._permissions;
  }

  get Payload() {
    return {
      login: this.Login,
      password: this.Password,
      permissions: this.Permissions
    };
  }

  async _hashPassword(password) {
    return hashString(password);
  }

  async passwordMatches(password) {
    return hashedStringMatch(password, this.Password);
  }
}

module.exports = User;
