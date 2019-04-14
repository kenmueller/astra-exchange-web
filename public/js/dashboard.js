document.addEventListener('DOMContentLoaded', function() {
	const auth = firebase.auth()
	const db = firebase.database()
	let user
	let users = []
	let transactions = []
	let invoices = []

	auth.onAuthStateChanged(function(user_) {
		if (user_) {
			const id = user_.uid
			db.ref(`users/${id}`).on('value', function(snapshot) {
				const val = snapshot.val()
				user = { id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, card: val.cards[0] }
				document.querySelectorAll('.user.name').forEach(element => element.innerHTML = `Hello, ${user.name}`)
				document.querySelectorAll('.user.balance').forEach(element => element.innerHTML = user.balance)
				document.querySelectorAll('.user.independence').forEach(element => element.innerHTML = user.independence === 0 ? '---' : user.independence)
				updateTransactionCount()
				updateOpenInvoiceCount()
			})
			db.ref('users').on('child_added', function(snapshot) {
				const val = snapshot.val()
				const userId = snapshot.key
				const newUser = { id: userId, name: val.name, email: val.email, balance: val.balance }
				users.push(newUser)
				db.ref(`users/${userId}/balance`).on('value', function(balanceSnapshot) {
					newUser.balance = balanceSnapshot.val()
					updateLeaderboard()
				})
			})
			db.ref(`transactions/${id}`).on('child_added', function(snapshot) {
				const val = snapshot.val()
				const transaction = { id: snapshot.id, time: val.time, from: val.from, to: val.to, amount: val.amount, balance: val.balance, message: val.message }
				transactions.push(transaction)
				updateTransactionCount()
				updateTransactionsPreview(transaction)
				updateTransactions(transaction)
			})
			db.ref(`invoices/${id}`).on('child_added', function(snapshot) {
				const val = snapshot.val()
				const invoice = { id: snapshot.id, time: val.time, status: val.status, from: val.from, to: val.to, amount: val.amount, message: val.message }
				invoices.push(invoice)
				updateOpenInvoiceCount()
				updateInvoicesPreview(invoice)
				updateInvoices(invoice)
			})
		}
	})

	function updateTransactionCount() {
		const transactionCount = transactions.length
		document.querySelectorAll('.user.transaction-count').forEach(element => element.innerHTML = transactionCount)
		document.querySelectorAll('.user.transaction-count-label').forEach(element => element.innerHTML = `Transaction${transactionCount === 1 ? '' : 's'}`)
	}

	function updateTransactionsPreview(transaction) {
		const outgoing = transaction.from === user.id
		db.ref(`users/${outgoing ? transaction.to : transaction.from}/name`).on('value', function(snapshot) {
			const tr = document.createElement('tr')
			tr.className = 'transaction'
			tr.innerHTML = `
				<td width="3%"><i class="fa fa-dollar-sign"></i></td>
				<td style="text-transform: uppercase;"><strong>${outgoing ? 'outgoing' : 'incoming'}</strong></td>
				<td>${snapshot.val()}</td>
				<td>${transaction.amount} Astras</td>
			`
			const viewButton = document.createElement('a')
			const strong = document.createElement('strong')
			strong.appendChild(document.createTextNode('view'))
			viewButton.appendChild(strong)
			viewButton.onclick = function() { showTransactionModal(transaction) }
			viewButton.classList.add('button')
			viewButton.classList.add('is-small')
			viewButton.classList.add('is-primary')
			viewButton.style.textTransform = 'uppercase'
			const viewCell = document.createElement('td')
			viewCell.appendChild(viewButton)
			tr.appendChild(viewCell)
			if (document.getElementById('transactions-preview').childNodes.length === 10) {
				document.getElementById('transactions-preview').removeChild(document.getElementById('transactions-preview').childNodes[9])
			}
			document.getElementById('transactions-preview').insertBefore(tr, document.getElementById('transactions-preview').childNodes[0])
		})
	}

	function updateOpenInvoiceCount() {
		const openInvoiceCount = invoices.filter(invoice => invoice.status === 'pending').length
		document.querySelectorAll('.user.open-invoice-count').forEach(element => element.innerHTML = openInvoiceCount)
		document.querySelectorAll('.user.open-invoice-count-label').forEach(element => element.innerHTML = `Open Invoice${openInvoiceCount === 1 ? '' : 's'}`)
	}

	function updateInvoicesPreview(invoice) {
		const outgoing = invoice.from === user.id
		db.ref(`users/${outgoing ? invoice.to : invoice.from}/name`).on('value', function(snapshot) {
			const tr = document.createElement('tr')
			tr.className = 'invoice'
			tr.innerHTML = `
				<td width="3%"><i class="fa fa-hand-holding-usd"></i></td>
				<td style="text-transform: uppercase;"><strong>${outgoing ? 'outgoing' : 'incoming'}</strong></td>
				<td>${snapshot.val()}</td>
				<td>${invoice.amount} Astras</td>
			`
			const viewButton = document.createElement('a')
			const strong = document.createElement('strong')
			strong.appendChild(document.createTextNode('view'))
			viewButton.appendChild(strong)
			viewButton.onclick = function() { showInvoiceModal(invoice) }
			viewButton.classList.add('button')
			viewButton.classList.add('is-small')
			viewButton.classList.add('is-primary')
			viewButton.style.textTransform = 'uppercase'
			const viewCell = document.createElement('td')
			viewCell.appendChild(viewButton)
			tr.appendChild(viewCell)
			if (document.getElementById('invoices-preview').childNodes.length === 10) {
				document.getElementById('invoices-preview').removeChild(document.getElementById('invoices-preview').childNodes[9])
			}
			document.getElementById('invoices-preview').insertBefore(tr, document.getElementById('invoices-preview').childNodes[0])
		})
	}

	function showTransactionModal(transaction) {
		const outgoing = transaction.from === user.id
		db.ref(`users/${outgoing ? transaction.to : transaction.from}/name`).on('value', function(snapshot) {
			const val = snapshot.val()
			document.querySelectorAll('.transaction.type').forEach(element => element.innerHTML = `${outgoing ? 'Outgoing' : 'Incoming'} Transaction`)
			document.querySelectorAll('.transaction.time').forEach(element => element.innerHTML = transaction.time)
			document.querySelectorAll('.transaction.from').forEach(element => element.innerHTML = outgoing ? `${user.name} (you)` : val)
			document.querySelectorAll('.transaction.to').forEach(element => element.innerHTML = outgoing ? val : `${user.name} (you)`)
			document.querySelectorAll('.transaction.amount').forEach(element => element.innerHTML = `${transaction.amount} Astras`)
			document.querySelectorAll('.transaction.balance-label').forEach(element => element.innerHTML = `${outgoing ? 'Remaining' : 'New'} Balance`)
			document.querySelectorAll('.transaction.balance').forEach(element => element.innerHTML = `${transaction.balance} Astras`)
			document.querySelectorAll('.transaction.msg-label').forEach(element => element.style.display = transaction.message.trim() === '' ? 'none' : 'block')
			document.querySelectorAll('.transaction.msg').forEach(element => element.innerHTML = transaction.message)
			document.querySelectorAll('.modal.transaction').forEach(element => element.classList.add('is-active'))
		})
	}

	function showInvoiceModal(invoice) {
		const outgoing = invoice.from === user.id
		db.ref(`users/${outgoing ? invoice.to : invoice.from}/name`).on('value', function(snapshot) {
			const val = snapshot.val()
			document.querySelectorAll('.invoice.type').forEach(element => element.innerHTML = `${outgoing ? 'Outgoing' : 'Incoming'} Invoice`)
			document.querySelectorAll('.invoice.time').forEach(element => element.innerHTML = invoice.time)
			document.querySelectorAll('.invoice.status').forEach(element => element.innerHTML = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1))
			document.querySelectorAll('.invoice.from').forEach(element => element.innerHTML = outgoing ? `${user.name} (you)` : val)
			document.querySelectorAll('.invoice.to').forEach(element => element.innerHTML = outgoing ? val : `${user.name} (you)`)
			document.querySelectorAll('.invoice.amount').forEach(element => element.innerHTML = `${invoice.amount} Astras`)
			document.querySelectorAll('.invoice.msg-label').forEach(element => element.style.display = invoice.message.trim() === '' ? 'none' : 'block')
			document.querySelectorAll('.invoice.msg').forEach(element => element.innerHTML = invoice.message)
			if (!outgoing && invoice.status === 'pending') {
				document.querySelectorAll('.download-app').forEach(element => element.classList.remove('is-hidden'))
			} else {
				document.querySelectorAll('.download-app').forEach(element => element.classList.add('is-hidden'))
			}
			document.querySelectorAll('.modal.invoice').forEach(element => element.classList.add('is-active'))
		})
	}

	function updateTransactions(transaction) {
		const outgoing = transaction.from === user.id
		db.ref(`users/${outgoing ? transaction.to : transaction.from}/name`).on('value', function(snapshot) {
			const tr = document.createElement('tr')
			tr.className = 'transaction'
			tr.innerHTML = `
				<td width="3%"><i class="fa fa-dollar-sign"></i></td>
				<td style="text-transform: uppercase;"><strong>${outgoing ? 'outgoing' : 'incoming'}</strong></td>
				<td>${snapshot.val()}</td>
				<td>${transaction.amount} Astras</td>
			`
			const viewButton = document.createElement('a')
			const strong = document.createElement('strong')
			strong.appendChild(document.createTextNode('view'))
			viewButton.appendChild(strong)
			viewButton.onclick = function() { showTransactionModal(transaction) }
			viewButton.classList.add('button')
			viewButton.classList.add('is-small')
			viewButton.classList.add('is-primary')
			viewButton.style.textTransform = 'uppercase'
			const viewCell = document.createElement('td')
			viewCell.appendChild(viewButton)
			tr.appendChild(viewCell)
			document.getElementById('transactions').insertBefore(tr, document.getElementById('transactions').childNodes[0])
		})
	}

	function updateInvoices(invoice) {
		const outgoing = invoice.from === user.id
		db.ref(`users/${outgoing ? invoice.to : invoice.from}/name`).on('value', function(snapshot) {
			const tr = document.createElement('tr')
			tr.className = 'invoice'
			tr.innerHTML = `
				<td width="3%"><i class="fa fa-hand-holding-usd"></i></td>
				<td style="text-transform: uppercase;"><strong>${outgoing ? 'outgoing' : 'incoming'}</strong></td>
				<td>${snapshot.val()}</td>
				<td>${invoice.amount} Astras</td>
			`
			const viewButton = document.createElement('a')
			const strong = document.createElement('strong')
			strong.appendChild(document.createTextNode('view'))
			viewButton.appendChild(strong)
			viewButton.onclick = function() { showInvoiceModal(invoice) }
			viewButton.classList.add('button')
			viewButton.classList.add('is-small')
			viewButton.classList.add('is-primary')
			viewButton.style.textTransform = 'uppercase'
			const viewCell = document.createElement('td')
			viewCell.appendChild(viewButton)
			tr.appendChild(viewCell)
			document.getElementById('invoices').insertBefore(tr, document.getElementById('invoices').childNodes[0])
		})
	}

	function updateLeaderboard() {
		removeAllNodes(document.getElementById('leaderboard'))
		const sortedUsers = users.sort(function(a, b) { return b.balance - a.balance })
		for (i in sortedUsers) {
			const user_ = sortedUsers[i]
			const tr = document.createElement('tr')
			tr.innerHTML = `
				<td width="3%"><strong>#${parseInt(i) + 1}</strong></i></td>
				<td>${user_.name}</td>
				<td><strong>${user_.balance}</strong></td>
			`
			document.getElementById('leaderboard').appendChild(tr)
		}
	}

	function removeAllNodes(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild)
		}
	}

	function showModal(modal) {
		document.querySelectorAll(`.modal.${modal}`).forEach(element => element.classList.add('is-active'))
	}

	function hideModal(modal) {
		document.querySelectorAll(`.modal.${modal}`).forEach(element => element.classList.remove('is-active'))
	}

	function showSendModal() {
		showModal('send')
	}

	function hideSendModal() {
		hideModal('send')
	}

	function showCreateInvoiceModal() {
		showModal('create-invoice')
	}

	function hideCreateInvoiceModal() {
		hideModal('create-invoice')
	}

	function showTransactionsModal() {
		showModal('transactions')
	}

	function hideTransactionsModal() {
		hideModal('transactions')
	}

	function showInvoicesModal() {
		showModal('invoices')
	}

	function hideInvoicesModal() {
		hideModal('invoices')
	}

	function showYourIdModal() {
		showModal('your-id')
	}

	function hideYourIdModal() {
		hideModal('your-id')
	}

	function hideTransactionModal() {
		hideModal('transaction')
	}

	function hideInvoiceModal() {
		hideModal('invoice')
	}

	function showLeaderboardModal() {
		showModal('leaderboard')
	}

	function hideLeaderboardModal() {
		hideModal('leaderboard')
	}

	function showSettingsModal() {
		showModal('settings')
	}

	function hideSettingsModal() {
		hideModal('settings')
	}

	document.querySelectorAll('.action.send').forEach(element => element.addEventListener('click', showSendModal))
	document.querySelectorAll('.close-send').forEach(element => element.addEventListener('click', hideSendModal))
	document.querySelectorAll('.action.create-invoice').forEach(element => element.addEventListener('click', showCreateInvoiceModal))
	document.querySelectorAll('.close-create-invoice').forEach(element => element.addEventListener('click', hideCreateInvoiceModal))
	document.querySelectorAll('.action.transactions').forEach(element => element.addEventListener('click', showTransactionsModal))
	document.querySelectorAll('.close-transactions').forEach(element => element.addEventListener('click', hideTransactionsModal))
	document.querySelectorAll('.action.invoices').forEach(element => element.addEventListener('click', showInvoicesModal))
	document.querySelectorAll('.close-invoices').forEach(element => element.addEventListener('click', hideInvoicesModal))
	document.querySelectorAll('.action.your-id').forEach(element => element.addEventListener('click', showYourIdModal))
	document.querySelectorAll('.close-your-id').forEach(element => element.addEventListener('click', hideYourIdModal))
	document.querySelectorAll('.action.leaderboard').forEach(element => element.addEventListener('click', showLeaderboardModal))
	document.querySelectorAll('.close-leaderboard').forEach(element => element.addEventListener('click', hideLeaderboardModal))
	document.querySelectorAll('.action.settings').forEach(element => element.addEventListener('click', showSettingsModal))
	document.querySelectorAll('.close-settings').forEach(element => element.addEventListener('click', hideSettingsModal))
	document.querySelectorAll('.close-transaction').forEach(element => element.addEventListener('click', hideTransactionModal))
	document.querySelectorAll('.close-invoice').forEach(element => element.addEventListener('click', hideInvoiceModal))
})