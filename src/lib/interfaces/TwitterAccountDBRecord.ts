export interface TwitterAccountDBRecord {
	username: string,
	password: string
}

export interface TwitterAccountRow {
	id: number, 
	username: string, 
	password: string, 
	email: string | undefined,
	phone: string,
	type: number | undefined,
	following: number,
	owner: number, 
	profileImg: string | undefined,
	suspended: number
}