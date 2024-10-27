// app/api/login/route.ts

import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(request: Request) {
  try {
    //Step1.  get data
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const data = await request.json();
    const email = data.email;
    const password = data.password;

    //Step2. do login
    const authData = await pb.collection('users').authWithPassword(
      email,
      password,
    );
    
    //Step3. return data
    return NextResponse.json(authData);
  } catch (error: any) {
    console.error('PocketBase login error : ', error);
    if(error && error.response && error.response.code == 400){
      return NextResponse.json({ error: 'Authenticate error' }, { status: 401 });
    }else{
      return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
  }
}