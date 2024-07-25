import { CaptchaCodeGenerator } from "../util/CodeGenerator";
import { CaptchaClientHandler } from "./ClientHandler";
import { DodoCaptchaConfig, DodoCaptchaMessage, DodoMessageType } from "../types/DodoCaptcha";
import { WebSocket } from "ws";
import { createHash, randomUUID } from "crypto";
import { DodoCaptchaVerifier } from "../util/CaptchaVerifier";

/**
 * @internal
 */
export class CaptchaClientSession {
  public readonly handler: CaptchaClientHandler = new CaptchaClientHandler(this);
  public readonly config: DodoCaptchaConfig;

  private ws: WebSocket;
  private timeout?: NodeJS.Timeout;
  private captchaCode?: { text: string; svg: string[] };
  private token?: string;
  private codeGenerator: CaptchaCodeGenerator;
  private verifier: DodoCaptchaVerifier;

  constructor(ws: WebSocket, config: DodoCaptchaConfig, clientVerifier: DodoCaptchaVerifier) {
    this.ws = ws;
    this.config = config;
    this.codeGenerator = new CaptchaCodeGenerator(config);
    this.verifier = clientVerifier;
  }

  public generateSVGBuffer(text: string[]) {
    const randHeight = Math.floor(Math.random() * (7 - 4 + 1) + 4);
    const randBgRotation = Math.floor(Math.random() * 360);
    const randLineRotation = Math.floor(Math.random() * 20);

    const minPos = {
      x: this.config.textPos.x,
      y: this.config.textPos.y,
    };
    const maxPos = {
      x: this.config.textPos.x + this.config.fontSize * 2,
      y: this.config.textPos.y + this.config.fontSize / 2,
    };
    const randPosition = {
      x: Math.floor(Math.random() * (maxPos.x - minPos.x + 1) + minPos.x),
      y: Math.floor(Math.random() * (maxPos.y - minPos.y + 1) + minPos.y),
    };

    let svgBuffer = `
      <svg width="${this.config.width}" height="${this.config.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="bgPattern"
            width="${this.config.width}"
            height="${randHeight}"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(${randBgRotation})"
          >
            <rect width="${this.config.width}" height="${randHeight / 2}" fill="rgb(80, 80, 80)" />
            <rect
              y="${randHeight / 2}"
              width="${this.config.width}"
              height="${randHeight / 2}"
              fill="rgb(55, 55, 55)"
            />
          </pattern>
        </defs>
      <rect width="${this.config.width}" height="${this.config.height}" fill="url(#bgPattern)" />
      <rect
        x="0"
        y="0"
        width="${this.config.lineWidth}"
        height="1.5"
        fill="black"
        transform="
          translate(${randPosition.x} ${randPosition.y})
          rotate(${randLineRotation})
          translate(-${this.config.lineWidth / 2} -0.75)
        "
      />
    `;

    for (let i = 0; i < text.length; i++) {
      svgBuffer += text[i];
    }
    svgBuffer += "</svg>";

    return svgBuffer;
  }

  public generateCaptchaCode() {
    this.captchaCode = this.codeGenerator.generate();
    return this.captchaCode;
  }

  public verify(code: string | undefined) {
    const verified = this.captchaCode?.text === code;
    if (verified) {
      const hash = createHash("sha256").update(`captcha${randomUUID()}${new Date()}`);
      this.token = hash.digest("hex");
      this.verifier.addVerifiedClient(this.token);
    }
    return verified;
  }

  public startCaptchaExpiration() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.captchaCode = undefined;
      this.send({
        type: DodoMessageType.CAPTCHA_EXPIRED,
        params: `
          <!DOCTYPE html>
          <html>
            <body>
              <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                width: 150px;
                height: 75px;
                background-color: #1a1a1a
              ">
                <p style="width: auto; height: auto; color: white">
                  Captcha Expired
                </p>
              </div>
            </body>
          </html>
        `,
      });
      if (this.token) {
        this.verifier.removeVerifiedClient(this.token);
        this.token = undefined;
      }
      clearTimeout(this.timeout);
    }, this.config.expirationTime);
  }

  public getToken() {
    return this.token;
  }

  public close() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.token) {
      this.verifier.removeVerifiedClient(this.token);
      this.token = undefined;
    }
    this.ws.close();
  }

  public send(message: DodoCaptchaMessage) {
    this.ws.send(JSON.stringify(message));
  }
}
