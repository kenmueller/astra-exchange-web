import * as admin from 'firebase-admin'

const firestore = admin.firestore()
const db = admin.database()

export default class Reputation {
	static getAmountForAction(action: ReputationAction): Promise<number> {
		return firestore.doc(`reputation/${action.valueOf()}`).get().then(doc => {
			const amount: number | undefined = doc.get('amount')
			return amount === undefined ? Promise.reject() : amount
		})
	}

	static push(uid: string, action: ReputationAction, description: string, extras?: { uid: string }, reputation?: number): Promise<void> {
		return Reputation.getAmountForAction(action).then(amount =>
			Reputation.pushWithAmount(uid, amount, description, extras, reputation)
		)
	}

	static pushWithAmount(uid: string, amount: number, description: string, extras?: { uid: string }, reputation?: number): Promise<void> {
		const date = new Date
		const addDocument = (currentReputation: number) => {
			const newReputation = currentReputation + amount
			return firestore.collection(`users/${uid}/reputationHistory`).add(Object.assign({
				date,
				amount,
				description,
				after: newReputation
			}, extras)).then(_documentReference =>
				db.ref(`users/${uid}/reputation`).set(newReputation)
			)
		}
		return reputation === undefined
			? firestore.doc(`users/${uid}`).get().then(user =>
				addDocument(user.get('reputation') || 0)
			)
			: addDocument(reputation)
	}

	static normalize(value: number): number {
		return ~~Math.sqrt(Math.max(1, value))
	}
}

export enum ReputationAction {
	join = 'join',
	outgoingTransaction = 'outgoing-transaction',
	incomingTransaction = 'incoming-transaction',
	boughtTable = 'bought-table'
}