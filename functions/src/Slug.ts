export default class Slug {
	static slugify(str: string): string {
		return str.trim().replace(/\s+/g, '-').replace(/\.+/g, '').toLowerCase()
	}
}