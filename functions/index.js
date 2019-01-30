const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.transact = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
    const root = snapshot.ref.parent.parent
    const to = snapshot.val().to
    return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
	    const from = context.params.uid
        const toBalance = balanceSnapshot.val() + amount
        return Promise.all([
            root.child(`transactions/${to}/${context.params.transactionId}`).set({time: snapshot.val().time, from: from, to: to, amount: snapshot.val().amount, balance: toBalance, message: snapshot.val().message}),
            root.child(`users/${from}/balance`).set(snapshot.val().balance),
            root.child(`users/${to}/balance`).set(toBalance)
        ])
    })
});