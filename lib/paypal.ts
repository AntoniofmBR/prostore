const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"

export const paypal = {
  createOrder: async function createOrder(price: number) {
    const accessToken = await generateAccessToken()
    const url = `${base}/v2/checkout/orders`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: price,
            },
          }
        ],
      })
    })

    return handleResponse(res)
  },
  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken()
    const url = `${base}/v2/checkout/orders/${orderId}/capture`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return handleResponse(res)
  },
}

// Generate paypal access token
export async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`)
    .toString('base64')

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-type': 'application/x-www-form-urlencoded',
    },
  })

    const jsonData = await handleResponse(res)
    return jsonData.access_token
}

async function handleResponse(res:Response) {
  if (res.ok) {
    return await res.json()
  } else {
    const errorMessage = await res.text()
    throw new Error(errorMessage)
  }
}