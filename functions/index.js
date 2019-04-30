const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const app = require('express')()
const moment = require('moment')
const db = admin.database()

app.get('/companies/:slug', (req, res) =>
	db.ref(`slugs/companies/${req.params.slug}`).on('value', snapshot =>
		db.ref(`companies/${snapshot.val()}`).on('value', companySnapshot => {
			if (companySnapshot.exists()) {
				const val = companySnapshot.val()
				const image = val.image ? val.image : '/images/astra.png'
				return db.ref(`users/${val.owner}`).on('value', userSnapshot => {
					const userVal = userSnapshot.val()
					return res.status(200).send(`
						<!DOCTYPE html>
						<html>
							<head>
								<meta charset="utf-8">
								<meta name="viewport" content="width=device-width, initial-scale=1">
								<script defer src="/__/firebase/5.9.4/firebase-app.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-auth.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-database.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-messaging.js"></script>
								<script defer src="/__/firebase/5.9.4/firebase-storage.js"></script>
								<script defer src="/__/firebase/init.js"></script>
								<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css">
								<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
								<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
								<link rel="stylesheet" href="/css/navbar.css">
								<link rel="stylesheet" href="/css/company.css">
								<link rel="icon" type="image/png" href="${image}">
								<title>${val.name} - Astra Exchange</title>
							</head>
							<body>
								<img src="${image}" alt="Company image">
								<br>
								<h1>${val.name}</h1>
								<br>
								<h2>${userVal.name}</h2>
								<br>
								<p>${val.description}</p>
								<script src="/js/company.js"></script>
							</body>
						</html>
					`)
				})
			} else return res.status(404).send(`
				<!DOCTYPE html>
				<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
						<title>404 - Astra Exchange</title>
						<style>
							body {
								background: #ECEFF1;
								color: rgba(0,0,0,0.87);
								font-family: Roboto, Helvetica, Arial, sans-serif;
								margin: 0;
								padding: 0;
							}
							#message {
								background: white;
								max-width: 360px;
								margin: 100px auto 16px;
								padding: 32px 24px 16px;
								border-radius: 3px;
							}
							#message h3 {
								color: #888;
								font-weight: normal;
								font-size: 16px;
								margin: 16px 0 12px;
							}
							#message h2 {
								color: #ffa100;
								font-weight: bold;
								font-size: 16px;
								margin: 0 0 8px;
							}
							#message h1 {
								font-size: 22px;
								font-weight: 300;
								color: rgba(0,0,0,0.6);
								margin: 0 0 16px;
							}
							#message p {
								line-height: 140%;
								margin: 16px 0 24px;
								font-size: 14px;
							}
							#message a {
								display: block;
								text-align: center;
								background: #039be5;
								text-transform: uppercase;
								text-decoration: none;
								color: white;
								padding: 16px;
								border-radius: 4px;
							}
							#message, #message a {
								box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
							}
							#load {
								color: rgba(0,0,0,0.4);
								text-align: center;
								font-size: 13px;
							}
							@media (max-width: 600px) {
								body, #message {
									margin-top: 0;
									background: white;
									box-shadow: none;
								}
								body {
									border-top: 16px solid #ffa100;
								}
							}
						</style>
					</head>
					<body>
						<div id="message">
							<h2>404</h2>
							<h1>No company with URL ${req.url}</h1>
							<a href="/companies">Back to companies</a>
						</div>
					</body>
				</html>
			`)
		})
	)
)

exports.app = functions.https.onRequest(app)

exports.tableOrderCreated = functions.database.ref('users/{uid}/bazaarTableOrders/{tableOrder}').onCreate((snapshot, context) => {
	const from = context.params.uid
	const amount = snapshot.val().amount
	const table = snapshot.val().table
	return db.ref(`users/${from}/balance`).once('value').then(balanceSnapshot =>
		Promise.all([
			db.ref(`bazaarData/bazaarTables/${table}/owner`).set(from),
			db.ref(`transactions/${from}/${context.params.tableOrder}`).set({ time: snapshot.val().time, from: from, to: 'SEC', amount: amount, balance: balanceSnapshot.val() - amount, message: `Purchased table ${table} for ${amount} Astras` })
		])
	)
})

exports.transactionCreated = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
	const to = snapshot.val().to
	const amount = snapshot.val().amount
	if (typeof amount === 'string') {
		return Promise.all([
			db.ref(`users/${to}/independence`).set(parseInt(amount)),
			snapshot.ref.remove()
		])
	} else {
		return db.ref(`users/${to}/balance`).once('value').then(balanceSnapshot => {
			const from = snapshot.val().from
			return db.ref(`cards/${from}`).once('value').then(cardSnapshot => {
				const toBalance = balanceSnapshot.val() + amount
				const newFrom = cardSnapshot.exists() ? cardSnapshot.val() : from
				if (context.params.uid === from) {
					return Promise.all([
						db.ref(`transactions/${to}/${context.params.transactionId}`).set({ time: snapshot.val().time, from: newFrom, to: to, amount: amount, balance: toBalance, message: snapshot.val().message }),
						db.ref(`users/${newFrom}/balance`).set(snapshot.val().balance),
					])
				} else {
					return db.ref(`users/${to}/balance`).set(toBalance)
				}
			})
		})
	}
})

exports.pendingCreated = functions.database.ref('pending/{pendingId}').onCreate((snapshot, context) => {
	const from = snapshot.val().from
	return db.ref(`cards/${from}`).once('value').then(cardSnapshot => {
		const userId = cardSnapshot.val()
		return db.ref(`users/${userId}/balance`).once('value').then(balanceSnapshot =>
			db.ref(`users/${userId}/cards/${from}`).once('value').then(cardSnapshot => {
				const amount = snapshot.val().amount
				const balance = balanceSnapshot.val()
				const pin = cardSnapshot.val().pin
				if (amount <= balance && snapshot.val().pin === pin) {
					return Promise.all([
						db.ref(`transactions/${from}/${context.params.pendingId}`).set({ time: snapshot.val().time, from: from, to: snapshot.val().to, amount: amount, balance: balance - amount, message: `Paid with ${cardSnapshot.val().name}` }),
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
	const uid = context.params.uid
	return Promise.all([
		db.ref(`users/${uid}/independence`).set(0),
		db.ref(`emails/${snapshot.val().email.replace('.', '%2e')}`).set(uid),
		db.ref('cards').push(uid)
	])
})

exports.cardCreated = functions.database.ref('cards/{cardId}').onCreate((snapshot, context) =>
	db.ref(`users/${snapshot.val()}/cards/${context.params.cardId}`).set({ name: 'Debit Card', pin: (Math.floor(Math.random() * 10000) + 10000).toString().substring(1) })
)

exports.companyCreated = functions.database.ref('companies/{companyId}').onCreate((snapshot, context) =>
	db.ref(`slugs/companies/${snapshot.val().name.trim().replace(/\s+/g, '-').toLowerCase()}`).set(context.params.companyId)
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

exports.transact = functions.https.onRequest((req, res) => {
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
										if (pin === cardSnapshot.val().pin) {
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
							return res.status(403).send('Insufficient balance')
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

exports.user = functions.https.onRequest((req, res) => {
	const id = req.query.id
	if (id) {
		return db.ref(`users/${id}`).once('value', snapshot => {
			if (snapshot.exists()) {
				const val = snapshot.val()
				const pin = req.query.pin
				if (pin) {
					return db.ref(`users/${id}/cards`).once('child_added', cardSnapshot => {
						if (pin === cardSnapshot.val().pin) {
							return res.status(200).send({ id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, pin: pin })
						} else {
							return res.status(401).send(`Invalid pin for user ${id}`)
						}
					})
				} else {
					return res.status(200).send({ id: id, name: val.name, email: val.email, balance: val.balance })
				}
			} else {
				return res.status(404).send(`No user with ID ${id}`)
			}
		})
	} else {
		const email = req.query.email
		if (email) {
			return db.ref(`emails/${email.replace('.', '%2e')}`).once('value', emailSnapshot => {
				if (emailSnapshot.exists()) {
					const userId = emailSnapshot.val()
					return db.ref(`users/${userId}`).once('value', userSnapshot => {
						const val = userSnapshot.val()
						const pin = req.query.pin
						if (pin) {
							return db.ref(`users/${userId}/cards`).once('child_added', cardSnapshot => {
								if (pin === cardSnapshot.val().pin) {
									return res.status(200).send({ id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, pin: pin })
								} else {
									return res.status(401).send(`Invalid pin for user ${userId}`)
								}
							})
						} else {
							return res.status(200).send({ id: id, name: val.name, email: val.email, balance: val.balance })
						}
					})
				} else {
					return res.status(404).send(`No user with email ${email}`)
				}
			})
		} else {
			return res.status(400).send('Must specify the user ID or email')
		}
	}
})

exports.transactions = functions.https.onRequest((req, res) => {
	const pin = req.query.pin
	if (pin) {
		const id = req.query.id
		if (id) {
			return db.ref(`users/${id}`).once('value', userSnapshot => {
				if (userSnapshot.exists()) {
					return db.ref(`users/${id}/cards`).once('child_added', cardSnapshot => {
						if (pin === cardSnapshot.val().pin) {
							return db.ref(`transactions/${id}`).once('value', transactionsSnapshot => {
								const val = transactionsSnapshot.val()
								return res.status(200).send(Object.keys(val).map(key => {
									const transaction = val[key]
									return { id: key, time: transaction.time, from: transaction.from, to: transaction.to, amount: transaction.amount, balance: transaction.balance, message: transaction.message }
								}))
							})
						} else {
							return res.status(401).send(`Invalid pin for user ${id}`)
						}
					})
				} else {
					return res.status(404).send(`No user with ID ${id}`)
				}
			})
		} else {
			return res.status(400).send('Must specify the user ID')
		}
	} else {
		return res.status(400).send('Must specify the pin')
	}
})