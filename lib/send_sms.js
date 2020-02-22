// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = 'ACe7019645c7e1845feda9f460c93035ac';
const authToken = '959cdb2bb0aa4df39577a7fb15da97b3';
const client = require('twilio')(accountSid, authToken);

function sendMessage(message) {
	client.messages
	.create({
		body: message,
		from: '+12014743809',
		to: '+19165178775'
	})
	.then(message => console.log(message.sid));
}

module.exports = sendMessage;