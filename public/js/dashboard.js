document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()
	const actions = [
		{ title: 'Send Money', detail: 'Direct pay to an individual or company', onclick: 'showSendModal()' },
		{ title: 'Create Invoice', detail: 'Request money from an individual or company', onclick: 'showInvoiceModal()' },
		{ title: 'Your ID', detail: 'Show your Quick Pay ID', onclick: 'showYourIdModal()', button: 'show' },
		{ title: 'Transaction History', detail: 'Record every transaction you\'ve ever made', onclick: 'showTransactionsModal()', button: 'view' },
		{ title: 'Invoices', detail: 'Record and respond to all of your invoices', onclick: 'showTransactionsModal()', button: 'view' }
	]
	let user

	createActionCards()

	auth.onAuthStateChanged(function(newUser) {
		user = newUser
		if (user) {

		} else {

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
				<a ${action.href ? `href="${action.href}"` : `onclick="${action.onclick}"`} class="card-footer-item action-card-button">${action.button ? action.button : 'go'}</a>
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