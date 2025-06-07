# Win List - Personal Task Management App

A modern, full-stack task management application built with Next.js, TypeScript, and Prisma.

## Prerequisites

-   Node.js 18+
-   Yarn package manager
-   PostgreSQL database (recommended: [NeonDB](https://neon.com/))
-   Google OAuth credentials

## Installation

1. **Clone the repository**

    ```bash
    git clone
    cd win-list
    ```

2. **Install dependencies**

    ```bash
    yarn install
    ```

3. **Set up environment variables**

    Copy the [.env.example](.env.example) file and fill in the variables and duplicate to .env and .env.test with appropriate values.

## Database Setup

1. **Create a PostgreSQL database**

2. **Generate Prisma client**

    ```bash
    npx prisma generate
    ```

3. **Run database migrations**

    ```bash
    npx prisma db push
    ```

    Note: To run tests, you will also need to push to the test database. (See scripts in package.json)

## Running the Application

### Development Mode

```bash
yarn dev
```

### Testing

```bash
yarn test
```

### Development

See [TODO.md](TODO.md) for suggested future improvements
