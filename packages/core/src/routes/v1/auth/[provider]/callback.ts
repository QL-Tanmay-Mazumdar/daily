import dotenv from 'dotenv'

dotenv.config()

export default [
  {
    path: '/',
    method: 'get',
    middlewares: [],
    handler: async (req, res, next) => {
      const { provider } = req.params
      const { code } = req.query

      if (provider === 'github') {
        try {
          let response = await fetch(`${process.env.GITHUB_OAUTH_URL}/access_token`, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: process.env.GITHUB_CLIENT_ID,
              client_secret: process.env.GITHUB_CLIENT_SECRET,
              code,
              redirect_uri: process.env.GITHUB_REDIRECT_URL,
            })
          })

          if (!response.ok) {
            return res.status(400).json({ ok: false, message: 'GitHub OAuth Failed' })
          }

          const data = await response?.json()

          return res.status(200).json({ ok: true, data })
        } catch (err) {
          console.log(err)

          return res.status(400).json({ ok: false, message: 'Unsupported provider' })
        }
      }
    }
  }
]
