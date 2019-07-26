const { snooze, existsAndIsNotEmpty } = require("../../utilities/utilities");

class MindConnectAgent {
  constructor(credentials) {
    this._validateCredentials(credentials);
    this._credentials = credentials;
    this._onBoarded = false;
    this._hasDataSourceConfig = false;

    this.BulkPostData = jest.fn(async (dataToSend, validation) => {});

    this.PostEvent = jest.fn(async event => {});

    this.IsOnBoarded = jest.fn(() => {
      return this._onBoarded;
    });

    this.HasDataSourceConfiguration = jest.fn(() => {
      return this._hasDataSourceConfig;
    });

    this.OnBoard = jest.fn(async () => {
      await snooze(100);
      this._onBoarded = true;
    });

    this.GetDataSourceConfiguration = jest.fn(async () => {
      await snooze(100);
      this._hasDataSourceConfig = true;
    });
  }

  _validateCredentials(credentials) {
    if (!existsAndIsNotEmpty(credentials.content))
      throw new Error("content cannot be empty");

    if (!existsAndIsNotEmpty(credentials.content.baseUrl))
      throw new Error("content.baseUrl cannot be empty");

    if (!existsAndIsNotEmpty(credentials.content.iat))
      throw new Error("content.iat cannot be empty");

    if (!existsAndIsNotEmpty(credentials.content.clientCredentialProfile))
      throw new Error("content.clientCredentialProfile cannot be empty");

    if (!existsAndIsNotEmpty(credentials.content.clientId))
      throw new Error("content.clientId cannot be empty");

    if (!existsAndIsNotEmpty(credentials.content.tenant))
      throw new Error("content.tenant cannot be empty");

    if (!existsAndIsNotEmpty(credentials.expiration))
      throw new Error("expiration cannot be empty");
  }
}

let retry = async (count, func) => {
  let index = 0;

  while (index < count) {
    try {
      await func();
      return;
    } catch (err) {
      index++;
      if (index >= count) throw err;
    }
  }
};

module.exports.MindConnectAgent = MindConnectAgent;
module.exports.retry = retry;
