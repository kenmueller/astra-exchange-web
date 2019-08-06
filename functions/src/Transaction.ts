import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.database()

export const transactionCreated = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
	const to: string = snapshot.val().to || ''
	const amount: number = snapshot.val().amount || 0
	return typeof amount === 'string'
		? Promise.all([
			db.ref(`users/${to}/independence`).set(parseInt(amount)),
			snapshot.ref.remove()
		])
		: db.ref(`users/${to}/balance`).once('value').then(balanceSnapshot => {
			const from: string = snapshot.val().from || ''
			return db.ref(`cards/${from}`).once('value').then(cardSnapshot => {
				const toBalance: number = (balanceSnapshot.val() || 0) + amount
				const newFrom: string = cardSnapshot.exists() ? (cardSnapshot.val() || '') : from
				return context.params.uid === from
					? Promise.all([
						db.ref(`transactions/${to}/${context.params.transactionId}`).set({ time: snapshot.val().time, from: newFrom, to: to, amount: amount, balance: toBalance, message: snapshot.val().message }),
						db.ref(`users/${newFrom}/balance`).set(snapshot.val().balance)
					])
					: db.ref(`users/${to}/balance`).set(toBalance) as Promise<any>
			})
		})
})

export const pendingCreated = functions.database.ref('pending/{pendingId}').onCreate((snapshot, context) => {
	const val = snapshot.val()
	const from: string = val.from || ''
	return db.ref(`cards/${from}`).once('value').then(userIdSnapshot => {
		const userId: string = userIdSnapshot.val() || ''
		return db.ref(`users/${userId}/balance`).once('value').then(balanceSnapshot =>
			db.ref(`users/${userId}/cards/${from}`).once('value').then(cardSnapshot => {
				const amount: number = val.amount || 0
				const balance: number = balanceSnapshot.val() || 0
				const pin: string = cardSnapshot.val().pin || ''
				return amount <= balance && snapshot.val().pin === pin
					? Promise.all([
						db.ref(`transactions/${from}/${context.params.pendingId}`).set({ time: snapshot.val().time, from: from, to: snapshot.val().to, amount: amount, balance: balance - amount, message: `Paid with ${cardSnapshot.val().name}` }),
						snapshot.ref.remove()
					])
					: snapshot.ref.remove() as Promise<any>
			})
		)
	})
})