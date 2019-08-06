import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as moment from 'moment'

const db = admin.database()

export const users = functions.https.onRequest((_req, res) =>
	db.ref('users').once('value').then(snapshot => {
		const val = snapshot.val()
		return res.status(200).send(Object.keys(val).map(key => {
			const userData = val[key]
			return { id: key, name: userData.name, email: userData.email, balance: userData.balance, reputation: userData.reputation }
		}))
	})
)

export const transact = functions.https.onRequest((req, res) => {
	const pin: string | undefined = req.query.pin
	if (!pin) return res.status(400).send('Must specify the pin')
	const from: string | undefined = req.query.from
	if (!from) return res.status(400).send('Must specify the from ID')
	const to: string | undefined = req.query.to
	return to
		? db.ref(`users/${from}/balance`).once('value').then(fromSnapshot => {
			if (!fromSnapshot.exists()) return res.status(404).send(`No user with ID ${from}`)
			const amount = parseFloat(req.query.amount)
			const balance: number = fromSnapshot.val() || 0
			return amount <= balance
				? db.ref(`users/${to}`).once('value').then(toSnapshot => {
					if (!toSnapshot.exists()) return res.status(404).send(`No user with ID ${to}`)
					const message = req.query.message
					return db.ref(`users/${from}/cards`).once('child_added').then(cardSnapshot => {
						if (pin !== cardSnapshot.val().pin) return res.status(401).send(`Invalid pin for user ${from}`)
						const dateList = moment().format('lll').split(' ')
						dateList.splice(3, 0, '@')
						return db.ref(`transactions/${from}`).push({
							time: dateList.join(' '),
							from,
							to,
							amount,
							balance: balance - amount,
							message: message || ''
						}).then(() =>
							res.status(200).send('Successfully created transaction')
						).catch(reason =>
							res.status(500).send(`Error creating transaction. ${reason}`)
						)
					})
				})
				: res.status(403).send('Insufficient balance')
		})
		: res.status(400).send('Must specify the to ID')
})

export const user = functions.https.onRequest((req, res) => {
	const id = req.query.id
	if (id)
		return db.ref(`users/${id}`).once('value').then(snapshot => {
			if (!snapshot.exists()) return res.status(404).send(`No user with ID ${id}`)
			const val = snapshot.val()
			const pin: string | undefined = req.query.pin
			const publicData = { id, name: val.name, email: val.email, balance: val.balance, reputation: val.reputation }
			return pin
				? db.ref(`users/${id}/cards`).once('child_added').then(cardSnapshot =>
					pin === cardSnapshot.val().pin
						? res.status(200).send(Object.assign(publicData, { pin }))
						: res.status(401).send(`Invalid pin for user ${id}`)
				)
				: res.status(200).send(publicData)
		})
	else {
		const email: string | undefined = req.query.email
		return email
			? db.ref(`emails/${email.replace('.', '%2e')}`).once('value').then(emailSnapshot => {
				if (!emailSnapshot.exists()) return res.status(404).send(`No user with email ${email}`)
					const userId: string = emailSnapshot.val() || ''
					return db.ref(`users/${userId}`).once('value').then(userSnapshot => {
						const val = userSnapshot.val()
						const pin: string | undefined = req.query.pin
						const publicData = { id: userId, name: val.name, email: val.email, balance: val.balance, reputation: val.reputation }
						return pin
							? db.ref(`users/${userId}/cards`).once('child_added', cardSnapshot =>
								pin === cardSnapshot.val().pin
									? res.status(200).send(Object.assign(publicData, { pin }))
									: res.status(401).send(`Invalid pin for user ${userId}`)
							)
							: res.status(200).send(publicData) as any
					})
			})
			: res.status(400).send('Must specify the user ID or email')
	}
})

export const transactions = functions.https.onRequest((req, res) => {
	const pin: string | undefined = req.query.pin
	if (!pin) return res.status(400).send('Must specify the pin')
	const id: string | undefined = req.query.id
	return id
		? db.ref(`users/${id}`).once('value').then(userSnapshot =>
			userSnapshot.exists()
				? db.ref(`users/${id}/cards`).once('child_added').then(cardSnapshot =>
					pin === cardSnapshot.val().pin
						? db.ref(`transactions/${id}`).once('value').then(transactionsSnapshot => {
							const val = transactionsSnapshot.val()
							return res.status(200).send(Object.keys(val).map(key => {
								const transaction = val[key]
								return {
									id: key,
									time: transaction.time,
									from: transaction.from,
									to: transaction.to,
									amount: transaction.amount,
									balance: transaction.balance,
									message: transaction.message
								}
							}))
						})
						: res.status(401).send(`Invalid pin for user ${id}`)
				)
				: res.status(404).send(`No user with ID ${id}`)
		)
		: res.status(400).send('Must specify the user ID')
})