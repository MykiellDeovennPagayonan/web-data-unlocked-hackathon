# Job Board Demo

Job board demo application with authentication for job seekers and employers.

## Features

- Individual user signup (job seekers)
- Organization signup (employers) with company profile
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

Open [http://localhost:3002](http://localhost:3002) with your browser.

## Database

PostgreSQL: `postgresql://user:trustlayer123@127.0.0.1:5501/demo-job-board`

## Project Structure

- `/app/(auth)/` - Authentication pages (login, signup)
- `/app/api/auth/` - NextAuth API routes
- `/app/api/users/` - User registration API
- `/prisma/` - Database schema
