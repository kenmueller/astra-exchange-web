const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const app = require('express')()
const moment = require('moment')
const db = admin.database()

app.get('/users/:slug', (req, res) =>
	db.ref(`slugs/users/${req.params.slug}`).on('value', snapshot =>
		db.ref(`users/${snapshot.val()}`).on('value', userSnapshot => {
			if (userSnapshot.exists()) {
				const val = userSnapshot.val()
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
							<link rel="stylesheet" href="/css/user.css">
							<link rel="icon" type="image/png" href="/images/astra.png">
							<title>${val.name} - Astra Exchange</title>
						</head>
						<body>
							<nav class="navbar" role="navigation" aria-label="main navigation">
								<div class="navbar-brand">
									<a class="navbar-item" href="/"><img src="/images/astra.png" width="28" height="28"></a>
									<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
										<span aria-hidden="true"></span>
										<span aria-hidden="true"></span>
										<span aria-hidden="true"></span>
									</a>
								</div>
								<div id="navbar" class="navbar-menu">
									<div class="navbar-start">
										<a class="navbar-item" href="/companies">Companies</a>
										<a class="navbar-item" href="/documentation">API Documentation</a>
										<div class="navbar-item has-dropdown is-hoverable">
											<a class="navbar-link">iOS Apps</a>
											<div class="navbar-dropdown">
												<a class="navbar-item" href="itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist">Astra Exchange</a>
												<a class="navbar-item" onclick="alert('Coming soon!')">Notes Exchange</a>
											</div>
										</div>
									</div>
									<div class="navbar-end">
										<div class="navbar-item">
											<a class="button is-primary auth sign-up is-hidden">Sign up</a>
											<a class="button is-info auth sign-in is-hidden">Sign in</a>
											<div class="navbar-item has-dropdown is-hoverable auth user-dropdown is-hidden">
												<a class="navbar-link auth user-link"></a>
												<div class="navbar-dropdown">
													<a class="navbar-item action settings">Settings</a>
													<hr class="navbar-divider">
													<a class="navbar-item auth sign-out">Sign out</a>
												</div>
											</div>
										</div>
									</div>
								</div>
							</nav>
							<div class="modal settings">
								<div class="modal-background close-settings"></div>
								<div class="modal-card">
									<header class="modal-card-head">
										<p class="modal-card-title">Settings</p>
										<button class="delete close-settings" aria-label="close"></button>
									</header>
									<section class="modal-card-body">
										<div class="field">
											<label class="label">Name</label>
											<p class="settings name"></p>
										</div>
										<div class="field">
											<label class="label">Email</label>
											<p class="settings email"></p>
										</div>
										<div class="field">
											<label class="label">Balance</label>
											<p class="settings balance"></p>
										</div>
										<div class="field">
											<label class="label">Independence</label>
											<p class="settings independence"></p>
										</div>
										<div class="field">
											<label class="label">Pin</label>
											<p class="settings pin">...</p>
										</div>
									</section>
									<footer class="modal-card-foot">
										<a class="button is-primary password-reset"><strong>Send a password reset email</strong></a>
									</footer>
								</div> 
							</div>
							<h1>Name: ${val.name}</h1>
							<br>
							<h2>Email: ${val.email}</h2>
							<br>
							<p>Balance: ${val.balance}</p>
							<script src="/js/company.js"></script>
							<script src="/js/base.js"></script>
							<script>
								user({ id: '${val.key}', name: '${val.name}', email: '${val.email}', balance: '${val.balance}' })
							</script>
						</body>
					</html>
				`)
			} else return res.status(404).redirect('/users')
		})
	)
)

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
								<nav class="navbar" role="navigation" aria-label="main navigation">
									<div class="navbar-brand">
										<a class="navbar-item" href="/"><img src="/images/astra.png" width="28" height="28"></a>
										<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
											<span aria-hidden="true"></span>
											<span aria-hidden="true"></span>
											<span aria-hidden="true"></span>
										</a>
									</div>
									<div id="navbar" class="navbar-menu">
										<div class="navbar-start">
											<a class="navbar-item" href="/companies">Companies</a>
											<a class="navbar-item" href="/documentation">API Documentation</a>
											<div class="navbar-item has-dropdown is-hoverable">
												<a class="navbar-link">iOS Apps</a>
												<div class="navbar-dropdown">
													<a class="navbar-item" href="itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist">Astra Exchange</a>
													<a class="navbar-item" onclick="alert('Coming soon!')">Notes Exchange</a>
												</div>
											</div>
										</div>
										<div class="navbar-end">
											<div class="navbar-item">
												<a class="button is-primary auth sign-up is-hidden">Sign up</a>
												<a class="button is-info auth sign-in is-hidden">Sign in</a>
												<div class="navbar-item has-dropdown is-hoverable auth user-dropdown is-hidden">
													<a class="navbar-link auth user-link"></a>
													<div class="navbar-dropdown">
														<a class="navbar-item action settings">Settings</a>
														<hr class="navbar-divider">
														<a class="navbar-item auth sign-out">Sign out</a>
													</div>
												</div>
											</div>
										</div>
									</div>
								</nav>
								<div class="modal settings">
									<div class="modal-background close-settings"></div>
									<div class="modal-card">
										<header class="modal-card-head">
											<p class="modal-card-title">Settings</p>
											<button class="delete close-settings" aria-label="close"></button>
										</header>
										<section class="modal-card-body">
											<div class="field">
												<label class="label">Name</label>
												<p class="settings name"></p>
											</div>
											<div class="field">
												<label class="label">Email</label>
												<p class="settings email"></p>
											</div>
											<div class="field">
												<label class="label">Balance</label>
												<p class="settings balance"></p>
											</div>
											<div class="field">
												<label class="label">Independence</label>
												<p class="settings independence"></p>
											</div>
											<div class="field">
												<label class="label">Pin</label>
												<p class="settings pin">...</p>
											</div>
										</section>
										<footer class="modal-card-foot">
											<a class="button is-primary password-reset"><strong>Send a password reset email</strong></a>
										</footer>
									</div> 
								</div>
								<img src="${image}" alt="Company image">
								<br>
								<h1>${val.name}</h1>
								<br>
								<h2>${userVal.name}</h2>
								<br>
								<p>${val.description}</p>
								<script src="/js/company.js"></script>
								<script src="/js/base.js"></script>
								<script>
									company({ id: '${companySnapshot.key}', image: '${image}', name: '${val.name}', owner: { id: '${userSnapshot.key}', name: '${userVal.name}', email: '${userVal.email}', balance: ${userVal.balance} }, description: '${val.description}', products: [] })
								</script>
							</body>
						</html>
					`)
				})
			} else return res.status(404).redirect('/companies')
		})
	)
)

exports.app = functions.https.onRequest(app)

exports.transactionCreated = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
	const to = snapshot.val().to
	const amount = snapshot.val().amount
	return typeof amount === 'string'
		? Promise.all([
			db.ref(`users/${to}/independence`).set(parseInt(amount)),
			snapshot.ref.remove()
		])
		: db.ref(`users/${to}/balance`).once('value').then(balanceSnapshot => {
			const from = snapshot.val().from
			return db.ref(`cards/${from}`).once('value').then(cardSnapshot => {
				const toBalance = balanceSnapshot.val() + amount
				const newFrom = cardSnapshot.exists() ? cardSnapshot.val() : from
				return context.params.uid === from
					? Promise.all([
						db.ref(`transactions/${to}/${context.params.transactionId}`).set({ time: snapshot.val().time, from: newFrom, to: to, amount: amount, balance: toBalance, message: snapshot.val().message }),
						db.ref(`users/${newFrom}/balance`).set(snapshot.val().balance),
					])
					: db.ref(`users/${to}/balance`).set(toBalance)
			})
		})
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
				return amount <= balance && snapshot.val().pin === pin
					? Promise.all([
						db.ref(`transactions/${from}/${context.params.pendingId}`).set({ time: snapshot.val().time, from: from, to: snapshot.val().to, amount: amount, balance: balance - amount, message: `Paid with ${cardSnapshot.val().name}` }),
						snapshot.ref.remove()
					])
					: snapshot.ref.remove()
			})
		)
	})
})

exports.userCreated = functions.database.ref('users/{uid}').onCreate((snapshot, context) => {
	const uid = context.params.uid
	const val = snapshot.val()
	return Promise.all([
		db.ref(`users/${uid}/independence`).set(0),
		db.ref(`emails/${val.email.replace('.', '%2e')}`).set(uid),
		db.ref(`slugs/users/${val.name.trim().replace(/\s+/g, '-').toLowerCase()}`).set(uid),
		db.ref('cards').push(uid)
	])
})

exports.cardCreated = functions.database.ref('cards/{cardId}').onCreate((snapshot, context) =>
	db.ref(`users/${snapshot.val()}/cards/${context.params.cardId}`).set({ name: 'Debit Card', pin: (Math.floor(Math.random() * 10000) + 10000).toString().substring(1) })
)

exports.companyCreated = functions.database.ref('companies/{companyId}').onCreate((snapshot, context) => {
	const companyId = context.params.companyId
	const val = snapshot.val()
	return Promise.all([
		db.ref(`slugs/companies/${val.name.trim().replace(/\s+/g, '-').toLowerCase()}`).set(companyId),
		db.ref(`owners/companies/${val.owner}/${companyId}`).set(true)
	])
})

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
			return to
				? db.ref(`users/${from}/balance`).once('value', fromSnapshot => {
					if (fromSnapshot.exists()) {
						const amount = parseInt(req.query.amount)
						const balance = fromSnapshot.val()
						return amount <= balance
							? db.ref(`users/${to}`).once('value', toSnapshot => {
								if (toSnapshot.exists()) {
									const message = req.query.message
									return db.ref(`users/${from}/cards`).once('child_added', cardSnapshot => {
										if (pin === cardSnapshot.val().pin) {
											const dateList = moment().format('lll').split(' ')
											dateList.splice(3, 0, '@')
											return db.ref(`transactions/${from}`).push({ time: dateList.join(' '), from: from, to: to, amount: amount, balance: balance - amount, message: message ? message : '' }, error =>
												error ? res.status(500).send(`Error creating transaction. ${error}`) : res.status(200).send('Successfully created transaction')
											)
										} else return res.status(401).send(`Invalid pin for user ${from}`)
									})
								} else return res.status(404).send(`No user with ID ${to}`)
							})
							: res.status(403).send('Insufficient balance')
					} else return res.status(404).send(`No user with ID ${from}`)
				})
				: res.status(400).send('Must specify the to ID')
		} else return res.status(400).send('Must specify the from ID')
	} else return res.status(400).send('Must specify the pin')
})

exports.user = functions.https.onRequest((req, res) => {
	const id = req.query.id
	if (id)
		return db.ref(`users/${id}`).once('value', snapshot => {
			if (snapshot.exists()) {
				const val = snapshot.val()
				const pin = req.query.pin
				return pin
					? db.ref(`users/${id}/cards`).once('child_added', cardSnapshot =>
						pin === cardSnapshot.val().pin
							? res.status(200).send({ id: id, name: val.name, email: val.email, balance: val.balance, independence: val.independence, pin: pin })
							: res.status(401).send(`Invalid pin for user ${id}`)
					)
					: res.status(200).send({ id: id, name: val.name, email: val.email, balance: val.balance })
			} else return res.status(404).send(`No user with ID ${id}`)
		})
	else {
		const email = req.query.email
		return email
			? db.ref(`emails/${email.replace('.', '%2e')}`).once('value', emailSnapshot => {
				if (emailSnapshot.exists()) {
					const userId = emailSnapshot.val()
					return db.ref(`users/${userId}`).once('value', userSnapshot => {
						const val = userSnapshot.val()
						const pin = req.query.pin
						return pin
							? db.ref(`users/${userId}/cards`).once('child_added', cardSnapshot =>
								pin === cardSnapshot.val().pin
									? res.status(200).send({ id: userId, name: val.name, email: val.email, balance: val.balance, independence: val.independence, pin: pin })
									: res.status(401).send(`Invalid pin for user ${userId}`)
							)
							: res.status(200).send({ id: userId, name: val.name, email: val.email, balance: val.balance })
					})
				} else return res.status(404).send(`No user with email ${email}`)
			})
			: res.status(400).send('Must specify the user ID or email')
	}
})

exports.transactions = functions.https.onRequest((req, res) => {
	const pin = req.query.pin
	if (pin) {
		const id = req.query.id
		return id
			? db.ref(`users/${id}`).once('value', userSnapshot =>
				userSnapshot.exists()
					? db.ref(`users/${id}/cards`).once('child_added', cardSnapshot =>
						pin === cardSnapshot.val().pin
							? db.ref(`transactions/${id}`).once('value', transactionsSnapshot => {
								const val = transactionsSnapshot.val()
								return res.status(200).send(Object.keys(val).map(key => {
									const transaction = val[key]
									return { id: key, time: transaction.time, from: transaction.from, to: transaction.to, amount: transaction.amount, balance: transaction.balance, message: transaction.message }
								}))
							})
							: res.status(401).send(`Invalid pin for user ${id}`)
					)
					: res.status(404).send(`No user with ID ${id}`)
			)
			: res.status(400).send('Must specify the user ID')
	} else return res.status(400).send('Must specify the pin')
})