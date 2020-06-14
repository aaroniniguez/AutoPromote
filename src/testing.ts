import cron from 'node-cron';
import SchedulerDAO from './lib/DAO/SchedulerDAO';
async function scheduleTweets() {
    const schedulerDao = new SchedulerDAO();
    const minutesInDay = 1440;
    const numberPromotions = await schedulerDao.getPromotionCount("postmates");
    const timeBetween = Math.floor(minutesInDay/parseInt(numberPromotions));
    for(let i =0; i < numberPromotions; i++) {
        let currentTimeMinutes = i* timeBetween;
        let hour = Math.floor(currentTimeMinutes/60)
        let minutes = currentTimeMinutes % 60;
        console.log(`${minutes} ${hour} * * *`)
        cron.schedule(`${minutes} ${hour} * * *`, function(){
            console.log('running a task every minute');
        });
    }
    schedulerDao.cleanup();
}
scheduleTweets()