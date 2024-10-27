// app/api/user/route.ts

import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
interface Params {
  params: { id: string };
}

export async function GET(request: Request, context: { params: { id: string } }) {
  try {

    //Step1.  get data
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const { id } = await context.params; // 使用 `await` 確保 `params` 被初始化
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') as string;
    
    //Step2. do query
    pb.authStore.save(token, null);
    const record = await pb.collection('users').getOne(id)
    
    //Step3. return data
    return NextResponse.json(record);
  } catch (error: any) {
    console.error('PocketBase query user error : ', error);
    return NextResponse.json({ error: 'System error' }, { status: 500 });
  }
}
