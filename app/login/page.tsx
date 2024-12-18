'use client'

import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { InfoMessage, SuccessMessage, WarningMessage, ErrorMessage } from '@/utils/message'
import { WithLoading } from '@/utils/loading';
import React from 'react'
import { useAuthStore } from '@/stores/authStore';
import PocketBase from 'pocketbase';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'warning' | 'error', content: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const { setAccessToken, setUserId, setUserName, setUserEmail, setLoginType } = useAuthStore();
  
  const MessageComponent = {
    info: InfoMessage,
    success: SuccessMessage,
    warning: WarningMessage,
    error: ErrorMessage
  }
  const googleLogin = async () => {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      const accessToken = authData.token;
      const userId = authData.record.id;
      const username = authData.record.username;
      const loginType = 'GOOGLE'
      setAccessToken(accessToken);
      setUserId(userId);
      setUserName(username);
      setUserEmail(email);
      setLoginType(loginType);
      setMessage({ type: 'success', content: '登入成功!!' })
      router.push('/projects')
    
    } catch (error: any) {
      console.error('PocketBase login error : ', error);
      if(error && error.response && error.response.code && error.response.code == 400){
        setMessage({ type: 'error', content: '登入失敗，請檢查帳號或密碼!!' })
      }else{
        setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
      }
      // console.error('PocketBase login error : ', error);
      // if(error && error.response && error.response.status == 401){
      //   setMessage({ type: 'error', content: '登入失敗，請檢查帳號或密碼!!' })
      // }else{
      //   setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
      // }
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
      const authData = await pb.collection('users').authWithPassword(
        email,
        password,
      );
      const accessToken = authData.token;
      const userId = authData.record.id;
      const username = authData.record.username;
      const loginType = 'NORMAL'
      setAccessToken(accessToken);
      setUserId(userId);
      setUserName(username);
      setUserEmail(email);
      setLoginType(loginType);
      setMessage({ type: 'success', content: '登入成功!!' })
      router.push('/projects')
    
    } catch (error: any) {
      console.error('PocketBase login error : ', error);
      if(error && error.response && error.response.code && error.response.code == 400){
        setMessage({ type: 'error', content: '登入失敗，請檢查帳號或密碼!!' })
      }else{
        setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
      }
      // if(error && error.response && error.response.status == 401){
      //   setMessage({ type: 'error', content: '登入失敗，請檢查帳號或密碼!!' })
      // }else{
      //   setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
      // }
    } finally {
      setLoading(false)
    }

    // e.preventDefault()
    // try {
    //   setLoading(true)
    //   const response = await axios.post('/api/login', { email, password })
    //   const accessToken = response.data.token;
    //   const userId = response.data.record.id;
    //   const username = response.data.record.username;
    //   const loginType = 'NORMAL'
    //   setAccessToken(accessToken);
    //   setUserId(userId);
    //   setUserName(username);
    //   setUserEmail(email);
    //   setLoginType(loginType);

    //   setMessage({ type: 'success', content: '登入成功!!' })
    //   router.push('/projects')
    // } catch (error: any) {
    //   console.error('PocketBase login error : ', error);
    //   if(error && error.response && error.response.status == 401){
    //     setMessage({ type: 'error', content: '登入失敗，請檢查帳號或密碼!!' })
    //   }else{
    //     setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
    //   }
    // } finally {
    //   setLoading(false)
    // }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-gray-900">登入</h2>
            <p className="text-gray-500">輸入您的帳號和密碼以登入系統</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="輸入您的密碼"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              登入
            </button>
            <button
              type="button"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => googleLogin()}
            >
              Google登入
            </button>
          </form>
          <div className="text-sm text-center text-gray-500">
            還沒有帳號？ 
            <Link href="/signup" legacyBehavior>
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                註冊
              </a>
            </Link>
          </div>
        </div>
      </div>
      {message && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 mt-4">
            {React.createElement(MessageComponent[message.type], {
              message: message.content,
              duration: 5000,
              onClose: () => setMessage(null)
            })}
          </div>
      )}
      <div>
        <WithLoading loading={loading}>
          <div></div>
        </WithLoading>
      </div>
    </div>
  )
}
