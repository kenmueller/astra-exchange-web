const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.transact = functions.database.ref('transactions/{uid}').onCreate((snapshot, context) => {
    const root = snapshot.ref.parent.parent
    return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
	    const from = context.params.uid
	    const to = snapshot.val().to
        const toBalance = balanceSnapshot.val() + amount
        return Promise.all([
            root.child(`transactions/${to}/${snapshot.key}`).set({time: snapshot.val().time, from: from, to: to, amount: snapshot.val().amount, balance: toBalance, message: snapshot.val().message}),
            root.child(`users/${from}/balance`).set(snapshot.val().balance),
            root.child(`users/${to}/balance`).set(toBalance)
        ])
    })
});