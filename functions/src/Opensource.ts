import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
// import * as sanitizeHtml from 'sanitize-html'
// import { minify as minifyHtml } from 'html-minifier'

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
	<head>
		<script src="https://astra.exchange/api"></script>
		<title><!-- TITLE --></title>
		<style>
			/* CSS */
		</style>
	</head>
	<body>
		<!-- BODY -->
		<script>
			/* JAVASCRIPT */
		</script>
	</body>
</html>`

const firestore = admin.firestore()
const app = express()

export const opensource = functions.https.onRequest((req, res) => {
	const urlParts = req.url.split('/').slice(1)
	return urlParts[0] === 'edit'
		? urlParts.length === 1
			? editIndex(res)
			: app(req, res)
		: firestore.doc(`opensource/${urlParts.length ? urlParts.join('\\') : '\\'}`).get().then(page => {
			if (page.exists) {
				const html = page.get('html')
				res.status(html ? 200 : 500).send(html || '<!DOCTYPE html><html><head><title>An error occurred</title></head><body><h1>An error occurred</h1><p>Please reload the page</p><button onclick="location.reload()">Reload</button></body></html>')
			} else {
				const url = urlParts.join('/')
				res.status(200).send(createPage({
					url,
					title: `Create ${url}`,
					style: `
						#editor {
							height: 400px;
						}
						.button.new.complete {
							margin: auto;
							display: block;
							font-weight: bold;
						}
					`,
					body: `<div id="editor"><xmp>${DEFAULT_HTML}</xmp></div><br><a class="button is-large is-success new complete">Create</a>`,
					script: `
						const editor = ace.edit('editor')
						editor.setTheme('ace/theme/monokai')
						editor.session.setMode('ace/mode/html')
						const editorDiv = document.querySelector('#editor')
						const complete = document.querySelector('.button.new.complete')
						complete.addEventListener('click', () => {
							complete.classList.add('is-loading')
							return (editorDiv.innerHTML.trim().length
								? firestore.doc('opensource/${url.replace('/', '\\\\')}').set({ html: editorDiv.innerHTML })
								: Promise.resolve()
							).then(() => location.reload())
						})
					`
				}))
			}
		})
})

app.get('/edit/:url', (req, res) => {
	const url = req.params.url
	return firestore.doc(`opensource/${url.replace('/', '\\')}`).get().then(page => page.exists
		? res.status(200).send(/*createPage(
			`Edit ${url}`,
			`
				.textarea.edit.html {
					height: 400px;
				}
				.button.edit.complete {
					margin: auto;
					display: block;
				}
			`,
			`
				<textarea class="textarea edit html" placeholder="Press submit to delete page"></textarea>
				<br>
				<a class="button is-large is-success edit complete"><strong>Submit</strong></a>
			`,
			`
				const textarea = document.querySelector('.textarea.edit.html')
				const complete = document.querySelector('.button.edit.complete')
				textarea.value = \`${page.data()!.html}\`
				complete.addEventListener('click', () => {
					complete.classList.add('is-loading')
					return textarea.value.trim().length === 0
						? firestore.doc('opensource/${url.replace('/', '\\\\')}').delete().then(() => location.reload())
						: firestore.doc('opensource/${url.replace('/', '\\\\')}').update({ html: textarea.value }).then(() => complete.classList.remove('is-loading'))
				})
			`
		)*/)
		: res.status(404).redirect(`/${url}`)
	)
})

function editIndex(res: functions.Response): Promise<void | functions.Response> {
	return firestore.doc('opensource/\\').get().then(page => page.exists
		? res.status(200).send(/*createPage(
			'Edit index',
			`
				.textarea.edit.html {
					height: 400px;
				}
				.button.edit.complete {
					margin: auto;
					display: block;
				}
			`,
			`
				<textarea class="textarea edit html" placeholder="Press submit to delete page"></textarea>
				<br>
				<a class="button is-large is-success edit complete"><strong>Submit</strong></a>
			`,
			`
				const textarea = document.querySelector('.textarea.edit.html')
				const complete = document.querySelector('.button.edit.complete')
				textarea.value = \`${page.data()!.html}\`
				complete.addEventListener('click', () => {
					complete.classList.add('is-loading')
					return textarea.value.trim().length === 0
						? firestore.doc('opensource/\\\\').delete().then(() => location.reload())
						: firestore.doc('opensource/\\\\').update({ html: textarea.value }).then(() => complete.classList.remove('is-loading'))
				})
			`
		)*/)
		: res.status(404).redirect('/')
	)
}

function createPage({ url, title, style, body, script }: { url: string, title: string, style: string, body: string, script: string }): string {
	return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
				<meta name="copyright" content="2019 Ken Mueller">
				<meta name="description" content="Astra Exchange Open Source - ${url}">
				<meta name="keywords" content="astra exchange,astra.exchange,astra,exchange,ad astra,ad,astra,astra exchange open source,open source,{{ url }},ken mueller,ken,mueller">
				<script defer src="/__/firebase/5.8.4/firebase-app.js"></script>
				<script defer src="/__/firebase/5.8.4/firebase-firestore.js"></script>
				<script defer src="/__/firebase/init.js"></script>
				<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
				<script defer src="/ace/src-min/ace.js"></script>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css">
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
				<title>${title}</title>
				<style>
					html,
					body {
						font-family: 'Open Sans', serif;
						font-size: 16px;
						line-height: 1.5;
						height: 100%;
						background: #ECF0F3;
					}
					.box {
						margin-top: 20px;
					}
					${style}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="columns">
						<div class="column is-10 is-offset-1">
							<div class="box">
								${body}
							</div>
						</div>
					</div>
				</div>
				<script defer>
					document.addEventListener('DOMContentLoaded', () => {
						const firestore = firebase.firestore()
						${script}
					})
				</script>
			</body>
		</html>
	`
}