ARG RUBY_VERSION=3.3.7
ARG NODE_VERSION=23

FROM docker.io/library/ruby:$RUBY_VERSION-slim AS rails_base

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips libpq-dev libyaml-dev && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# Throw-away build stage to reduce size of final image
FROM rails_base AS build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY ./apps/api/Gemfile ./apps/api/Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Copy application code
COPY ./apps/api .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Final stage for app image
FROM rails_base AS api

# Copy built artifacts: gems, application
COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails db log tmp
USER 1000:1000

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 3000
CMD ["./bin/thrust", "./bin/rails", "server"]

FROM docker.io/library/node:$NODE_VERSION-slim AS node

ENV TZ=UTC
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM node AS builder

COPY . /usr/src
WORKDIR /usr/src

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm --filter @live-chat/web build

FROM openresty/openresty:alpine AS web

COPY --from=builder /usr/src/apps/web/dist /usr/share/nginx/html

# Create Lua script directory
RUN mkdir -p /usr/local/openresty/nginx/conf/lua

# Modified Lua script with better URL handling
COPY <<EOF /usr/local/openresty/nginx/conf/lua/proxy.lua
local _M = {}

function _M.get_upstream()
    local api_url = os.getenv("VITE_API_URL")
    if not api_url then
        return "http://server:3000"  -- Default to Docker service name
    end
    -- Remove trailing slash if exists
    if api_url:sub(-1) == "/" then
        api_url = api_url:sub(1, -2)
    end
    return api_url
end

return _M
EOF

# Nginx config with Lua and debug logging
COPY <<EOF /etc/nginx/conf.d/default.conf
lua_package_path "/usr/local/openresty/nginx/conf/lua/?.lua;;";

resolver 127.0.0.11 valid=30s ipv6=off;

server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    set \$target '';

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        access_by_lua_block {
            local proxy = require "proxy"
            ngx.var.target = proxy.get_upstream()
        }

        rewrite ^/api/(.*) /\$1 break;
        proxy_pass \$target;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Add error logging
        error_log /dev/stderr debug;
    }

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

RUN chown -R nobody:nobody /usr/share/nginx/html

EXPOSE 8080
CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]