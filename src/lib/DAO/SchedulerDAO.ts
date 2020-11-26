import BaseDao from "./BaseDAO";

export default class SchedulerDAO extends BaseDao {
	private tableName: string;
	constructor() {
		super()
		this.tableName = 'scheduler';
	}
	getAllPromotionFreq() {
		return this.DB.query(`
			SELECT promotion, promotions_per_day, updated
            FROM ${this.tableName}
		`).then(row => row);
	}

	wasUpdated() {
		return this.DB.query(`SELECT count(*) from ${this.tableName} where updated = 1`).then(row => !!row[0]['count(*)'])
	}
	
	resetUpdateFlag() {
		return this.DB.query(`UPDATE ${this.tableName} set updated = 0`);
	}
}