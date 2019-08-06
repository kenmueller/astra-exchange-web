document.write(
	document.cookie.match('(^|[^;]+)\\s*auth\\s*=\\s*([^;]+)') ? `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="copyright" content="2019 Ken Mueller">
		<meta name="description" content="Astra Exchange for Ad Astra school. Located in Hawthorne">
		<meta name="keywords" content="astra exchange,astra.exchange,astra,exchange,ad astra,ad,astra,ken mueller,ken,mueller">
		<script defer src="/__/firebase/5.9.4/firebase-app.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-auth.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-database.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-messaging.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-storage.js"></script>
		<script defer src="/__/firebase/init.js"></script>
		<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
		<script defer src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"></script>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
		<link rel="stylesheet" href="/css/navbar.css">
		<link rel="stylesheet" href="/css/dashboard.css">
		<link rel="icon" href="/images/astra.png">
		<title>Astra Exchange</title>
	</head>
	<body>
		<nav class="navbar" role="navigation" aria-label="main navigation">
			<div class="navbar-brand">
				<a class="navbar-item" href="/"><img src="/images/astra.png" width="28" height="28"></a>
				<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
				</a>
			</div>
			<div id="navbar" class="navbar-menu">
				<div class="navbar-start">
					<!-- <a class="navbar-item" href="/companies">Companies</a> -->
					<a class="navbar-item action leaderboard">Leaderboard</a>
					<a class="navbar-item action send">Send Money</a>
					<a class="navbar-item action fine is-hidden">Fine</a>
					<a class="navbar-item action transactions">Transaction History</a>
					<div class="navbar-item has-dropdown is-hoverable">
						<a class="navbar-link">iOS Apps</a>
						<div class="navbar-dropdown">
							<a class="navbar-item" href="itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist">Astra Exchange</a>
							<a class="navbar-item" onclick="alert('Coming soon!')">Notes Exchange</a>
						</div>
					</div>
				</div>
				<div class="navbar-end">
					<a class="navbar-item" href="https://opensource.astra.exchange">Open Source</a>
					<a class="navbar-item" href="/documentation">API Documentation</a>
					<div class="navbar-item">
						<div class="navbar-item has-dropdown is-hoverable auth user-dropdown is-hidden">
							<a class="navbar-link auth user-link"></a>
							<div class="navbar-dropdown">
								<a class="navbar-item action settings">Settings</a>
								<hr class="navbar-divider">
								<a class="navbar-item auth sign-out">Sign out</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
		<div class="modal sign-up">
			<div class="modal-background close-sign-up"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title"><b>Sign up</b></p>
					<button class="delete close-sign-up" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Name</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-up-name" type="text" placeholder="Enter name">
							<span class="icon is-small is-left"><i class="fas fa-user"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Email</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-up-email" type="email" placeholder="Enter email">
							<span class="icon is-small is-left"><i class="fas fa-at"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Password</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-up-password" type="password" placeholder="Enter password">
							<span class="icon is-small is-left"><i class="fas fa-key"></i></span>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-success auth complete-sign-up" id="complete-sign-up" disabled><b>Sign up</b></button>
					<button class="button close-sign-up">Cancel</button>
				</footer>
			</div>
		</div>
		<div class="modal sign-in">
			<div class="modal-background close-sign-in"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title"><b>Sign in</b></p>
					<button class="delete close-sign-in" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Email</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-in-email" type="email" placeholder="Enter email">
							<span class="icon is-small is-left"><i class="fas fa-at"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Password</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-in-password" type="password" placeholder="Enter password">
							<span class="icon is-small is-left"><i class="fas fa-key"></i></span>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-success auth complete-sign-in" id="complete-sign-in" disabled><b>Sign in</b></button>
					<button class="button close-sign-in">Cancel</button>
				</footer>
			</div>
		</div>
		<div class="container">
			<div class="columns">
				<div class="column is-3">
					<aside class="menu is-hidden-mobile">
						<p class="menu-label">actions</p>
						<ul class="menu-list">
							<li><a class="action send">Send Money</a></li>
							<li><a class="action create-invoice">Create Invoice</a></li>
							<li><a class="action fine is-hidden">Fine</a></li>
						</ul>
						<p class="menu-label">lookup</p>
						<ul class="menu-list">
							<li><a class="action transactions">Transaction History</a></li>
							<li><a class="action invoices">Invoices</a></li>
							<li><a class="action your-id">Your ID</a></li>
							<li><a class="action leaderboard">Leaderboard</a></li>
						</ul>
						<p class="menu-label">events</p>
						<ul class="menu-list">
							<li><a class="action bazaar-tables">Bazaar Tables</a></li>
						</ul>
						<p class="menu-label">other</p>
						<ul class="menu-list">
							<li><a class="action api-documentation">API Documentation</a></li>
							<li><a class="action open-source">Open Source</a></li>
							<li><a class="action github">GitHub</a></li>
						</ul>
					</aside>
				</div>
				<div class="column is-9">
					<section class="hero is-info welcome is-small">
						<div class="hero-body">
							<div class="container">
								<h1 class="title user name">Hello,</h1>
							</div>
						</div>
					</section>
					<section class="info-tiles">
						<div class="tile is-ancestor has-text-centered">
							<div class="tile is-parent">
								<article class="tile is-child box">
									<p class="title user balance">...</p>
									<p class="subtitle">Balance</p>
								</article>
							</div>
							<div class="tile is-parent">
								<article class="tile is-child box">
									<p class="title user independence">...</p>
									<p class="subtitle">Independence</p>
								</article>
							</div>
							<div class="tile is-parent">
								<article class="tile is-child box">
									<p class="title user transaction-count">...</p>
									<p class="subtitle user transaction-count-label">Transactions</p>
								</article>
							</div>
							<div class="tile is-parent">
								<article class="tile is-child box">
									<p class="title user open-invoice-count">...</p>
									<p class="subtitle user open-invoice-count-label">Open Invoices</p>
								</article>
							</div>
						</div>
					</section>
					<div class="columns">
						<div class="column is-6">
							<div class="card events-card">
								<header class="card-header">
									<p class="card-header-title">Transaction History</p>
								</header>
								<div class="card-table">
									<div class="content">
										<table class="table is-fullwidth is-striped">
											<tbody id="transactions-preview"></tbody>
										</table>
									</div>
								</div>
								<footer class="card-footer">
									<a class="card-footer-item action transactions">View All</a>
								</footer>
							</div>
						</div>
						<div class="column is-6">
							<div class="card events-card">
								<header class="card-header">
									<p class="card-header-title">Invoices</p>
								</header>
								<div class="card-table">
									<div class="content">
										<table class="table is-fullwidth is-striped">
											<tbody id="invoices-preview"></tbody>
										</table>
									</div>
								</div>
								<footer class="card-footer">
									<a class="card-footer-item action invoices">View All</a>
								</footer>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="modal send">
			<div class="modal-background close-send"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Send Money</p>
					<button class="delete close-send" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Recipient</label>
						<div class="select-user">
							<div class="select">
								<select class="user-list" id="send-recipient"></select>
							</div>
						</div>
					</div>
					<div class="field">
						<label class="label">Amount</label>
						<div class="control has-icons-left">
							<input class="input" id="send-amount" type="number" placeholder="Enter amount">
							<span class="icon is-small is-left"><i class="fas fa-comment-dollar"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Message</label>
						<div class="control has-icons-left">
							<input class="input" id="send-message" placeholder="Enter message (Optional)">
							<span class="icon is-small is-left"><i class="fas fa-envelope"></i></span>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-success complete complete-send" id="complete-send" disabled>Send</button>
					<button class="button close-send">Cancel</button>
				</footer>
			</div>
		</div>
		<div class="modal create-invoice">
			<div class="modal-background close-create-invoice"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Create Invoice</p>
					<button class="delete close-create-invoice" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Recipient</label>
						<div class="select-user">
							<div class="select">
								<select class="user-list" id="create-invoice-recipient"></select>
							</div>
						</div>
					</div>
					<div class="field">
						<label class="label">Amount</label>
						<div class="control has-icons-left">
							<input class="input" id="create-invoice-amount" type="number" placeholder="Enter amount">
							<span class="icon is-small is-left"><i class="fas fa-comment-dollar"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Message</label>
						<div class="control has-icons-left">
							<input class="input" id="create-invoice-message" placeholder="Enter message (Optional)">
							<span class="icon is-small is-left"><i class="fas fa-envelope"></i></span>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-success complete complete-create-invoice" id="complete-create-invoice" disabled>Request</button>
					<button class="button close-create-invoice">Cancel</button>
				</footer>
			</div>
		</div>
		<div class="modal fine">
			<div class="modal-background close-fine"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Fine</p>
					<button class="delete close-fine" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Student</label>
						<div class="select-user">
							<div class="select">
								<select class="user-list" id="fine-recipient"></select>
							</div>
						</div>
					</div>
					<div class="field">
						<label class="label">Fine Amount</label>
						<div class="control has-icons-left">
							<input class="input" id="fine-amount" type="number" placeholder="Enter fine amount">
							<span class="icon is-small is-left"><i class="fas fa-comment-dollar"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Reason</label>
						<div class="control has-icons-left">
							<input class="input" id="fine-reason" placeholder="Notebook left out">
							<span class="icon is-small is-left"><i class="fas fa-envelope"></i></span>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-success complete complete-fine" id="complete-fine" disabled>Fine</button>
					<button class="button close-fine">Cancel</button>
				</footer>
			</div>
		</div>
		<div class="modal transactions">
			<div class="modal-background close-transactions"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Transaction History</p>
					<button class="delete close-transactions" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<table class="table is-fullwidth is-striped">
						<tbody id="transactions"></tbody>
					</table>
				</section>
				<footer class="modal-card-foot"></footer>
			</div>
		</div>
		<div class="modal invoices">
			<div class="modal-background close-invoices"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Invoices</p>
					<button class="delete close-invoices" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<table class="table is-fullwidth is-striped">
						<tbody id="invoices"></tbody>
					</table>
				</section>
				<footer class="modal-card-foot"></footer>
			</div>
		</div>
		<div class="modal your-id">
			<div class="modal-background close-your-id"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Your ID</p>
					<button class="delete close-your-id" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="your-id qr-code"></div>
				</section>
				<footer class="modal-card-foot"></footer>
			</div>
		</div>
		<div class="modal transaction">
			<div class="modal-background close-transaction"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title transaction type"></p>
					<button class="delete close-transaction" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Time</label>
						<p class="transaction time"></p>
					</div>
					<div class="field">
						<label class="label">From</label>
						<p class="transaction from"></p>
					</div>
					<div class="field">
						<label class="label">To</label>
						<p class="transaction to"></p>
					</div>
					<div class="field">
						<label class="label transaction amount-label">Amount</label>
						<p class="transaction amount"></p>
					</div>
					<div class="field">
						<label class="label transaction balance-label"></label>
						<p class="transaction balance"></p>
					</div>
					<div class="field">
						<label class="label transaction msg-label">Message</label>
						<p class="transaction msg"></p>
					</div>
				</section>
				<footer class="modal-card-foot"></footer>
			</div>
		</div>
		<div class="modal invoice">
			<div class="modal-background close-invoice"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title invoice type"></p>
					<button class="delete close-invoice" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Time</label>
						<p class="invoice time"></p>
					</div>
					<div class="field">
						<label class="label">Status</label>
						<p class="invoice status"></p>
					</div>
					<div class="field">
						<label class="label">From</label>
						<p class="invoice from"></p>
					</div>
					<div class="field">
						<label class="label">To</label>
						<p class="invoice to"></p>
					</div>
					<div class="field">
						<label class="label">Amount</label>
						<p class="invoice amount"></p>
					</div>
					<div class="field">
						<label class="label invoice msg-label">Message</label>
						<p class="invoice msg"></p>
					</div>
				</section>
				<footer class="modal-card-foot">
					<a class="button is-primary download-app" href="itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist"><strong>Download the iOS app</strong></a>
				</footer>
			</div>
		</div>
		<div class="modal leaderboard">
			<div class="modal-background close-leaderboard"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Leaderboard</p>
					<button class="delete close-leaderboard" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<table class="table is-fullwidth is-striped">
						<tbody id="leaderboard"></tbody>
					</table>
				</section>
				<footer class="modal-card-foot"></footer>
			</div>
		</div>
		<div class="modal settings">
			<div class="modal-background close-settings"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Settings</p>
					<button class="delete close-settings" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Name</label>
						<p class="settings name"></p>
					</div>
					<div class="field">
						<label class="label">Email</label>
						<p class="settings email"></p>
					</div>
					<div class="field">
						<label class="label">Balance</label>
						<p class="settings balance"></p>
					</div>
					<div class="field">
						<label class="label">Independence</label>
						<p class="settings independence"></p>
					</div>
					<div class="field">
						<label class="label">Pin</label>
						<p class="settings pin">...</p>
					</div>
				</section>
				<footer class="modal-card-foot">
					<a class="button is-primary password-reset"><b>Send a password reset email</b></a>
				</footer>
			</div>
		</div>
		<script src="/api/all.js"></script>
		<script src="/js/qrcode.js"></script>
		<script src="/js/dashboard.js"></script>
		<script src="/js/base.js"></script>
	</body>
</html>
			` : `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="copyright" content="2019 Ken Mueller">
		<meta name="description" content="Astra Exchange for Ad Astra school. Located in Hawthorne">
		<meta name="keywords" content="astra exchange,astra.exchange,astra,exchange,ad astra,ad,astra,ken mueller,ken,mueller">
		<script defer src="/__/firebase/5.9.4/firebase-app.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-auth.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-database.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-messaging.js"></script>
		<script defer src="/__/firebase/5.9.4/firebase-storage.js"></script>
		<script defer src="/__/firebase/init.js"></script>
		<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
		<link rel="stylesheet" href="/css/navbar.css">
		<link rel="stylesheet" href="/css/index.css">
		<link rel="icon" href="/images/astra.png">
		<title>Astra Exchange</title>
	</head>
	<body>
		<nav class="navbar" role="navigation" aria-label="main navigation">
			<div class="navbar-brand">
				<a class="navbar-item" href="/"><img src="/images/astra.png" width="28" height="28"></a>
				<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
				</a>
			</div>
			<div id="navbar" class="navbar-menu">
				<div class="navbar-start">
					<a class="navbar-item" href="https://opensource.astra.exchange">Open Source</a>
					<a class="navbar-item" href="/documentation">API Documentation</a>
					<div class="navbar-item has-dropdown is-hoverable">
						<a class="navbar-link">iOS Apps</a>
						<div class="navbar-dropdown">
							<a class="navbar-item" href="itms-services://?action=download-manifest&url=https://astra.exchange/manifest.plist">Astra Exchange</a>
							<a class="navbar-item" onclick="alert('Coming soon!')">Notes Exchange</a>
						</div>
					</div>
				</div>
				<div class="navbar-end">
					<div class="navbar-item">
						<a class="button is-danger auth reset-password">Reset Password</a>
						<a class="button is-primary auth sign-up"><b>Sign up</b></a>
						<a class="button is-info auth sign-in"><b>Sign in</b></a>
					</div>
				</div>
			</div>
		</nav>
		<div class="modal sign-up">
			<div class="modal-background close-sign-up"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title"><b>Sign up</b></p>
					<button class="delete close-sign-up" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Name</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-up-name" type="text" placeholder="Enter name">
							<span class="icon is-small is-left"><i class="fas fa-user"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Email</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-up-email" type="email" placeholder="Enter email">
							<span class="icon is-small is-left"><i class="fas fa-at"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Password</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-up-password" type="password" placeholder="Enter password">
							<span class="icon is-small is-left"><i class="fas fa-key"></i></span>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-success auth complete-sign-up" id="complete-sign-up" disabled><b>Sign up</b></button>
					<button class="button close-sign-up">Cancel</button>
				</footer>
			</div>
		</div>
		<div class="modal sign-in">
			<div class="modal-background close-sign-in"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title"><b>Sign in</b></p>
					<button class="delete close-sign-in" aria-label="close"></button>
				</header>
				<section class="modal-card-body">
					<div class="field">
						<label class="label">Email</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-in-email" type="email" placeholder="Enter email">
							<span class="icon is-small is-left"><i class="fas fa-at"></i></span>
						</div>
					</div>
					<div class="field">
						<label class="label">Password</label>
						<div class="control has-icons-left">
							<input class="input" id="sign-in-password" type="password" placeholder="Enter password">
							<span class="icon is-small is-left"><i class="fas fa-key"></i></span>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-success auth complete-sign-in" id="complete-sign-in" disabled><b>Sign in</b></button>
					<button class="button close-sign-in">Cancel</button>
				</footer>
			</div>
		</div>
		<section class="hero is-info is-fullheight">
			<div class="hero-body">
				<div class="container has-text-centered">
					<div class="column is-6 is-offset-3">
						<h1 class="title">Astra Exchange</h1>
						<h2 class="subtitle">Sign up or sign in to access your dashboard</h2>
						<a class="button is-primary main auth sign-up"><strong>Sign up</strong></a>
						<a class="button is-info main auth sign-in"><strong>Sign in</strong></a>
					</div>
				</div>
			</div>
		</section>
		<script src="/js/index.js"></script>
		<script src="/js/base.js"></script>
	</body>
</html>
		`
)