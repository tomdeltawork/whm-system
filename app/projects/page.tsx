'use client'

import { useState, useEffect, Fragment } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
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

type Project = {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string
  name: string
  description: string
  enable: boolean
  start_time: string
  end_time: string
  note: string
  own_tasks: string[]
}

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
  items: Project[]
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

export default function ProjectCRUD() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'warning' | 'error', content: string } | null>(null)
  const [loading, setLoading] = useState(false)
  
  async function fetchData() {
    const data = await queryRealData(currentPage, 10)
    setProjects(data.items)
    setTotalPages(data.totalPages)
  }

  async function fetchTasks() {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const records = await pb.collection('ait_whm_tasks').getList(1, 50, {
        sort: 'name',
      })

      // 將 RecordModel[] 轉換為符合 Task[] 結構的資料
      const formattedTasks: Task[] = records.items.map((record: RecordModel) => ({
        id: record.id,
        collectionId: record.collectionId,
        collectionName: record.collectionName,
        created: record.created,
        updated: record.updated,
        name: record.name,
        note: record.note,
        type: 'default' // 可以依需求設定默認值或從其他來源取得
      }))

      setTasks(formattedTasks)
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
    } finally {
      setLoading(false)
    }
  }

  async function updateProject(projectData: Partial<Project>) {
    if (!currentProject) return
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection('ait_whm_projects').update(currentProject.id, projectData)
      console.log("update data : " + record)
      await fetchData()
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
    } finally {
      setLoading(false)
    }
  }

  async function insertProject(projectData: Partial<Project>) {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection('ait_whm_projects').create(projectData)
      console.log("insert data : " + record)
      await fetchData()
    } catch (error: any) {
      console.error('PocketBase error : ', error)
      setMessage({ type: 'error', content: '系統繁忙中，請稍後在試!!' })
    } finally {
      setLoading(false)
    }
  }
  
  async function deleteProject(project_id: string) {
    try {
      setLoading(true)
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      await pb.collection('ait_whm_projects').delete(project_id)
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
      const records = await pb.collection('ait_whm_projects').getList(page, perPage, {
        sort: '-created',
        expand: 'own_tasks',
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
    fetchTasks()
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
    setSelectedTasks([])
    setIsAddModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setCurrentProject(project)
    setSelectedTasks(tasks.filter(task => project.own_tasks.includes(task.id)))
    setIsEditModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
  }

  const closeEditModal = () => {
    setCurrentProject(null)
    setSelectedTasks([])
    setIsEditModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const start_time = new Date(formData.get('start_time') as string)
    const end_time = new Date(formData.get('end_time') as string)
    const projectData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      enable: formData.get('enable') === 'true',
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString(),
      note: formData.get('note') as string,
      own_tasks: selectedTasks.map(task => task.id),
    }
    if (isEdit) {
      await updateProject(projectData)
      closeEditModal()
    } else {
      await insertProject(projectData)
      closeAddModal()
    }
  }

  const renderModal = (isEdit: boolean) => {
    const isOpen = isEdit ? isEditModalOpen : isAddModalOpen
    const closeModal = isEdit ? closeEditModal : closeAddModal
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-lg shadow-xl p-4 w-full max-w-md transform transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <h2 className="text-lg font-bold mb-3">{isEdit ? 'Edit Project' : 'Add New Project'}</h2>
          <form onSubmit={(e) => handleSubmit(e, isEdit)} className="text-sm">
            <div className="mb-3">
              <label htmlFor="name" className="block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={isEdit ? currentProject?.name : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="block text-xs font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={isEdit ? currentProject?.description : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                rows={3}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="start_time" className="block text-xs font-medium text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                defaultValue={isEdit ? currentProject?.start_time.split('.')[0] : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="end_time" className="block text-xs font-medium text-gray-700">End Time</label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                defaultValue={isEdit ? currentProject?.end_time.split('.')[0] : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-3 relative">
              <label htmlFor="enable" className="block text-xs font-medium text-gray-700">Status</label>
              <div className="relative">
                <select
                  id="enable"
                  name="enable"
                  defaultValue={isEdit ? (currentProject?.enable ? 'true' : 'false') : 'true'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="note" className="block text-xs font-medium text-gray-700">Note</label>
              <textarea
                id="note"
                name="note"
                defaultValue={isEdit ? currentProject?.note : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                rows={3}
              
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="own_tasks" className="block text-xs font-medium text-gray-700 mb-1">Tasks</label>
              <Listbox value={selectedTasks} onChange={setSelectedTasks} multiple>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">
                      {selectedTasks.length === 0
                        ? 'Select tasks'
                        : `${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''} selected`}
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
                      {tasks.map((task) => (
                        <Listbox.Option
                          key={task.id}
                          className={({ active }: { active: boolean }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                            }`
                          }
                          value={task}
                        >
                          {({ selected }: { selected: boolean }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {task.name}
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
            <h1 className="text-xl font-bold text-gray-900">Projects</h1>
            <button
              onClick={openAddModal}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center transition duration-300 ease-in-out"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Project
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{project.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{project.description}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(project.start_time).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(project.end_time).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.enable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {project.enable ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium">
                      <button onClick={() => openEditModal(project)} className="text-indigo-600 hover:text-indigo-900 mr-3 transition duration-300 ease-in-out">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProject(project.id)} className="text-red-600 hover:text-red-900 transition duration-300 ease-in-out">
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