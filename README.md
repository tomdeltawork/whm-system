whm-system 是一個nextjs + pocketbase 建置的工時管理系統，可以讓User填報工時，如User具有管理權限則具備管理專案的權限

## Getting Started

First, run the development server:

```bash
npm install --legacy-peer-deps
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Vercel platform releaselink
Open [https://whm-system.vercel.app](https://whm-system.vercel.app)
    - email : tom.wu@example.com
    - password : delta666

## Note
- You need to add the **.env.local** configuration file to the project information, and add NEXT_PUBLIC_POCKETBASE_URL to set the key value. The value is your own PocketBase URL. ex.NEXT_PUBLIC_POCKETBASE_URL=https://XXX.pockethost.io
