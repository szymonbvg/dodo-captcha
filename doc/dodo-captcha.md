# dodo-captcha

## Table of contents

- [Class: DodoCaptcha](#class-dodocaptcha)
	- [new DodoCaptcha()](#new-dodocaptcha)
	- [dodoCaptcha.config](#dodocaptcha.config)
	- [dodoCaptcha.verifier](#dodocaptcha.verifier)
	- [dodoCaptcha.init()](#dodocaptcha.init)
- [Class: DodoCaptchaVerifier](#class-dodocaptchaverifier)
	- [new DodoCaptchaVerifier()](#new-dodocaptchaverifier)
	- [dodoCaptchaVerifier.addVerifiedClient([token])](#dodocaptchaverifier.addverifiedclienttoken)
	- [dodoCaptchaVerifier.removeVerifiedClient([token])](#dodocaptchaverifier.removeverifiedclienttoken)
	- [dodoCaptchaVerifier.verifyToken([token])](#dodocaptchaverifier.verifytokentoken)
- [Types](#types)
	- [DodoCaptchaConfig](#dodocaptchaconfig-type)
	- [DodoCaptchaMessage](#dodocaptchamessage-type)
	- [DodoMessageType](#dodomessagetype-enum)

## Class: DodoCaptcha

This class is used to configurate and initialize enitre captcha

### ``new DodoCaptcha()``

Creates a new instance of captcha but does not yet start the websocket server

### ``dodoCaptcha.config``

- Type: \<[DodoCaptchaConfig](#dodocaptchaconfig-type)\>

Configuration of captcha's outerHTML and functionality

**NOTE**: Configuration must be set before using [dodoCaptcha.init()](#dodocaptcha.init)

**Example**

```js
dodoCaptcha.config = {
	expirationTime: 1000 * 5 * 60,
	port: 8000,
	secured: false,
	width: 300,
	height: 75,
	textPos: {
		x: 150,
		y: 35,
	},
	lineWidth: 100,
	fontSize: 32,
};
```

### ``dodoCaptcha.verifier``

- Type: \<[DodoCaptchaVerifier](#class-dodocaptchaverifier)\>

Captcha verifier that stores tokens of all verified clients

### ``dodoCaptcha.init()``

Initializes websocket server for captcha communication and functionality

**NOTE**: If port was not set in [dodoCaptcha.config](#dodocaptcha.config) the websocket server will run on default port (1337)

**Example**

```js
const { DodoCaptcha } = require("dodo-captcha");

const captcha = new DodoCaptcha();
captcha.init();
```

## Class: DodoCaptchaVerifier

This class represents a captcha verifier that stores tokens of all verified clients

### ``new DodoCaptchaVerifier()``

Creates a new instance of the captcha verifier which will store all verified clients

### ``dodoCaptchaVerifier.addVerifiedClient([token])``

- ``token`` \<string\> Client's token sent to them after attempting the captcha challenge (parameter of ``CAPTCHA_VERIFIED`` message type)

Inserts client's token to verified list

### ``dodoCaptchaVerifier.removeVerifiedClient([token])``

- ``token`` \<string\> Client's token sent to them after attempting the captcha challenge (parameter of ``CAPTCHA_VERIFIED`` message type)

Removes token form verified list

### ``dodoCaptchaVerifier.verifyToken([token])``

- ``token`` \<string\> Client's token sent to them after attempting the captcha challenge (parameter of ``CAPTCHA_VERIFIED`` message type)

- Returns: \<boolean\>

Checks whether the token is verified

**Example**

```js
if (dodoCaptcha.verifier.verifyToken(tokenSentByClient))
{
	dodoCaptcha.verifier.removeVerifiedClient(tokenSentByClient);
	// send content to client
	// for example res.send({status: true, msg: "you're welcome"});
}
```
It's recommended to remove the client from the verified list after successful verification because otherwise, they will be removed only when the captcha expires

## Types

### ``DodoCaptchaConfig`` (type)

- ``expirationTime`` \<number\> Captcha challenge expiration time in ms
- ``port`` \<number\> Websocket server port
- ``secured`` \<boolean\> Defines whether the websocket server should use TLS
- ``tlsKeyPath`` \<string | undefined\> Defines the path to the private key. This should be set if the ``secured`` option is set to true
- ``tlsCertPath`` \<string | undefined\> Defines the path to the certificate. This should be set if the ``secured`` option is set to true
- ``width`` \<number\> Width of captcha challenge frame in px
- ``height`` \<number\> Height of captcha challenge frame in px
- ``textPos`` \<{x: number, y: number}\> Position of captcha code on challenge frame in px
- ``lineWidth`` \<number\> width of captcha challenge difficulty line in px
- ``fontSize`` \<number\> font size of captcha code in px

### ``DodoCaptchaMessage`` (type)

- ``type`` \<[DodoMessageType](#dodomessagetype-enum)\> Message type
- ``params`` \<string | undefined\> Message parameters

### ``DodoMessageType`` (enum)

- ``CAPTCHA_GET_CHALLENE ("captcha.get.challenge")`` Message sent by client to generate the captcha
- ``CAPTCHA_CHALLENGE ("captcha.challenge")`` Message sent by server containing captcha's outerHTML as parameter
- ``CAPTCHA_EXPIRED ("captcha.expired")`` Message sent by server when captcha expires
(contains captcha's outerHTML with expiration information)
- ``CAPTCHA_CHECK_RESULT ("captcha.check.result")`` Message sent by client to verify if they have correctly solved captcha challenge
(message should contain code of captcha challenge solution)
- ``CAPTCHA_VERIFIED ("captcha.verified")`` Message sent by server when code sent by client is correct
(contains client's token as parameter)
- ``CAPTCHA_NOT_VERIFIED ("captcha.not.verified")`` Message sent by server when code sent by client is incorrect
