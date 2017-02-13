export default class Product {
	constructor(sales, buyout, singleSite) {
		this.sales = sales || 0;
		this.buyout = buyout || 0;
		this.singleSite = singleSite || 0;
	}
}
