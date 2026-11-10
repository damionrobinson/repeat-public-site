// Checkout settings for buy.html and thanks.html. The only file to change when
// moving from the Paddle sandbox to live: swap all four values together, because
// sandbox tokens and price IDs don't exist in live (and the reverse).
//
// - PADDLE_ENV: 'sandbox' or 'production'.
// - PADDLE_CLIENT_TOKEN: Paddle > Developer tools > Authentication > client-side
//   token (test_... in sandbox, live_... in live). Safe to publish; it can only
//   open checkouts.
// - LICENCE_PRICE_ID: the one-time "Repeat licence, 1 year" price (pri_...).
// - LICENCE_SERVER_URL: where repeat-licence-server runs, with a trailing slash.
//   thanks.html reads GET /purchase?transaction_id=... from it.
//
// While any of these is empty, buy.html shows "not on sale yet" and opens nothing.
window.REPEAT_CHECKOUT = {
  PADDLE_ENV: 'sandbox',
  PADDLE_CLIENT_TOKEN: 'test_b0f78e86b753ea36da2915d91f7',
  LICENCE_PRICE_ID: 'pri_01m72hbtc123se0cc2bwcf4czj',
  LICENCE_SERVER_URL: 'https://licence.repeit.com/'
};
