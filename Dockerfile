FROM oven/bun:1 AS base
WORKDIR /app

# 安装依赖
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 构建阶段
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .

# 运行阶段
FROM base AS release
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
