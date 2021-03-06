import type { SvelteComponent } from "svelte";

//declare module "svelte-steer" {
declare global {
	type Constructor<T> = { new (...args: any[]): T };
	type Lazy<T> = typeof T | (()=> Lazy<T>) | Promise<Lazy<T>>;
	/**
	 * Routes as specified by the user
	 */
	interface RouteDesc {
		name?: string;
		path: string;
		component?: Lazy<SvelteComponent>;
		nested?: RouteDesc[];
		enter?(route: RouteMatch): boolean | void;
		properties?(props: Record<string, string>, route: RouteMatch): boolean | void;
		leave?(route: RouteMatch): string | void;
		meta?: any;	// custom-use
	}

	type Segment = {
		name: string;
		variable: boolean;
	}

	/**
	 * Analysed routes specs
	 */
	interface RouteSpec extends RouteDesc {
		segments: Segment[];
		nested?: RouteSpec[];
		parent?: RouteSpec;
		namedSubs?: Record<string, RouteSpec>;
	}

	interface RouteMatch {
		spec: RouteSpec;
		parent?: RouteMatch;
		nested?: RouteMatch;
		props: Record<string, string>;
	}

	interface Routing {
		link(path: string | RouteMatch, props?: Record<string, string>): string;
		match(path: string, props?: Record<string, string>): RouteMatch;
		navigate(path: string, props?: Record<string, string>, push?: boolean);
		replace(path: string, props?: Record<string, string>);
		go(delta: number);
		locale: string;
		nameLocale: string;
	}

	interface RouteHistory {
		url(segments: string[]): string;
		value: string;
	}
	
	type LeavePrompter = (prompt: string)=> Promise<boolean>;
}