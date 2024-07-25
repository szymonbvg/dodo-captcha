import { IncomingMessage, Server, createServer } from "http";
import fs from "fs";
import https from "https";
import internal from "stream";
import { WebSocket, WebSocketServer } from "ws";
import { CaptchaClientSession } from "./managers/ClientSession";
import { DodoCaptchaVerifier } from "./util/CaptchaVerifier";
import { DodoCaptchaConfig, DodoMessageType } from "./types/DodoCaptcha";

/**
 * main DodoCaptcha class used to initialize entire captcha
 * @example
 * const dodoCaptcha = new DodoCaptcha();
 * dodoCaptcha.init();
 */
class DodoCaptcha {
  /**
   * configuration of the captcha's outerHTML and functionality
   * @type {import("./types/index.d.ts").DodoCaptchaConfig}
   * @public
   */
  public config: DodoCaptchaConfig = {
    expirationTime: 2000 * 60,
    port: 1337,
    secured: false,
    width: 150,
    height: 75,
    textPos: {
      x: 40,
      y: 35,
    },
    lineWidth: 100,
    fontSize: 32,
  };

  /**
   * captcha verifier that stores tokens of all verified clients
   * @type {DodoCaptchaVerifier}
   * @public
   * @readonly
   */
  public readonly verifier: DodoCaptchaVerifier = new DodoCaptchaVerifier();

  /**
   * @private
   */
  private _wss?: WebSocketServer;

  /**
   * @private
   */
  private _server?: https.Server | Server;

  constructor() {}

  /**
   * @private
   */
  private _upgrade(req: IncomingMessage, socket: internal.Duplex, head: Buffer) {
    this._wss?.handleUpgrade(req, socket, head, (ws) => {
      this._wss?.emit("connection", ws, req, new CaptchaClientSession(ws, this.config, this.verifier));
    });
  }

  /**
   * initializes websocket server for captcha communication and functionality
   * @public
   */
  public init() {
    if (this.config.secured) {
      const options = {
        key: fs.readFileSync(this.config.tlsKeyPath ?? ""),
        cert: fs.readFileSync(this.config.tlsCertPath ?? "")
      };
      this._server = https.createServer(options);
    } else {
      this._server = createServer();
    }

    this._wss = new WebSocketServer({ noServer: true });

    this._server.on("upgrade", this._upgrade.bind(this));
    this._server.listen(this.config.port);

    this._wss.on("connection", (ws: WebSocket, _req: unknown, client: CaptchaClientSession) => {
      ws.on("message", (message) => {
        try {
          client.handler.handleCommunication(message.toString());
        } catch (e) {
          console.error(e);
        }
      });
      ws.on("close", () => {
        try {
          client.close();
        } catch (e) {
          console.error(e);
        }
      });
      ws.on("error", () => {
        try {
          client.close();
          ws.close();
        } catch (e) {
          console.error(e);
        }
      });
    });
  }
}

export { DodoCaptcha, DodoMessageType }