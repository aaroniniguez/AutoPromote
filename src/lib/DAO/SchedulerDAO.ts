import { RowDataPacket } from "mysql";
import BaseDao from "./BaseDAO";

export default class SchedulerDAO extends BaseDao {
	getAllPromotionFreq() {
		return this.DB.query(`
			SELECT promotion, promotions_per_day, updated
            FROM scheduler
		`).then((row: RowDataPacket[]) => {
			return row;
		})
	}

	wasUpdated(): Promise<boolean>{
		return this.DB.query(`
			SELECT count(*) from scheduler where updated = 1
		`).then((row: RowDataPacket[]) => {
			return !!row[0]['count(*)'];
		})
	}
	
	resetUpdateFlag() {
		return this.DB.query(`UPDATE scheduler set updated = 0`);
	}
}