const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.transact = functions.database.ref('transactions/{uid}').onCreate((snapshot, context) => {
    const ref = snapshot.ref.parent.parent
    ref.child(`users/${to}/balance`).once('value').then(snap => {
	    const from = context.params.uid
	    const to = snapshot.val().to
        const toBalance = snap.val() + amount
        ref.child(`transactions/${to}/${snapshot.key}`).set({time: snapshot.val().time, from: from, to: to, amount: snapshot.val().amount, balance: toBalance, message: snapshot.val().message})
        ref.child(`users/${from}/balance`).set(snapshot.val().balance)
        ref.child(`users/${to}/balance`).set(toBalance)
    })
});