import express from 'express';
import axios from 'axios';

const router = express.Router();

// === Define the checkout route ===
router.post('/api/create-checkout', async (req, res) => {
  const { variantId, email } = req.body;

  if (!variantId || !email) {
    return res.status(400).json({ message: 'Missing variantId or email' });
  }

  try {
    const response = await axios.post(
      'https://api.lemonsqueezy.com/v1/checkouts',
      {
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email,
            },
            product_options: {
              enabled_variants: [variantId],
            },
            store_id: parseInt(process.env.LEMONSQUEEZY_STORE_ID!)
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
        },
      }
    );

    const checkoutUrl = response.data.data.attributes.url;
    res.status(200).json({ url: checkoutUrl });
  } catch (error: any) {
    console.error(
      'Lemon Squeezy Checkout Error:',
      error.response?.data || error.message
    );
    res.status(500).json({
      message: 'Checkout failed',
      error: error.response?.data,
    });
  }
});

export default router;
