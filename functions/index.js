const functions = require('firebase-functions')
const admin = require('firebase-admin')
const request = require('request')
admin.initializeApp()

exports.tableOrderCreated = functions.database.ref('users/{uid}/bazaarTableOrders/{bazaarTableOrder}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent.parent
	const to = 'SEC'
	const tableOfOrder = snapshot.val().table
	const payerName = snapshot.val().username
	return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
		const from = context.params.uid
		const amount = snapshot.val().amount
		const toBalance = balanceSnapshot.val() + amount / 2
		return Promise.all([
			root.child(`bazaarData/bazaarTables/${tableOfOrder}/owner`).set(from),
			root.child(`users/${to}/bazaarTableOrders/${context.params.transactionId}`).set({time: snapshot.val().time, from: from, amount: amount, balance: toBalance}),
			root.child(`users/${from}/balance`).set(snapshot.val().balance),
			root.child(`users/${to}/balance`).set(toBalance)
		])
	})
})

exports.transactionCreated = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent.parent
	const from = context.params.uid
	const to = snapshot.val().to
	const amount = snapshot.val().amount

	if (typeof amount === 'string') {
		return Promise.all([
			root.child(`users/${to}/independence`).set(parseInt(amount, 10)),
			snapshot.ref.remove()
		])
	} else {
		return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
			const toBalance = balanceSnapshot.val() + amount / 2
			return root.child(`cards/${from}`).once('value').then(userSnapshot => {
				if (userSnapshot.exists()) {
					const userId = userSnapshot.val()
					return Promise.all([
						root.child(`transactions/${to}/${context.params.transactionId}`).set({ time: snapshot.val().time, from: userSnapshot.val(), to: to, amount: amount, balance: toBalance, message: snapshot.val().message }),
						root.child(`users/${userSnapshot.val()}/balance`).set(snapshot.val().balance),
						root.child(`users/${to}/balance`).set(toBalance)
					])
				} else {
					if (to == 'ATM_Convert') {
						request({
							method: 'POST',
							uri: 'https://io.adafruit.com/api/v2/esadun/feeds/servofeed/data',
							body: { value: amount },
							json: true,
							headers: { 'X-AIO-Key': '26e90ad8e7a5411095f5dd18618265eb' }
						})
					}
					return Promise.all([
						root.child(`transactions/${to}/${context.params.transactionId}`).set({ time: snapshot.val().time, from: from, to: to, amount: amount, balance: toBalance, message: snapshot.val().message }),
						root.child(`users/${from}/balance`).set(snapshot.val().balance),
						root.child(`users/${to}/balance`).set(toBalance)
					])
				}
			})
		})
	}
})

exports.pendingCreated = functions.database.ref('pending/{pendingId}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent
	return root.child(`cards/${snapshot.val().from}`).once('value').then(cardSnapshot => {
		return root.child(`users/${cardSnapshot.val()}/balance`).once('value').then(balanceSnapshot => {
			return root.child(`users/${cardSnapshot.val()}/cards/${snapshot.val().from}/pin`).once('value').then(pinSnapshot => {
				if (snapshot.val().amount <= balanceSnapshot.val() && snapshot.val().pin === pinSnapshot.val()) {
					return Promise.all([
						root.child(`transactions/${snapshot.val().from}/${context.params.pendingId}`).set({ time: snapshot.val().time, from: snapshot.val().from, to: snapshot.val().to, amount: snapshot.val().amount, balance: balanceSnapshot.val() - snapshot.val().amount, message: '' }),
						snapshot.ref.remove()
					])
				}
			})
		})
	})
})

exports.userCreated = functions.database.ref('users/{uid}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent
	const uid = context.params.uid
	const name = snapshot.val().name
	return Promise.all([
		root.child(`companies/${uid}`).set({ industry: 'Unspecified', name: `${name}'s Company`, pv: 0, logo: '' }),
		root.child(`companies/${uid}/products`).push({ name: `${name}'s First Product`, inStock: true, cost: 1 }),
		root.child(`users/${uid}/independence`).set(0),
		root.child('cards').push(uid)
	])
})

exports.cardCreated = functions.database.ref('cards/{cardId}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent

	return Promise.all([
		root.child(`users/${snapshot.val()}/cards/${context.params.cardId}/name`).set("Debit Card"),
		root.child(`users/${snapshot.val()}/cards/${context.params.cardId}/pin`).set(""+Math.floor(Math.random()*9)+Math.floor(Math.random()*9)+Math.floor(Math.random()*9)+Math.floor(Math.random()*9))
	])
})
