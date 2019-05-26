import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import * as moment from 'moment'

const db = admin.database()

export const users = functions.https.onRequest((_req, res) =>
	db.ref('users').once('value', snapshot => {
		const val = snapshot.val()
		return res.status(200).send(Object.keys(val).map(key => {
			const userData = val[key]
			return { id: key, name: userData.name, email: userData.email, balance: userData.balance }
		}))
	})
)

export const transact = functions.https.onRequest((req, res) => {
	const pin = req.query.pin
	if (pin) {
		const from = req.query.from
		if (from) {
			const to = req.query.to
			return to
				? db.ref(`users/${from}/balance`).once('value', fromSnapshot => {
					if (fromSnapshot.exists()) {
						const amount = parseFloat(req.query.amount)
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

export const user = functions.https.onRequest((req, res) => {
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

export const transactions = functions.https.onRequest((req, res) => {
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