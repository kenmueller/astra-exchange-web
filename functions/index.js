let request = require('request') // make the request

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

/*request('put your external url here', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        //here put what you want to do with the request
    } })*/


exports.tableorder = functions.database.ref('users/{uid}/bazaarTableOrders/{bazaarTableOrder}').onCreate((snapshot, context) => {
	const root = snapshot.ref.parent.parent.parent
	const to = "SEC"
	const tableOfOrder = snapshot.val().table
	const payerName = snapshot.val().username

	return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
			const from = context.params.uid
			const amount = snapshot.val().amount

			const toBalance = balanceSnapshot.val() + amount / 2
			return Promise.all([
					root.child(`bazaarData/bazaarTables/${tableOfOrder}/owner`).set(from),
					root.child(`users/${to}/bazaarTableOrders/${context.params.transactionId}`).set({time: snapshot.val().time, from: from, amount: amount, balance: toBalance}),
					root.child(`users/${from}/balance`).set(snapshot.val().balance),
					root.child(`users/${to}/balance`).set(toBalance)
			])
	})
})
exports.transaction = functions.database.ref('transactions/{uid}/{transactionId}').onCreate((snapshot, context) => {
		const root = snapshot.ref.parent.parent.parent
		const to = snapshot.val().to



    return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
        const from = context.params.uid
        const amount = snapshot.val().amount
				if (to == "ATM_Convert") {
						const options={
							method:'POST',
							uri:'https://io.adafruit.com/api/v2/esadun/feeds/servofeed/data',
							body:{
								value: amount
							},
							json:true,
							headers:{
								'X-AIO-Key':'26e90ad8e7a5411095f5dd18618265eb'
							}
						}
						request(options).then(function(response){

						}).catch(function(err){

						})
		    }
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
		root.child(`companies/${uid}`).set({industry: 'Unspecified', name: `The ${name} Company`, pv: 0, logo: ""}),
		root.child(`companies/${uid}/products`).push({name: `The ${name} Brand Product`, inStock: true, cost: 1})
	])
})

// if (to != "ATM_Convert") {
//     return root.child(`users/${to}/balance`).once('value').then(balanceSnapshot => {
//         const from = context.params.uid
//         const amount = snapshot.val().amount
//         const toBalance = balanceSnapshot.val() + amount / 2
//         return Promise.all([
//             root.child(`transactions/${to}/${context.params.transactionId}`).set({time: snapshot.val().time, from: from, to: to, amount: amount, balance: toBalance, message: snapshot.val().message}),
//             root.child(`users/${from}/balance`).set(snapshot.val().balance),
//             root.child(`users/${to}/balance`).set(toBalance)
//         ])
//     })
// } else {

// }
