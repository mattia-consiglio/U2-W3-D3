const bookContainer = document.getElementById('books')
const books = []
const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
const total = document.getElementById('cartTotal')
const cartContainer = document.getElementById('booksInCart')

const updateCart = () => {
	localStorage.setItem('cart', JSON.stringify(cart))
	let cartTotal = 0
	cartContainer.innerHTML = ''
	cart.forEach((book, i) => {
		cartTotal += book.price
		const cartItem = document.createElement('div')
		cartItem.classList.add('row')
		cartItem.classList.add('py-2')
		cartItem.classList.add('border-bottom')
		cartItem.innerHTML = `
		<div class="col d-flex align-items-center">
							<div class="w-100">
								<p class="mb-1 fw-bold">${book.title}</p>
								<p class="mb-0">€ ${book.price}</p>
							</div>
							<button class="btn btn-outline-danger" onclick="removeFromCart(${i})"><i class="bi bi-trash3"></i></button>
						</div>`
		cartContainer.appendChild(cartItem)
	})
	total.innerText = cartTotal
}

const removeFromCart = i => {
	cart.splice(i, 1)
	updateCart()
}

const addToCart = i => {
	cart.push(books[i])
	updateCart()
}

const discardBook = e => {
	e.target.closest('.col').remove()
}

const displayBooks = () => {
	books.forEach((book, i) => {
		const col = document.createElement('div')
		col.classList.add('col')
		col.innerHTML = `
		<div class="card">
						<img src="${book.img}" class="card-img-top"
							alt="${book.title}">
						<div class="card-body">
							<h5 class="card-title">${book.title}</h5>
							<p class="card-text fs-4 fw-bold">€ ${book.price}</p>
							<p class="card-text">ASIN: ${book.asin}</p>
							<p class="card-text">Categoria: ${book.category}</p>
							<buttton class="btn btn-warning" onclick="discardBook(event)">Scarta</buttton>
							<buttton class="btn btn-primary" onclick="addToCart(${i})">Aggiungi al carrello</buttton>
						</div>
					</div>`
		bookContainer.appendChild(col)
	})
}

const getBooks = () => {
	fetch('https://striveschool-api.herokuapp.com/books')
		.then(response => response.json())
		.then(data => {
			books.push(...data)
			displayBooks()
		})
}
getBooks()
updateCart()
