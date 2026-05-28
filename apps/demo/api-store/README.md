# API Store Demo

API marketplace demo application with authentication for individuals and organizations.

## Features

- Individual user signup and login
- Organization signup with KYC profile
- NextAuth.js credential authentication
- PostgreSQL database with Prisma ORM

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up the database:
```bash
pnpm prisma migrate dev
```

3. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

## Database

PostgreSQL: `postgresql://user:trustlayer123@127.0.0.1:5501/demo-api-store`

## Project Structure

- `/app/(auth)/` - Authentication pages (login, signup)
- `/app/api/auth/` - NextAuth API routes
- `/app/api/users/` - User registration API
- `/prisma/` - Database schema
