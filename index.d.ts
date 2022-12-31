export type Options = {
	browser?: boolean;
	conditions?: readonly string[];
	require?: boolean;
	unsafe?: false;
} | {
	conditions?: readonly string[];
	unsafe?: true;
}

export function resolve<T=any>(pkg: T, entry: string, options?: Options): string | void;