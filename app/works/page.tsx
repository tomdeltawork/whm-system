'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { InfoMessage, SuccessMessage, WarningMessage, ErrorMessage } from '@/utils/message'
import { WithLoading } from '@/utils/loading'
import React from 'react'
import PocketBase from 'pocketbase'

type Work = {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string
  name: string
  own_users: string
  own_projects: string
  note: string
  hour: number
  own_tasks: string
  start_date: string
  end_date: string
}

type FakeDataResponse = {
  page: number
  perPage: number
  totalPages: number
  totalItems: number
  items: Work[]
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

export default function WorkCRUD() {
  const [works, setWorks] = useState<Work[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentWork, setCurrentWork] = useState<Work | null>(null)
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'warning' | 'error', content: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const MessageComponent = {
    info: InfoMessage,
    success: SuccessMessage,
    warning: WarningMessage,
    error: ErrorMessage
  }
  
  async function fetchData() {
    const data = await queryRealData(currentPage, 10)
    setWorks(data.items)
    setTotalPages(data.totalPages)
  }

  async function updateWork(workData: Partial<Work>) {
    if (!currentWork) return
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection('ait_whm_works').update(currentWork.id, workData)
      console.log("update data : " + record)
      await fetchData()
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
    } finally {
      setLoading(false)
    }
  }

  async function insertWork(workData: Partial<Work>) {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection('ait_whm_works').create(workData)
      console.log("insert data : " + record)
      await fetchData()
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
    } finally {
      setLoading(false)
    }
  }
  
  async function deleteWork(work_id: string) {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      await pb.collection('ait_whm_works').delete(work_id)
      await fetchData()
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
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
      const records = await pb.collection('ait_whm_works').getList(page, perPage, {
        sort: '-created',
        expand: 'own_users,own_projects,own_tasks',
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
    if (isAddModalOpen || isEditModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      body.style.overflow = 'hidden'
      body.style.paddingRight = `${scrollBarWidth}px`
    } else {
      body.style.overflow = ''
      body.style.paddingRight = ''
    }
  }, [isAddModalOpen, isEditModalOpen])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const openAddModal = () => {
    setIsAddModalOpen(true)
  }

  const openEditModal = (work: Work) => {
    setCurrentWork(work)
    setIsEditModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
  }

  const closeEditModal = () => {
    setCurrentWork(null)
    setIsEditModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const workData = {
      name: formData.get('name') as string,
      own_users: formData.get('own_users') as string,
      own_projects: formData.get('own_projects') as string,
      note: formData.get('note') as string,
      hour: parseFloat(formData.get('hour') as string),
      own_tasks: formData.get('own_tasks') as string,
      start_date: new Date(formData.get('start_date') as string).toISOString(),
      end_date: new Date(formData.get('end_date') as string).toISOString(),
    }
    if (isEdit) {
      await updateWork(workData)
      closeEditModal()
    } else {
      await insertWork(workData)
      closeAddModal()
    }
  }

  const renderModal = (isEdit: boolean) => {
    const isOpen = isEdit ? isEditModalOpen : isAddModalOpen
    const closeModal = isEdit ? closeEditModal : closeAddModal
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-lg shadow-xl p-4 w-full max-w-md transform transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <h2 className="text-lg font-bold mb-3">{isEdit ? 'Edit Work' : 'Add New Work'}</h2>
          <form onSubmit={(e) => handleSubmit(e, isEdit)} className="text-sm">
            <div className="mb-3">
              <label htmlFor="name" className="block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={isEdit ? currentWork?.name : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="own_users" className="block text-xs font-medium text-gray-700">User</label>
              <input
                type="text"
                id="own_users"
                name="own_users"
                defaultValue={isEdit ? currentWork?.own_users : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="own_projects" className="block text-xs font-medium text-gray-700">Project</label>
              <input
                type="text"
                id="own_projects"
                name="own_projects"
                defaultValue={isEdit ? currentWork?.own_projects : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="note" className="block text-xs font-medium text-gray-700">Note</label>
              <textarea
                id="note"
                name="note"
                defaultValue={isEdit ? currentWork?.note : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                rows={3}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="hour" className="block text-xs font-medium text-gray-700">Hours</label>
              <input
                type="number"
                id="hour"
                name="hour"
                step="0.1"
                defaultValue={isEdit ? currentWork?.hour : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="own_tasks" className="block text-xs font-medium text-gray-700">Task</label>
              <input
                type="text"
                id="own_tasks"
                name="own_tasks"
                defaultValue={isEdit ? currentWork?.own_tasks : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="start_date" className="block text-xs font-medium text-gray-700">Start Date</label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                defaultValue={isEdit ? currentWork?.start_date.split('.')[0] : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="end_date" className="block text-xs font-medium text-gray-700">End Date</label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                defaultValue={isEdit ? currentWork?.end_date.split('.')[0] : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                
                onClick={closeModal}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
              >
                {isEdit ? 'Update' : 'Create'}
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
            <h1 className="text-xl font-bold text-gray-900">Works</h1>
            <button
              onClick={openAddModal}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center transition duration-300 ease-in-out"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Work
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {works.map((work) => (
                  <tr key={work.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{work.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{work.own_users}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{work.own_projects}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{work.hour}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(work.start_date).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(work.end_date).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium">
                      <button onClick={() => openEditModal(work)} className="text-indigo-600 hover:text-indigo-900 mr-3 transition duration-300 ease-in-out">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteWork(work.id)} className="text-red-600 hover:text-red-900 transition duration-300 ease-in-out">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
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

      {renderModal(false)}
      {renderModal(true)}

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