/**
 * DAO for Scheduler 
 */
import database from "../Database";
import Database from "../Database";
import { RowDataPacket } from "mysql";

class SchedulerDAO {
	DB: Database;
	constructor() {
		this.DB = new database("localhost", "root", "stock")
	}

	getPromotionCount(promotion: string) {
		return this.DB.query(`
			SELECT promotions_per_day
            FROM scheduler
            WHERE promotion='${promotion}'
		`).then((row: RowDataPacket[]) => {
			return row[0].promotions_per_day
        }).catch((err) => {
            console.log(err);
        });
	}

	cleanup() {
		this.DB.disconnect();
	}
}
export default SchedulerDAO;