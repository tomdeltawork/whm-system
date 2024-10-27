// app/api/user/[id]/route.ts
import { NextResponse } from 'next/server';

// interface Context {
//   params: { id: string };
// }

export async function GET(request: Request,  params:any) {
  const id = params.id;
  
  // 現在可以使用 id 來進行後續操作，例如查詢資料庫等
  return NextResponse.json({ message: `User ID is ${id}` });
}

// import { NextResponse } from 'next/server';
// import PocketBase from 'pocketbase';

// interface Context {
//   params: { id: string };
// }

// export async function GET(request: Request, context: Context) {
//   try {
//     // Step1. Initialize PocketBase and get the ID from params
//     const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
//     const { id } = context.params;

//     // Step2. Retrieve the authorization token
//     const token = request.headers.get('Authorization')?.replace('Bearer ', '') as string;

//     // Step3. Set the token in PocketBase auth store and query the user record
//     pb.authStore.save(token, null);
//     const record = await pb.collection('users').getOne(id);

//     // Step4. Return the record data
//     return NextResponse.json(record);
//   } catch (error: unknown) {
//     console.error('PocketBase query user error:', error);
//     return NextResponse.json({ error: 'System error' }, { status: 500 });
//   }
// }
