// Checkout settings for buy.html and thanks.html. The only file to change when
// moving from the Paddle sandbox to live: swap these values together, because
// sandbox tokens and price IDs don't exist in live (and the reverse).
//
// - PADDLE_ENV: 'sandbox' or 'production'.
// - PADDLE_CLIENT_TOKEN: Paddle > Developer tools > Authentication > client-side
//   token (test_... in sandbox, live_... in live). Safe to publish; it can only
//   open checkouts.
// - LICENCE_PRICE_ID: the one-time "Repeit licence, 1 year" price (pri_...), the
//   Yearly card.
// - PAY_ONCE_PRICE_ID: the one-time "Pay once: keep it for good, 5 years of
//   updates, up to 3 devices" price (pri_...), £119 · €135 · $149 (founder,
//   23 Nov 2026). It must also be listed in REPEAT_PAY_ONCE_PRICE_IDS on the
//   licence server, or buyers get a 1-year key. Empty until the founder creates
//   it in Paddle: the Pay once card then shows "coming soon" and opens nothing.
// - LICENCE_SERVER_URL: where repeat-licence-server runs, with a trailing slash.
//   thanks.html reads GET /purchase?transaction_id=... from it.
//
// The old "Lifetime" price (pri_01m77fq4e6nm2pjrm139he5x3f, £99) must no longer
// be offered anywhere: the founder replaced it with Pay once on 23 Nov 2026.
// Keys already sold on it stay unlimited on the licence server.
//
// While the token or LICENCE_PRICE_ID is empty, buy.html shows "not on sale yet"
// and opens nothing.
window.REPEAT_CHECKOUT = {
  PADDLE_ENV: 'sandbox',
  PADDLE_CLIENT_TOKEN: 'test_b0f78e86b753ea36da2915d91f7',
  LICENCE_PRICE_ID: 'pri_01m72hbtc123se0cc2bwcf4czj',
  PAY_ONCE_PRICE_ID: 'pri_01m84dp8ge5a6x4m2exw5y1skv',
  LICENCE_SERVER_URL: 'https://licence.repeit.com/'
};
