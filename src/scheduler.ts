import cron from 'node-cron';
import SchedulerDAO from './lib/DAO/SchedulerDAO';
import {exec} from "child_process";
import { Logger } from './lib/Logger';
import { RowDataPacket } from 'mysql';
import { promote } from './promote';
exec("ps -e|grep '[n]ode .*dist/scheduler\.js' -c", (error, stdout, stderr) => {
    if (error && error.code !== 1) {
        Logger.log({level: "error", message: "Start Command failed: " + error});
        return;
    }
    if (stderr) {
        Logger.log({level: "error", message: "Start Command failed: " + stderr});
        return;
    }
    let instances = parseInt(stdout);
    //one for cron job 
    //one for initial run 
    if(instances < 3) {
        Logger.log({level: "info", message: "Started Scheduler"});
        scheduleTweets()
    }
});

async function scheduleTweets() {
    const schedulerDao = new SchedulerDAO();
    const promotionSchedules = await schedulerDao.getAllPromotionFreq();
    schedulerDao.cleanup();
    
    promotionSchedules.forEach((entry: RowDataPacket) => {
        const numberPromotions = entry.promotions_per_day;
        for(let i =0; i < parseInt(numberPromotions); i++) {
            let currentTimeMinutes = Math.floor(i* 1440/parseInt(numberPromotions));
            let hour = Math.floor(currentTimeMinutes/60)
            let minutes = currentTimeMinutes % 60;
            console.log(`${minutes} ${hour} * * *`, entry.promotion)
            cron.schedule(`${minutes} ${hour} * * *`, () => {
                promote(entry.promotion);
            });
        }
    });

}