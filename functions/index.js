const functions = require('firebase-functions')
require('firebase-admin').initializeApp()

exports.tableOrderCreated = functions.database.ref('users/{uid}/bazaarTableOrders/{tableOrder}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent.parent.parent
	const from = context.params.uid
	const amount = snapshot.val().amount
	const table = snapshot.val().table
	return root.child(`users/${from}/balance`).once('value').then(balanceSnapshot =>
		Promise.all([
			root.child(`bazaarData/bazaarTables/${table}/owner`).set(from),
			root.child(`transactions/${from}/${context.params.tableOrder}`).set({ time: snapshot.val().time, from: from, to: 'SEC', amount: amount, balance: balanceSnapshot.val() - amount, message: `Purchased table ${table} for ${amount} Astras` })
		])
	)
})

exports.transactionCreated = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent.parent
	const to = snapshot.val().to
	const amount = snapshot.val().amount
	if (typeof amount === 'string') {
		return Promise.all([
			root.child(`users/${to}/independence`).set(parseInt(amount)),
			snapshot.ref.remove()
		])
	} else {
		return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
			const from = context.params.uid
			return root.child(`cards/${from}`).once('value').then(cardSnapshot => {
				const toBalance = balanceSnapshot.val() + amount / 2
				const newFrom = cardSnapshot.exists() ? cardSnapshot.val() : from
				return Promise.all([
					root.child(`transactions/${to}/${context.params.transactionId}`).set({ time: snapshot.val().time, from: newFrom, to: to, amount: amount, balance: toBalance, message: snapshot.val().message }),
					root.child(`users/${newFrom}/balance`).set(snapshot.val().balance),
					root.child(`users/${to}/balance`).set(toBalance)
				])
			})
		})
	}
})

exports.pendingCreated = functions.database.ref('pending/{pendingId}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent
	const from = snapshot.val().from
	return root.child(`cards/${from}`).once('value').then(cardSnapshot => {
		const userId = cardSnapshot.val()
		return root.child(`users/${userId}/balance`).once('value').then(balanceSnapshot =>
			root.child(`users/${userId}/cards/${from}`).once('value').then(cardSnapshot => {
				const amount = snapshot.val().amount
				const balance = balanceSnapshot.val()
				const pin = cardSnapshot.val().pin
				if (amount <= balance && snapshot.val().pin === pin) {
					return Promise.all([
						root.child(`transactions/${from}/${context.params.pendingId}`).set({ time: snapshot.val().time, from: from, to: snapshot.val().to, amount: amount, balance: balance - amount, message: `Paid with ${cardSnapshot.val().name}` }),
						snapshot.ref.remove()
					])
				} else {
					return snapshot.ref.remove()
				}
			})
		)
	})
})

exports.userCreated = functions.database.ref('users/{uid}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent
	const uid = context.params.uid
	const name = snapshot.val().name
	return Promise.all([
		root.child(`companies/${uid}`).set({ industry: 'Unspecified', name: `${name}'s Company`, pv: 0, logo: '' }),
		root.child(`companies/${uid}/products`).push({ name: `${name}'s First Product`, inStock: false, cost: 1 }),
		root.child(`users/${uid}/independence`).set(0),
		root.child('cards').push(uid)
	])
})

exports.cardCreated = functions.database.ref('cards/{cardId}').onCreate((snapshot, context) =>
	snapshot.ref.parent.parent.child(`users/${snapshot.val()}/cards/${context.params.cardId}`).set({ name: 'Debit Card', pin: (Math.floor(Math.random() * 10000) + 10000).toString().substring(1) })
)