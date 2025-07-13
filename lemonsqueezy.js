const fetch = require('node-fetch');

async function createCheckout(productId, quantity = 1) {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/checkouts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    });

    const data = await response.json();
    return data.data.attributes.url;
}

module.exports = { createCheckout };