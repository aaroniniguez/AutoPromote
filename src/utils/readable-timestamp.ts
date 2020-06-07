import moment from "moment-timezone";
export default function readableTimestamp() {
    return moment(Date.now()).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss');
}