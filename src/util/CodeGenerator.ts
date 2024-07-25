import { DodoCaptchaConfig } from "../types/DodoCaptcha";

/**
 * @internal
 */
enum CharacterType {
  LOWER_CASE = 0,
  UPPER_CASE = 1,
}

/**
 * @internal
 */
enum TransformType {
  NORMAL = 0,
  ROTATE_RIGHT = 1,
  ROTATE_LEFT = 2,
}

/**
 * @internal
 */
enum CharacterWeight {
  NORMAL = 0,
  BOLD = 1,
}

/**
 * @internal
 */
export class CaptchaCodeGenerator {
  private config: DodoCaptchaConfig;

  constructor(config: DodoCaptchaConfig) {
    this.config = config;
  }

  private getRandomChar() {
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    const randChar = Math.floor(Math.random() * charset.length);
    const randType: CharacterType = Math.floor(Math.random() * Object.keys(CharacterType).length);

    switch (randType) {
      case CharacterType.LOWER_CASE: {
        return charset[randChar].toLowerCase();
      }
      case CharacterType.UPPER_CASE: {
        return charset[randChar].toUpperCase();
      }
      default: {
        return charset[randChar];
      }
    }
  }

  public generate() {
    const svgText: string[] = [];
    const positions: number[] = [];
    const weights: Array<string | null> = [];

    const transform: Array<string | null> = [];
    for (let i = 0; i < 5; i++) {
      if (i === 0) {
        positions.push(this.config.textPos.x);
      } else {
        positions.push(positions[i - 1] + this.config.fontSize / 2);
      }

      const randWeight: CharacterWeight = Math.floor(Math.random() * Object.keys(CharacterWeight).length);
      weights.push(randWeight === CharacterWeight.BOLD ? `font-weight="bold"` : null);

      const randTransform: TransformType = Math.floor(Math.random() * Object.keys(TransformType).length);
      switch (randTransform) {
        case TransformType.NORMAL: {
          transform.push(null);
          break;
        }
        case TransformType.ROTATE_RIGHT: {
          transform.push(
            `transform="rotate(25 ${positions[i]} ${this.config.textPos.y + this.config.fontSize / 2})"`
          );
          break;
        }
        case TransformType.ROTATE_LEFT: {
          transform.push(
            `transform="rotate(-25 ${positions[i]} ${this.config.textPos.y + this.config.fontSize / 2})"`
          );
          break;
        }
        default: {
          transform.push(null);
          break;
        }
      }
    }
    const noRotation: boolean = transform.every((i) => i === null);
    if (noRotation) {
      const randItem = Math.floor(Math.random() * transform.length);
      transform[randItem] = `transform="rotate(25 ${positions[randItem]} ${this.config.height / 2})"`;
    }
    const noCustomWeight: boolean = weights.every((i) => i === null);
    if (noCustomWeight) {
      const randItem = Math.floor(Math.random() * weights.length);
      weights[randItem] = `font-weight="bold"`;
    }

    let text = "";
    for (let i = 0; i < 5; i++) {
      const char = this.getRandomChar();
      text += char;
      svgText.push(`
        <text
          x="${positions[i]}"
          y="${this.config.textPos.y + (this.config.fontSize / 2)}"
          dominant-baseline="middle"
          text-anchor="middle"
          font-family="Arial"
          font-size="${this.config.fontSize}"
          ${weights[i] ?? ""}
          fill="black"
          ${transform[i] ?? ""}
        >
          ${char}
        </text>
      `);
    }
    return { text: text, svg: svgText };
  }
}
