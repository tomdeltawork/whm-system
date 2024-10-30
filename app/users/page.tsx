'use client'

import { useState, useEffect, Fragment } from 'react'
import { PencilIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from 'lucide-react'
import { InfoMessage, SuccessMessage, WarningMessage, ErrorMessage } from '@/utils/message'
import { WithLoading } from '@/utils/loading'
import { Listbox, Transition } from '@headlessui/react'
import PocketBase, { RecordModel } from 'pocketbase'
import React from 'react'

const FallbackMessage = ({ message, duration, onClose }: { message: string, duration: number, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
      <p>{message}</p>
    </div>
  );
};

const MessageComponent = {
  info: InfoMessage || FallbackMessage,
  success: SuccessMessage || FallbackMessage,
  warning: WarningMessage || FallbackMessage,
  error: ErrorMessage || FallbackMessage
};

type User = {
  id: string
  collectionId: string
  collectionName: string
  username: string
  verified: boolean
  emailVisibility: boolean
  email: string
  created: string
  updated: string
  name: string
  avatar: string
  ait_whm_roles: string[]
}

type FakeDataResponse = {
  page: number
  perPage: number
  totalPages: number
  totalItems: number
  items: User[]
}

const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
      }
      select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
      }
      input, select, textarea {
        transition: all 0.2s ease;
        border: 1px solid #d1d5db;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        line-height: 1.25;
      }
      input:hover, select:hover, textarea:hover {
        border-color: #9ca3af;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  return null
}

const ROLES = ['Admin', 'Normal', 'Other']

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'warning' | 'error', content: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    const data = await queryRealData(currentPage, 10)
    setUsers(data.items)
    setTotalPages(data.totalPages)
  }

  async function updateUser(userData: Partial<User>) {
    if (!currentUser) return
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection('users').update(currentUser.id, userData)
      console.log("update data : " + record)
      await fetchData()
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      if(error.response.code == '404'){
        setMessage({ type: 'error', content: '未授權進行此操作!!' })
      }else{
        setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function queryRealData(page: number, perPage: number): Promise<FakeDataResponse> {
    let items: any = []
    const totalItems = 50
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const records = await pb.collection('users').getList(page, perPage, {
        sort: '-created',
      })
      items = records.items
      return {
        page: records.page,
        perPage: records.perPage,
        totalPages: records.totalPages,
        totalItems: records.totalItems,
        items
      }
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
      return {
        page,
        perPage,
        totalPages: Math.ceil(totalItems / perPage),
        totalItems,
        items
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage])

  useEffect(() => {
    const body = document.body
    if (isEditModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      body.style.overflow = 'hidden'
      body.style.paddingRight = `${scrollBarWidth}px`
    } else {
      body.style.overflow = ''
      body.style.paddingRight = ''
    }
  }, [isEditModalOpen])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const openEditModal = (user: User) => {
    setCurrentUser(user)
    setSelectedRoles(user.ait_whm_roles)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setCurrentUser(null)
    setSelectedRoles([])
    setIsEditModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentUser) return
    const userData = {
      ait_whm_roles: selectedRoles,
    }
    await updateUser(userData)
    closeEditModal()
  }

  const renderModal = () => {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isEditModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-lg shadow-xl p-4 w-full max-w-md transform transition-all duration-300 ease-in-out ${isEditModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <h2 className="text-lg font-bold mb-3">Edit User Roles</h2>
          <form onSubmit={handleSubmit} className="text-sm">
            <div className="mb-3">
              <label htmlFor="ait_whm_roles" className="block text-xs font-medium text-gray-700 mb-1">Roles</label>
              <Listbox value={selectedRoles} onChange={setSelectedRoles} multiple>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">
                      {selectedRoles.length === 0
                        ? 'Select roles'
                        : selectedRoles.join(', ')}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronLeftIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {ROLES.map((role) => (
                        <Listbox.Option
                          key={role}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                            }`
                          }
                          value={role}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {role}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 text-sm">
      <GlobalStyles />
      <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{user.username}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{user.ait_whm_roles.join(', ')}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium">
                      <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 transition duration-300 ease-in-out">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex  items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="mr-2 px-2 py-1 border rounded text-xs disabled:opacity-50 transition duration-300 ease-in-out"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2 px-2 py-1 border rounded text-xs disabled:opacity-50 transition duration-300 ease-in-out"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderModal()}

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