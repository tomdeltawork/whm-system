'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { InfoMessage, SuccessMessage, WarningMessage, ErrorMessage } from '@/utils/message'
import { WithLoading } from '@/utils/loading'
import React from 'react'
import PocketBase from 'pocketbase'

type Task = {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string
  name: string
  note: string
  type: string
}

type FakeDataResponse = {
  page: number
  perPage: number
  totalPages: number
  totalItems: number
  items: Task[]
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

export default function TaskCRUD() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
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
    setTasks(data.items)
    setTotalPages(data.totalPages)
  }

  async function updateTask(taskData: Partial<Task>) {
    if (!currentTask) return
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection('ait_whm_tasks').update(currentTask.id, taskData)
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

  async function insertTask(taskData: Partial<Task>) {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection('ait_whm_tasks').create(taskData)
      console.log("insert data : " + record)
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
  
  async function deleteTask(task_id: string) {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      await pb.collection('ait_whm_tasks').delete(task_id)
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
      const records = await pb.collection('ait_whm_tasks').getList(page, perPage, {
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

  const openEditModal = (task: Task) => {
    setCurrentTask(task)
    setIsEditModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
  }

  const closeEditModal = () => {
    setCurrentTask(null)
    setIsEditModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const taskData = {
      name: formData.get('name') as string,
      note: formData.get('note') as string,
      type: formData.get('type') as string,
    }
    if (isEdit) {
      await updateTask(taskData)
      closeEditModal()
    } else {
      await insertTask(taskData)
      closeAddModal()
    }
  }

  const renderModal = (isEdit: boolean) => {
    const isOpen = isEdit ? isEditModalOpen : isAddModalOpen
    const closeModal = isEdit ? closeEditModal : closeAddModal
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-lg shadow-xl p-4 w-full max-w-md transform transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <h2 className="text-lg font-bold mb-3">{isEdit ? 'Edit Task' : 'Add New Task'}</h2>
          <form onSubmit={(e) => handleSubmit(e, isEdit)} className="text-sm">
            <div className="mb-3">
              <label htmlFor="name" className="block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={isEdit ? currentTask?.name : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="note" className="block text-xs font-medium text-gray-700">Note</label>
              <textarea
                id="note"
                name="note"
                defaultValue={isEdit ? currentTask?.note : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                rows={3}
              ></textarea>
            </div>
            <div className="mb-3 relative">
              <label htmlFor="type" className="block text-xs font-medium text-gray-700">Type</label>
              <div className="relative">
                <select
                  id="type"
                  name="type"
                  defaultValue={isEdit ? currentTask?.type : 'COMMON'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                >
                  <option value="COMMON">Common</option>
                  <option value="URGENT">Urgent</option>
                  <option value="IMPORTANT">Important</option>
                </select>
              </div>
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
            <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
            <button
              onClick={openAddModal}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center transition duration-300 ease-in-out"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{task.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.type === 'URGENT' ? 'bg-red-100 text-red-800' :
                        task.type === 'IMPORTANT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(task.created).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium">
                      <button onClick={() =>   openEditModal(task)} className="text-indigo-600 hover:text-indigo-900 mr-3 transition duration-300 ease-in-out">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-900 transition duration-300 ease-in-out">
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