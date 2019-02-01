const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.transaction = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent.parent
	const to = snapshot.val().to
	return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
		const from = context.params.uid
		const amount = snapshot.val().amount
		const toBalance = balanceSnapshot.val() + amount / 2
		return Promise.all([
			root.child(`transactions/${to}/${context.params.transactionId}`).set({time: snapshot.val().time, from: from, to: to, amount: amount, balance: toBalance, message: snapshot.val().message}),
			root.child(`users/${from}/balance`).set(snapshot.val().balance),
			root.child(`users/${to}/balance`).set(toBalance)
		])
	})
})

exports.user = functions.database.ref('users/{uid}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent
	const uid = context.params.uid
	const name = snapshot.val().name
	return Promise.all([
		root.child(`companies/${uid}`).set({industry: 'Unspecified', name: `${name}'s Company`, pv: 0}),
		root.child(`companies/${uid}/products`).push({name: `${name}'s First Product`, quantity: 10, cost: 1})
	])
})