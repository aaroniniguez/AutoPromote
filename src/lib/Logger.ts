import winston from "winston";
const {combine, prettyPrint, errors} = winston.format;
const logPath = __dirname+"/../../logs";
const moment = require('moment-timezone');

const readableTime = winston.format((info, opts) => {
	info.timestamp = moment().tz("America/Los_Angeles").format("LLLL");
	return info;	
});

const logFormat = winston.format.printf(({ timestamp, level, username , message, id, stack}) => {
	return `
	{ timestamp: "${timestamp}"
	  level: "${level}"
	  username: "${username}"
	  message: "${message}"
	  id: "${id}"
	  ${stack ? "stack: " + stack : ""}
	}`;
});

export const Logger = winston.createLogger({
	format: combine(
		errors({stack: true}),
		readableTime(),
		prettyPrint(),
		logFormat
	),
	transports: [
		new winston.transports.File({ filename: logPath+'/error.log', level: 'error' }),
		new winston.transports.File({ filename: logPath+'/combined.log' })
	]
});