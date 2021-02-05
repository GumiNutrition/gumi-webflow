$(document).ready(function () {
	init();
	renderMetaFromStorage();
	renderBuildBoxFromStorage();
	renderCheckoutFromStorage();

	if (Number($('#boxCount').text()) > 0 && $(window).width() < 991) {
		$('html, body').animate({
			scrollTop:
				$('#customize-order').offset().top
		}, 1000);
	}; $(document).on('click', '.plus-minus-button.plus', function () {
		const item_data = getItemData($(this)); const $quant = $(this).closest('.ticker').find('input'); const
			quant = parseInt($quant.val()); if (quant == 6) {window.alert("You cannot add more than 6 of a single item"); return;}
		let storage = JSON.parse(localStorage.getItem('buildBox') || "[]"); let exists_in_storage = false; if (storage.length >
			0) {
			for (const item of storage) {
				if (item.sku === item_data.sku) {
					item.quantity++;
					updateCheckoutItem(item_data.sku, 'add');
					exists_in_storage = true;
					break;
				}
			}
		}
		if (!exists_in_storage) {
			storage.push({
				sku: item_data.sku,
				quantity: 1,
				imageURL: item_data.image,
				price: item_data.price
			});
			addCheckoutItem(item_data);
		}

		localStorage.setItem('buildBox', JSON.stringify(storage));
		updateCartRender();
		if (quant < 6) {$quant[0].value = quant + 1;} $('.empty');
	}).on('click', '.plus-minus-button.minus', function () {
		const item_data = getItemData($(this)); const $quant = $(this).closest('.ticker').find('input'); const
			quant = parseInt($quant.val()); let storage = JSON.parse(localStorage.getItem('buildBox') || "[]"); for (const item
			of storage) {if (item.sku === item_data.sku) {item.quantity--; if (item.quantity == 0) {delete item;} break;} }
		localStorage.setItem('buildBox', JSON.stringify(storage)); if (quant > 0) {
			const item_data = getItemData($(this));
			updateCheckoutItem(item_data.sku, 'sub');
			updateCartRender();
			$quant[0].value = quant - 1;
		}
	})


		.on('click', '.cart-item .remove-button', function () {
			let $item = $(this).closest('.cart-item');
			let sku = $item.attr('data-sku');
			removeCartItem(sku);
			updateCartRender();
		})

		.on('change', '.select', function () {
			let storage = JSON.parse(localStorage.getItem('buildBoxMeta') || "{}");
			storage.freq = $(this).val();
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			resetCheckoutCart();
		})

		.on('click', '#subscribe', function () {
			let storage = JSON.parse(localStorage.getItem('buildBoxMeta') || "{}");
			storage.is_sub = $(this).is(':checked');
			localStorage.setItem('buildBoxMeta', JSON.stringify(storage));
			evaluateSub(storage);
			resetCheckoutCart();
		})
		;

	function updateCheckoutItem(sku, method) {
		const $quantity = $(`.cart-item[data-sku="${sku}"]`).find('.ticker-quantity input');
		if ($quantity) {
			const quantity = parseInt($quantity.val());
			if ($quantity) {
				if (method == 'add') {
					$quantity[0].value = quantity + 1;
				}
				if (method == 'sub') {
					$quantity[0].value = quantity - 1;
					if ((quantity - 1) == 0) {
						removeCartItem(sku);
					}
				}
			}
		}
	}
	function addCheckoutItem(item, quantity = 1) {
		let is_sub = $('#subscribe').is(':checked');
		let price_info = `
		<div class="cart-item-price">$${item.price}</div>
		`;
		let freq_info = '';
		if (is_sub) {
			price_info = `
		<div class="cart-item-price compare">$${item.price}</div>
		<div class="cart-item-price">$${item.sub_price}0</div>
		`;
			let freq_name = $('.select option:selected').text();
			freq_info = `<div class="cart-item-frequency">Delivered: ${freq_name}</div>`;
		} else {
			freq_info = `<div class="cart-item-frequency">Delivered: Just this once</div>`;
		}
		$('#build-your-box-form .cart-list').append(`
		<li class="cart-item" data-sku="${item.sku}">
			<div class="cart-item-image-wrap">
				<img src="${item.image}" loading="lazy" sizes="(max-width: 479px) 13vw, 60px" alt="cart-item"
					class="cart-item-image">
			</div>
			<div class="product-info-wrap in-cart">
				<div class="cart-item-info-wrap">
					<div class="cart-item-name">${item.name}</div>
					<div class="cart-item-price-wrap">
						${price_info}
					</div>
					${freq_info}
					<a href="#" class="remove-button w-inline-block">
						<div class="text remove">Remove</div>
					</a>
				</div>
			</div>
			<div class="ticker-wrap">
				<div class="ticker-quantity">
					<input type="number" class="form-field ticker" min="0" max="6" placeholder="0" name="itemQuantity"
						value="${quantity}" readonly />
				</div>
			</div>
		</li>
		`);
	}

	function evaluateSub(storage = null) {
		if (storage === null) {
			storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		}

		if (storage.is_sub) {
			$('#delivered').show();
			$('.price.compare').removeClass('active');
			$('.price.black').show();
		} else {
			$('#delivered').hide();
			$('.price.compare').addClass('active');
			$('.price.black').hide();
		}
	}
	function resetCheckoutCart() {
		$('#build-your-box-form .cart-list .cart-item').remove();
		renderCheckoutFromStorage();
	}
	function renderMetaFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		let sub_btn = $('#subscribe').is(':checked');
		if (sub_btn != storage.is_sub) {
			$('#subscribe').click();
			evaluateSub(storage);
		}
		$('.select').val(storage.freq).trigger('change');
	}
	function renderBuildBoxFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		for (const item of storage) {
			updateBuildBoxQuantity(item.sku, item.quantity);
		}
	}
	function renderCheckoutFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));

		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			addCheckoutItem(item_data, item.quantity);
		}
		updateCartRender();
	}
	function updateCartRender() {
		const $emptyMessage = $('.empty-box');

		// Update subtotal
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		let is_sub = $('#subscribe').is(':checked');
		let subtotal = 0.00;
		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			if (is_sub) {
				subtotal += parseFloat(item_data.sub_price) * parseFloat(item.quantity);
			} else {
				subtotal += parseFloat(item_data.price) * parseFloat(item.quantity);
			}
		}
		$('#checkout-subtotal').html('$' + subtotal.toFixed(2));
		if (storage.length > 0) {
			$emptyMessage.hide();
		} else {
			$emptyMessage.show();
		}
		renderBoxCount();
	}
	function removeCartItem(sku) {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		storage = storage.filter((item) => item.sku != sku);
		localStorage.setItem('buildBox', JSON.stringify(storage));
		$(`#build-your-box-form .cart-list .cart-item[data-sku="${sku}"]`).remove();
		updateBuildBoxQuantity(sku, 0);
	}
	function updateBuildBoxQuantity(sku, quantity) {
		const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		$list_item.find('.ticker input').val(quantity);
	}
	function getItemDataFromSku(sku) {
		const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}
	function getItemData($el) {
		const $list_item = $el.closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}
	function getItemDataFromBuildBoxItem($el) {
		const $product_data = $el.find('.product-data input');
		let data = {
			freq: $('#subscribe').is(':checked') ? $('.product-select').val() : null
		};
		$product_data.each(function () {
			const name = $(this).attr('name');
			const value = $(this).attr('value');
			data[name] = value;
		});
		if (data.price) {
			data['sub_price'] = data.price - (data.price * 0.10);
		}
		return data;
	}

	// Initalize variables
	function init() {
		let cart_meta = localStorage.getItem('buildBoxMeta');
		if (cart_meta == null) {
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: true,
				freq: '1m'
			}));
		}

		let cart = localStorage.getItem('buildBox');
		if (cart == null || cart == "[]") {
			localStorage.setItem('buildBox', "[]");
		}
		renderBoxCount();
	}
	function renderBoxCount() {
		const boxData = JSON.parse(localStorage.getItem('buildBox'));
		let boxTotals = [];
		boxData.forEach(element => boxTotals.push(element.quantity));
		let boxCount = boxTotals.reduce((a, b) => a + b, 0);
		$('#boxCount').text(boxCount);
	}
});

$('.continue-checkout-button').click(function () {
	let boxStatus = localStorage.getItem('buildBox');
	if (boxStatus == "[]") {
		event.preventDefault();
		alert('Your Box is empty. Add some products to get started!');
	}
});