//auto create by cconfig,should not modify this script
enum ItemType{
	 /**
	 * 无任何
	 **/
	None = 0,

	 /**
	 * 食物
	 **/
	Food = 1,

	 /**
	 * 武器
	 **/
	Weapon = 2,
}

class weapon {
	 /**
	 * id
	 **/
	public id: number;

	 /**
	 * 武器的名称
	 **/
	public name: string;

	 /**
	 * 武器的tag
	 **/
	public tag: string;

	private static data: weapon[];
	private static dataMap: Map<number, weapon>;

	public static init(data: weapon[]): void {
		this.data = data;
		this.dataMap = new Map();
		data.forEach(item => {
			const key = item["id"];
			if(!this.dataMap.has(key)) this.dataMap.set(key, item);
		})
	}

	public static get(key: number): weapon | undefined {return this.dataMap.get(key);}
	public static getAll(): weapon[]{return Array.from(this.data);}
}

export const CConfig = {
	ItemType,
	weapon,
	init(input: string | ArrayBuffer): void {
		const data = typeof input === "string" ? JSON.parse(input) : null;
		this.weapon.init(data["weapon"]);
	}
}
