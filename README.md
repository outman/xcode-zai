# Xcode-Zai

Xcode intelligence adapter for zai/bigmodel API.

## 环境配置

复制 `.env.example` 为 `.env` 并配置：

```sh
cp .env.example .env
```

环境变量说明：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `TARGET_BASE` | 目标 API 地址 | `https://open.bigmodel.cn/api/paas/v4` |
| `API_KEY` | API 密钥（可选，配置后将覆盖请求头中的 Authorization） | - |
| `PORT` | 服务端口 | `3000` |

## Development

安装依赖：

```sh
bun install
```

运行开发服务器：

```sh
bun run dev
```

访问 http://localhost:3000

## Docker

### 使用 Docker Compose（推荐）

```sh
docker compose up -d
```

### 构建 Docker 镜像

```sh
docker build -t xcode-zai .
```

运行容器：

```sh
docker run -d -p 3000:3000 \
  -e TARGET_BASE=https://open.bigmodel.cn/api/paas/v4 \
  -e API_KEY=your-api-key \
  xcode-zai
```

## API Endpoints

| 端点 | 说明 |
|------|------|
| `GET /` | 健康检查 |
| `GET/POST /v1/models` | 代理模型列表接口 |
| `GET/POST /v1/chat/completions` | 代理聊天补全接口 |
