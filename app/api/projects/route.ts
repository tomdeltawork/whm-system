// app/api/hello/route.ts

import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET(request: Request) {

  //Step1. get input
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') as string;
  pb.authStore.save(token, null);

  //Step2. do query
  try {
    // 從 PocketBase 中的 'users' 集合中獲取記錄
    const records = await pb.collection('ait_whm_projects').getList();

    // 將數據以 JSON 格式返回
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Failed to fetch records from PocketBase:', error);
    return NextResponse.json({ error: 'System error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  try {
    // 解析請求中的 JSON 數據
    const { email, password } = await request.json();

    // 使用 PocketBase 認證用戶
    const authData = await pb.collection('users').authWithPassword(email, password);

    // 返回登入成功的 token 和用戶信息
    return NextResponse.json({
      token: authData.token,
      user: authData.record,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Login failed:', error);
    
    // 返回錯誤信息
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
}