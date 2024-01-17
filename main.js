const bookContainer = document.getElementById('books')
const books = []
const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
const total = document.getElementById('cartTotal')
const cartContainer = document.getElementById('booksInCart')
const buyBtn = document.getElementById('buy')
const toastContainer = document.getElementById('toastContainer')
let toastId = 0
const bsOffcanvas = new bootstrap.Offcanvas('#cartContainer')
const numberCartItems = document.getElementById('numberCartItems')

const sanitize = string => {
	const symbols = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&apos;',
	}
	for (const symbol in symbols) {
		if (Object.hasOwnProperty.call(symbols, symbol)) {
			const replacement = symbols[symbol]
			string.replace(symbol, replacement)
		}
	}
	return string
}

const toastTemplate = (title, message, type = 'info') => {
	toastId++
	const color = type === 'info' ? 'primary' : type === 'success' ? 'success' : 'danger'
	return `
	<div id="toast-${toastId}" role="alert" aria-live="assertive" aria-atomic="true" class="toast" data-bs-autohide="false">
				<div class="toast-header">
					<i class="bi bi-square-fill text-${color} pe-2"></i>
					<strong class="me-auto">${title}</strong>
					<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div class="toast-body">
					${message}
				</div>
			</div>
	`
}

const showToast = (title, message, type = 'info') => {
	toastContainer.insertAdjacentHTML('beforeEnd', toastTemplate(title, message, type))
	const toastElement = document.getElementById('toast-' + toastId)
	const toast = new bootstrap.Toast(toastElement, {
		autohide: true,
		delay: 3000,
	})
	toast.show()
	toastElement.addEventListener(
		'hidden.bs.toast',
		() => {
			toastElement.remove()
		},
		{ once: true }
	)
}

const updateCart = () => {
	localStorage.setItem('cart', JSON.stringify(cart))
	let cartTotal = 0
	let cartItems = 0
	if (cart.length === 0) {
		cartContainer.innerHTML = '<p class="text-center fst-italic text-secondary">Carrello vuoto.</p>'
		buyBtn.disabled = true
	} else {
		buyBtn.disabled = false
		cartContainer.innerHTML = ''
		cart.forEach((item, i) => {
			cartTotal += item.price * item.quantity
			const cartItem = document.createElement('div')
			cartItem.classList.add('row')
			cartItem.classList.add('py-2')
			cartItem.classList.add('border-bottom')
			cartItems += item.quantity
			cartItem.innerHTML = `
		<div class="col d-flex align-items-center">
							<div class="w-100 pe-2">
								<p class="mb-1 fw-bold">${sanitize(item.title)}</p>
								<p class="mb-0">€ ${parseFloat(item.price)} x${parseFloat(item.quantity)} (€ ${
				Math.floor(parseFloat(item.price) * parseFloat(item.quantity) * 100) / 100
			})</p>
							</div>
							<button class="btn btn-outline-danger" onclick="removeFromCart(${i})"><i class="bi bi-trash3"></i></button>
						</div>`
			cartContainer.appendChild(cartItem)
		})
	}
	total.innerText = '€ ' + Math.floor(cartTotal * 100) / 100
	numberCartItems.innerText = cartItems
}

const removeFromCart = i => {
	cart.splice(i, 1)
	updateCart()
}

const addToCart = asin => {
	const book = books.find(book => book.asin === asin)
	if (cart.length > 0) {
		const item = cart.find(item => item.asin === book.asin)
		item ? item.quantity++ : cart.push({ ...book, quantity: 1 })
	} else {
		cart.push({ ...book, quantity: 1 })
	}

	updateCart()
	showToast('Libro aggiunto al carrello', `${book.title} aggiunto al carrello`)
	bsOffcanvas.show()
}

const displayBooks = () => {
	bookContainer.innerHTML = ''
	books.forEach((book, i) => {
		const col = document.createElement('div')
		col.classList.add('col')
		col.innerHTML = `
		<div class="card h-100">
						<img src="${book.img}" class="card-img-top"
							alt="${book.title}">
						<div class="card-body d-flex flex-column justify-content-between">
							<div class="mb-3">
								<h5 class="card-title">${book.title}</h5>
								<p class="card-text fs-4 fw-bold">€ ${book.price}</p>
								<p class="card-text">ASIN: ${book.asin}</p>
								<p class="card-text">Categoria: ${book.category}</p>
							</div>
							<div>
								<buttton class="btn btn-warning" onclick="discardBook(event, '${book.asin}')"><i class="bi bi-x-circle"></i></buttton>
								<buttton class="btn btn-primary" onclick="addToCart('${book.asin}')"><i class="bi bi-cart2"></i></buttton>
							</div>
						</div>
					</div>`
		bookContainer.appendChild(col)
	})
}

const discardBook = (e, asin) => {
	e.target.closest('.col').remove()
	books.splice(
		books.findIndex(book => book.asin === asin),
		1
	)
}

const getBooks = () => {
	fetch('https://striveschool-api.herokuapp.com/books')
		.then(response => {
			if (!response.ok) {
				throw new Error('Codice risposta:' + response.status)
			}
			return response.json()
		})
		.then(data => {
			books.push(...data)
			displayBooks()
		})
		.catch(err => {
			console.log(err)
		})
}
getBooks()
updateCart()

buyBtn.addEventListener('click', () => {
	cart.length = 0
	updateCart()
	showToast('Ordine effettuato', 'Il tuo ordine è stato effettuato con successo.', 'success')
	bsOffcanvas.hide()
})
