const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
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