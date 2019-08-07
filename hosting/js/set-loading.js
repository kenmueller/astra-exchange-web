function setLoading(element, isLoading) {
	isLoading
		? element.classList.add('is-loading')
		: element.classList.remove('is-loading')
}