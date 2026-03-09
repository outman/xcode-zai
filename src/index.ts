import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// 使用日志中间件
app.use('*', logger())

const TARGET_BASE = 'https://open.bigmodel.cn/api/paas/v4'

// 通用代理函数
async function proxyRequest(c: any, targetPath: string) {
  const url = `${TARGET_BASE}${targetPath}`
  const method = c.req.method

  // 获取请求头，排除一些 hop-by-hop 头
  const headers = new Headers()
  const hopByHopHeaders = ['host', 'connection', 'keep-alive', 'transfer-encoding', 'content-encoding', 'content-length']

  c.req.raw.headers.forEach((value: string, key: string) => {
    if (!hopByHopHeaders.includes(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  // 获取请求体
  let body: string | undefined
  if (method !== 'GET' && method !== 'HEAD') {
    body = await c.req.text()
  }

  // 打印请求日志
  console.log('\n========================================')
  console.log(`[${new Date().toISOString()}] ${method} ${url}`)
  console.log('Request Headers:')
  headers.forEach((value, key) => {
    // 对敏感信息进行脱敏
    if (key.toLowerCase() === 'authorization') {
      console.log(`  ${key}: ${value.substring(0, 15)}...`)
    } else {
      console.log(`  ${key}: ${value}`)
    }
  })
  if (body) {
    console.log('Request Body:')
    try {
      const jsonBody = JSON.parse(body)
      console.log(JSON.stringify(jsonBody, null, 2))
    } catch {
      console.log(body)
    }
  }

  // 发送请求到目标服务器
  const response = await fetch(url, {
    method,
    headers,
    body: body || undefined,
  })

  // 打印响应日志
  console.log('----------------------------------------')
  console.log(`Response Status: ${response.status}`)
  console.log('Response Headers:')
  response.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`)
  })

  // 获取响应体用于日志
  const responseText = await response.text()
  console.log('Response Body:')
  try {
    const jsonResponse = JSON.parse(responseText)
    console.log(JSON.stringify(jsonResponse, null, 2))
  } catch {
    console.log(responseText)
  }
  console.log('========================================\n')

  // 构建响应头
  const responseHeaders = new Headers()
  response.headers.forEach((value, key) => {
    if (!hopByHopHeaders.includes(key.toLowerCase())) {
      responseHeaders.set(key, value)
    }
  })

  return new Response(responseText, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

// /v1/models -> https://open.bigmodel.cn/api/paas/v4/models
app.all('/v1/models', async (c) => {
  return proxyRequest(c, '/models')
})

// /v1/chat/completions -> https://open.bigmodel.cn/api/paas/v4/chat/completions
app.all('/v1/chat/completions', async (c) => {
  return proxyRequest(c, '/chat/completions')
})

// 健康检查
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Xcode-Zai Proxy Server',
    endpoints: [
      'GET/POST /v1/models',
      'GET/POST /v1/chat/completions',
    ],
  })
})

const port = process.env.PORT || 3000
console.log(`Server is running on http://localhost:${port}`)

export default app
