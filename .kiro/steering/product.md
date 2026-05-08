# MarketHub — Product Overview

MarketHub is a Vietnamese e-commerce platform (graduation project) that connects buyers, sellers, and administrators through three separate applications sharing a single backend API.

## User Roles

- **Buyers** — browse products, manage cart, checkout, track orders, request returns, write reviews, follow shops, use chatbot support
- **Sellers** — register a shop, list products with variants, manage orders, issue coupons, view sales analytics
- **Admins** — approve/reject seller applications, manage all entities (users, shops, products, categories, orders, reviews, returns, transactions), view platform-wide analytics

## Core Features

- Product catalog with variants, attributes, tags, and category hierarchy
- Multi-shop marketplace (one seller → one shop)
- Checkout with Momo and VNPay payment gateways, plus COD
- Shipment tracking
- Coupon / discount system
- Product reviews and ratings
- Return request workflow
- Real-time notifications via WebSocket
- AI chatbot powered by Ollama (local LLM)
- Product recommendation and user behavior tracking
- Product comparison

## Language

The codebase and internal documentation mix Vietnamese and English. UI-facing strings are in Vietnamese. Code identifiers, API fields, and schema names are in English.
