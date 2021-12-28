export async function lazy<T>(obj: Lazy<T>, ctor?: Constructor<T>): Promise<T> {
	while(obj instanceof Promise ||
		(obj instanceof Function &&
		 !(obj.prototype instanceof ctor))
	)
		if(obj instanceof Promise) obj = await <Promise<Lazy<T>>>obj;
		else obj = (<()=> Lazy<T>>obj)();
	return Promise.resolve(<T>obj);
}
export function excludeProps(props: any, ...exclude: string[]) {
	let rv = Object.assign({}, props);
	for(let prop of exclude) delete rv[prop];
	return rv;
}