# DodoCaptcha - Simple & customizable self-hosted CAPTCHA

Ready to use text-based CAPTCHA you can implement on your project's backend. Communication between client and server is based on websocket messages so initializing CAPTCHA on your backend will also start the websocket server on port specified in configuration

## Installing

```
npm install dodo-captcha
```

## Examples

### Default initialization:

```js
const { DodoCaptcha } = require("dodo-captcha");

const captcha = new DodoCaptcha();
captcha.init();
```

### Custom configuration:

**NOTE**: Configuration must be set before initialization

```js
// custom websocket server port
captcha.config.port = 8000;

// custom captcha's frame width and generated code position
captcha.config.width = 300;
captcha.config.textPos.x = 150;

// other custom options
captcha.config.[option_name_from_docs] = [value];
```

### Verifying clients:

```js
const express = require("express");
const { DodoCaptcha } = require("dodo-captcha");

const app = express();
app.use(express.json());

const captcha = new DodoCaptcha();
captcha.init();

app.post("/endpoint", (req, res) => {
	const token = req.body.captchaToken;
	if (token) {
		const verified = captcha.verifier.verifyToken(token);
		if (verified) {
			captcha.verifier.removeVerifiedClient(token);
		}
		res.send({status: verified});
	}
});

app.listen(3000);
```

**NOTE**: It's recommended to remove the client from the verified list after successful verification because otherwise, they will be removed only when the captcha expires

## Client-side

To display the CAPTCHA on the client side you need to initialize a websocket connection with CAPTCHA's backend and handle the messages sent by the backend. You can find a list of all handleable messages along with their descriptions in [documentation under "Types" section][messages]

### Examples (vanilla JS)

**Connecting to websocket & handling messages**

```js
const messageHandler(evt) => {
	const parsed = JSON.parse(evt.data);
	switch(parsed.type) {
		// handle each message from docs
	}
}
const ws = new WebSocket("ws://localhost:8000");
ws.addEventListener("message", messageHandler);

// some code

ws.removeEventListener("message", messageHandler);
```

**Fetching & displaying CAPTCHA**

```html
<html>
	<body>
		<button onclick="fetchCaptcha()">fetch CAPTCHA</button>
		<div id="captcha"></div>
		<script>
		const messageHandler = (evt) => {
			const parsed = JSON.parse(evt.data);
			const captchaDiv = document.getElementById("captcha");
				
			switch (parsed.type) {
				case "captcha.challenge":
					captchaDiv.innerHTML = parsed.params;
					break; 
				// other messages
			}
		}
			
		const ws = new  WebSocket("ws://localhost:1337");
		ws.addEventListener("message", messageHandler);

		const fetchCaptcha = () => {
			ws.send(JSON.stringify({type: "captcha.get.challenge"}));
		}
			
		window.addEventListener("beforeunload", () => {
			ws.removeEventListener("message", messageHandler);
			ws.close();
		})
		</script>
	</body>
</html>
```

**Solving CAPTCHA**

```html
<html>
	<body>
		<input id="result" />
		<button onclick="check()">check</button>
		<div id="captcha"></div>
		<script>
		let token;

		const messageHandler = (evt) => {
			const parsed = JSON.parse(evt.data);
			const captchaDiv = document.getElementById("captcha");

			switch (parsed.type) {
				case "captcha.challenge":
					captchaDiv.innerHTML = parsed.params;
					break;
				case "captcha.verified":
					token = parsed.params;
					break;
				// other messages
			}
		}

		const ws = new WebSocket("ws://localhost:1337");

		const check = () => {
			const result = document.getElementById("result");
			ws.send(JSON.stringify({type: "captcha.check.result", params: result.value}));
		}

		ws.addEventListener("message", messageHandler);
		ws.addEventListener("open", () => {
			ws.send(JSON.stringify({type: "captcha.get.challenge"}));
		}, {once: true});

		window.addEventListener("beforeunload", () => {
			ws.removeEventListener("message", messageHandler);
			ws.close();
		})
		</script>
	</body>
</html>
```

## License

[MIT](LICENSE)

[messages]: ./doc/dodo-captcha.md#dodomessagetype-enum
