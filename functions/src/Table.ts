import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as moment from 'moment'

const db = admin.database()

export const orderTable = functions.https.onCall((data, context) =>
	context.auth && context.auth.uid && data.table
		? isDuringBazaar().then(isDuring =>
			isDuring
				? canBuyTables(context.auth!.uid).then(canBuy =>
					canBuy
						? db.ref(`tables/${data.table}`).once('value').then(table => {
							const val = table.val()
							return val.owner
								? Promise.reject()
								: db.ref(`users/${context.auth!.uid}/balance`).once('value').then(balance =>
									val.price > balance.val()
										? Promise.reject()
										: db.ref(`tables/${data.table}`).update({
											owner: context.auth!.uid
										})
								)
						})
						: Promise.reject()
				)
				: Promise.reject()
		)
		: Promise.reject()
)

export const tableOrderCreated = functions.database.ref('tables/{table}/owner').onCreate((_snapshot, context) => {
	const dateList = moment().format('lll').split(' ')
	dateList.splice(3, 0, '@')
	return db.ref(`tables/${context.params.table}`).once('value').then(table => {
		const val = table.val()
		return db.ref(`users/${val.owner}/balance`).once('value').then(balance =>
			db.ref(`transactions/${val.owner}`).push({
				time: dateList.join(' '),
				from: val.owner,
				to: 'h621pgey1vPfxrmoW5LUkZaHkhT2',
				amount: val.price,
				balance: balance.val() - val.price,
				message: `Table ${table.key} ordered for ${val.price} Astra${val.price === 1 ? '' : 's'}`
			})
		)
	})
})

function isDuringBazaar(): Promise<boolean> {
	const now = new Date().getTime()
	return db.ref(`bazaar/start`).once('value').then(start =>
		now < start.val()
			? false
			: db.ref(`bazaar/end`).once('value').then(end =>
				now <= end.val()
			)
	)
}

function canBuyTables(uid: string): Promise<boolean> {
	return db.ref('tables').once('value').then(tables => {
		const val = tables.val()
		return Object.keys(val).filter(table =>
			val[table].owner === uid
		)
	}).then(tables => tables.length < 2)
}