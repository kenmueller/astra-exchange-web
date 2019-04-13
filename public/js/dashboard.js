document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()
	const actions = [
		{ title: 'Send Money', detail: 'Direct pay to an individual or company', href: 'send' },
		{ title: 'Create Invoice', detail: 'Request money from an individual or company', href: 'invoice' }
	]
	createActionCards()
	
	auth.onAuthStateChanged(function(user) {
		if (user) {
			document.querySelectorAll('.card.action').forEach(element => element.disabled = false)
		}
	})

	function createActionCard(action) {
		const div = document.createElement('div')
		div.className = 'card action'
		div.innerHTML = `
			<header class="card-header">
				<p class="card-header-title">${action.title}</p>
			</header>
			<div class="card-content">
				<div class="content">${action.detail}</div>
			</div>
			<footer class="card-footer">
				<a href="${action.href}" class="card-footer-item" disabled>${action.button ? action.button : 'Go'}</a>
			</footer>
		`
		document.getElementById('action-cards').appendChild(div)
	}

	function createActionCards() {
		for (action in actions) {
			createActionCard(actions[action])
		}
	}
})