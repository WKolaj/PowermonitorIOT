const jwt = require("jsonwebtoken");
const { hashString, hashedStringMatch } = require("../../utilities/utilities");

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
      permissions: this.Permissions
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
    return jwt.sign(this.Payload, this.Project.PrivateKey);
  }
}

module.exports = User;
