import sharp from "sharp";
import { CaptchaClientSession } from "./ClientSession";
import { DodoCaptchaMessage, DodoMessageType } from "../types/DodoCaptcha";

/**
 * @internal
 */
export class CaptchaClientHandler {
  private client: CaptchaClientSession;

  constructor(client: CaptchaClientSession) {
    this.client = client;
  }

  private async generateCaptchaHTML() {
    const code = this.client.generateCaptchaCode();
    const svgBuffer = this.client.generateSVGBuffer(code.svg);

    const imgBuffer = await sharp({
      create: {
        width: this.client.config.width,
        height: this.client.config.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(svgBuffer),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    const url = `data:image/png;base64,${imgBuffer.toString("base64")}`;

    return `
      <!DOCTYPE html>
      <html>
        <body>
          <img src=${url} />
        </body>
      </html>
    `;
  }

  public async handleCommunication(data: string) {
    const message = JSON.parse(data) as DodoCaptchaMessage;

    switch (message.type) {
      case DodoMessageType.CAPTCHA_GET_CHALLENGE: {
        const captchaHTML = await this.generateCaptchaHTML();

        this.client.send({ type: DodoMessageType.CAPTCHA_CHALLENGE, params: captchaHTML });
        this.client.startCaptchaExpiration();
        break;
      }
      case DodoMessageType.CAPTCHA_CHECK_RESULT: {
        const code = message.params;
        const verified = this.client.verify(code);
        
        this.client.send({
          type: verified ? DodoMessageType.CAPTCHA_VERIFIED : DodoMessageType.CAPTCHA_NOT_VERIFIED,
          params: this.client.getToken(),
        });
        break;
      }
    }
  }
}
