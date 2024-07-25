/**
 * captcha verifier that stores tokens of all verified clients
 */
export class DodoCaptchaVerifier {
  /**
   * @private
   */
  private _verifiedClients: string[] = [];

  constructor() {}

  /**
   * inserts client's token to verified list
   * @param {string} token - client's token sent to them after attempting the captcha challenge
   * (parameter of CAPTCHA_VERIFIED message type)
   * @public
   */
  public addVerifiedClient(token: string) {
    this._verifiedClients.push(token);
  }

  /**
   * removes token from verified list
   * @param {string} token - client's token sent to them after attempting the captcha challenge
   * (parameter of CAPTCHA_VERIFIED message type)
   * @public
   */
  public removeVerifiedClient(token: string) {
    this._verifiedClients = this._verifiedClients.filter((client) => {
      return client !== token;
    });
  }

  /**
   * checks whether the token is verified
   * @param {string} token - client's token sent to them after attempting the captcha challenge
   * (parameter of CAPTCHA_VERIFIED message type)
   * @public
   * @returns {boolean} condition indicating whether the token is verified
   * @example
   * if (dodoCaptcha.verifier.verifyToken(tokenSentByClient))
   * {
   *    // send content to client
   * }
   */
  public verifyToken(token: string): boolean {
    return this._verifiedClients.includes(token)
  }
}
