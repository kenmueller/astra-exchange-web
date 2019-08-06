import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Slug from './Slug'

const db = admin.database()

export const companyCreated = functions.database.ref('companies/{companyId}').onCreate((snapshot, context) => {
	const companyId: string = context.params.companyId
	const val = snapshot.val()
	return Promise.all([
		db.ref(`slugs/companies/${Slug.slugify(val.name)}`).set(companyId),
		db.ref(`owners/companies/${val.owner}/${companyId}`).set(true)
	])
})