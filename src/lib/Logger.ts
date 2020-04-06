const winston = require("winston");
const {combine, prettyPrint} = winston.format;
const logPath = __dirname+"../logs";
const moment = require('moment-timezone');

const readableTime = winston.format((info, opts) => {
	info.timestamp = moment().tz("America/Los_Angeles").format("LLLL");
	return info;	
});
export const Logger = winston.createLogger({
	level: "info", 
	format: combine(
		readableTime(),
		prettyPrint()
	),
	transports: [
		new winston.transports.File({ filename: logPath+'/error.log', level: 'error' }),
		new winston.transports.File({ filename: logPath+'/combined.log' })
	]
});