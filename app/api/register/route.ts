// app/api/register/route.ts

import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(request: Request) {
  try {

    //Step1.  get data
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const data = await request.json();
    const register_data = {
        "username": data.username,
        "email": data.email,
        "emailVisibility": true,
        "password": data.password,
        "passwordConfirm": data.passwordConfirm,
        "name": data.name
    };

    //Step2. do register
    const record = await pb.collection('users').create(register_data);
    
    //Step3. return data
    return NextResponse.json(record);
  } catch (error: any) {
    console.error('PocketBase login error : ', error);
    if(error && error.response && error.response.code == 400){
      return NextResponse.json({ error: error }, { status: 500 });
    }else{
      return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
  }
}