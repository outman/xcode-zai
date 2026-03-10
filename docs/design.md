# Xcode-Zai 设计文档

## 概述

Xcode-Zai 是一个 API 代理服务，将 OpenAI 兼容格式的请求转换为智谱 AI (BigModel) API 请求。

## 功能

### 接口代理

将以下接口代理到智谱 AI API：

| 本地端点 | 目标端点 |
|----------|----------|
| `/v1/models` | `{TARGET_BASE}/models` |
| `/v1/chat/completions` | `{TARGET_BASE}/chat/completions` |

### 请求处理

1. **请求头转发**：转发客户端请求头，排除 hop-by-hop 头（host, connection, keep-alive, transfer-encoding, content-encoding, content-length）
2. **请求体转发**：支持 GET/POST 等所有 HTTP 方法，正确处理请求体
3. **Authorization 覆盖**：如果配置了 `API_KEY` 环境变量，将覆盖请求头中的 `Authorization` 字段

### 响应处理

1. **响应头转发**：转发目标服务器响应头，排除 hop-by-hop 头
2. **响应体透传**：原样返回目标服务器的响应体和状态码

### 日志记录

所有请求和响应都会在控制台输出详细日志，包括：
- 请求时间戳、方法、URL
- 请求头（敏感信息脱敏）
- 请求体（JSON 格式化）
- 响应状态码、响应头、响应体

## 配置

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `TARGET_BASE` | 目标 API 基础地址 | `https://open.bigmodel.cn/api/paas/v4` |
| `API_KEY` | API 密钥，配置后覆盖 Authorization | - |
| `PORT` | 服务监听端口 | `3000` |

## 技术栈

- **运行时**：Bun
- **Web 框架**：Hono
