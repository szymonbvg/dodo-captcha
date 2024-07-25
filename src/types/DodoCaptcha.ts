export enum DodoMessageType {
  /**
   * message sent by client to generate the captcha
   */
  CAPTCHA_GET_CHALLENGE = "captcha.get.challenge",
  
  /**
   * message sent by server containing captcha's outerHTML as parameter
   */
  CAPTCHA_CHALLENGE = "captcha.challenge",

  /**
   * message sent by server when captcha expires,
   * contains captcha's outerHTML with expiration information
   */
  CAPTCHA_EXPIRED = "captcha.expired",

  /**
   * message sent by client to verify if they have correctly solved captcha challenge,
   * message should contain code of captcha challenge solution
   */
  CAPTCHA_CHECK_RESULT = "captcha.check.result",

  /**
   * message sent by server when code sent by client is correct,
   * contains client's token as parameter
   */
  CAPTCHA_VERIFIED = "captcha.verified",

  /**
   * message sent by server when code sent by client is incorrent
   */
  CAPTCHA_NOT_VERIFIED = "captcha.not.verified",
}

export type DodoCaptchaMessage = {
  /**
   * message type
   * @type {DodoMessageType}
   */
  type: DodoMessageType;

  /**
   * message parameters
   * @type {string | undefined}
   */
  params?: string;
};

export type DodoCaptchaConfig = {
  /**
   * captcha challenge expiration time in ms
   * @type {number}
   */
  expirationTime: number;

  /**
   * websocket server port
   * @type {number}
   */
  port: number;

  /**
   * defines whether the websocket server should use TLS
   * @type {boolean}
   */
  secured: boolean;

  /**
   * defines the path to the private key.
   * This should be set if the 'secured' option is set to true
   * @type {string | undefined}
   */
  tlsKeyPath?: string;

  /**
   * defines the path to the certificate. 
   * This should be set if the 'secured' option is set to true
   * @type {string | undefined}
   */
  tlsCertPath?: string;

  /**
   * width of captcha challenge frame in px
   * @type {number}
   */
  width: number;

  /**
   * height of captcha challenge frame in px
   * @type {number}
   */
  height: number;

  /**
   * position of captcha code on challenge frame in px
   * @type {{x: number, y: number}}
   */
  textPos: {
    x: number;
    y: number;
  };
  
  /**
   * width of captcha challenge difficulty line in px
   * @type {number}
   */
  lineWidth: number;

  /**
   * font size of the captcha code in px
   * @type {number}
   */
  fontSize: number;
};
