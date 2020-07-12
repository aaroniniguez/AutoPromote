/**
 * DAO for Scheduler 
 */
import Database from "../Database";
import { RowDataPacket } from "mysql";

export default class SchedulerDAO {
	DB: Database;
	constructor() {
		this.DB = new Database("stock")
	}

	getAllPromotionFreq() {
		return this.DB.query(`
			SELECT promotion, promotions_per_day
            FROM scheduler
		`).then((row: RowDataPacket[]) => {
			return row;
		})
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