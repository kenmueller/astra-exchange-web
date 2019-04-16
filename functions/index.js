const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const moment = require('moment')
const db = admin.database()

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
			const from = snapshot.val().from
			return root.child(`cards/${from}`).once('value').then(cardSnapshot => {
				const toBalance = balanceSnapshot.val() + amount
				const newFrom = cardSnapshot.exists() ? cardSnapshot.val() : from
				if (context.params.uid === from) {
					return Promise.all([
						root.child(`transactions/${to}/${context.params.transactionId}`).set({ time: snapshot.val().time, from: newFrom, to: to, amount: amount, balance: toBalance, message: snapshot.val().message }),
						root.child(`users/${newFrom}/balance`).set(snapshot.val().balance),
					])
				} else {
					return Promise.all([
						root.child(`users/${to}/balance`).set(toBalance)
					])
				}
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

exports.users = functions.https.onRequest((_req, res) =>
	db.ref('users').once('value', snapshot => {
		const val = snapshot.val()
		return res.status(200).send(Object.keys(val).map(key => {
			const user = val[key]
			return { id: key, name: user.name, email: user.email, balance: user.balance }
		}))
	})
)

exports.transaction = functions.https.onRequest((req, res) => {
	const pin = req.query.pin
	if (pin) {
		const from = req.query.from
		if (from) {
			const to = req.query.to
			if (to) {
				return db.ref(`users/${from}/balance`).once('value', fromSnapshot => {
					if (fromSnapshot.exists()) {
						const amount = parseInt(req.query.amount)
						const balance = fromSnapshot.val()
						if (amount <= balance) {
							return db.ref(`users/${to}`).once('value', toSnapshot => {
								if (toSnapshot.exists()) {
									const message = req.query.message
									return db.ref(`users/${from}/cards`).once('child_added', cardSnapshot => {
										if (req.query.pin === cardSnapshot.val().pin) {
											const dateList = moment().format('lll').split(' ')
											dateList.splice(3, 0, '@')
											return db.ref(`transactions/${from}`).push({ time: dateList.join(' '), from: from, to: to, amount: amount, balance: balance - amount, message: message ? message : '' }, error => {
												if (error) {
													return res.status(500).send(`Error creating transaction. ${error}`)
												} else {
													return res.status(200).send('Successfully created transaction')
												}
											})
										} else {
											return res.status(401).send(`Invalid pin for user ${from}`)
										}
									})
								} else {
									return res.status(404).send(`No user with ID ${to}`)
								}
							})
						} else {
							return res.status(403).send(`Insufficient balance`)
						}
					} else {
						return res.status(404).send(`No user with ID ${from}`)
					}
				})
			} else {
				return res.status(400).send('Must specify the to ID')
			}
		} else {
			return res.status(400).send('Must specify the from ID')
		}
	} else {
		return res.status(400).send('Must specify the pin')
	}
})

exports