'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore';
import { InfoMessage, SuccessMessage, WarningMessage, ErrorMessage } from '@/utils/message'
import { WithLoading } from '@/utils/loading';
import React from 'react'

type Project = {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string
  name: string
  start_time: string
  end_time: string
  description: string
  enable: boolean
  note: string
  own_tasks: string[]
}

type FakeDataResponse = {
  page: number
  perPage: number
  totalPages: number
  totalItems: number
  items: Project[]
}


// const generateFakeData = (page: number, perPage: number): FakeDataResponse => {
//   const totalItems = 50
//   const items: Project[] = Array.from({ length: Math.min(perPage, totalItems - (page - 1) * perPage) }, (_, index) => ({
//     id: `RECORD_ID_${(page - 1) * perPage + index + 1}`,
//     collectionId: "w70knkydg6hxho5",
//     collectionName: "ait_whm_projects",
//     created: new Date().toISOString(),
//     updated: new Date().toISOString(),
//     name: `Project ${(page - 1) * perPage + index + 1}`,
//     start_time: new Date().toISOString(),
//     end_time: new Date(Date.now() + 86400000).toISOString(),
//     description: `Description for Project ${(page - 1) * perPage + index + 1}`,
//     enable: Math.random() > 0.5,
//     note: `Note for Project ${(page - 1) * perPage + index + 1}`,
//     own_tasks: ["RELATION_RECORD_ID_1", "RELATION_RECORD_ID_2"]
//   }))

//   return {
//     page,
//     perPage,
//     totalPages: Math.ceil(totalItems / perPage),
//     totalItems,
//     items
//   }
// }

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
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.75rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
      }
      select::-ms-expand {
        display: none;
      }
      select option {
        padding: 0.75rem 1rem;
      }
      input, select, textarea {
        transition: all 0.2s ease;
        border: 1px solid #d1d5db;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        line-height: 1.5;
        height: auto;
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'warning' | 'error', content: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const MessageComponent = {
    info: InfoMessage,
    success: SuccessMessage,
    warning: WarningMessage,
    error: ErrorMessage
  }
  
  const queryRealData = async (page: number, perPage: number): Promise<FakeDataResponse> => {
    const totalItems = 50
    const accessToken = useAuthStore.getState().accessToken;
    
    let items = [];
    try {
      setLoading(true)
      const response = await axios.get('/api/projects', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: 1,
          perPage: 10,
        },
      });
      console.log(response.data);
      items = response.data.records.items;
    } catch (error) {
      // 使用類型縮小來處理錯誤
      if (error instanceof Error) {
        setMessage({ type: 'error', content: error.message })
      } else {
        setMessage({ type: 'error', content: '系統繁忙中，請稍後在試' })
      }
    }finally {
      setLoading(false)
    }
  
    return {
      page,
      perPage,
      totalPages: Math.ceil(totalItems / perPage),
      totalItems,
      items
    }
  }

  useEffect(() => {
    async function fetchData() {
      const data = await queryRealData(currentPage, 10)
      setProjects(data.items)
      setTotalPages(data.totalPages)
    }
    
    fetchData();
  }, [currentPage])

  useEffect(() => {
    const body = document.body;
    if (isAddModalOpen || isEditModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      body.style.overflow = '';
      body.style.paddingRight = '';
    }
  }, [isAddModalOpen, isEditModalOpen]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    setIsEditModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const closeEditModal = () => {
    setCurrentProject(null);
    setIsEditModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault()
    // This is where you would handle form submission
    if (isEdit) {
      closeEditModal();
    } else {
      closeAddModal();
    }
  }

  const renderModal = (isEdit: boolean) => {
    const isOpen = isEdit ? isEditModalOpen : isAddModalOpen;
    const closeModal = isEdit ? closeEditModal : closeAddModal;

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Project' : 'Add New Project'}</h2>
          <form onSubmit={(e) => handleSubmit(e, isEdit)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={isEdit ? currentProject?.name : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                defaultValue={isEdit ? currentProject?.start_time.split('.')[0] : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                defaultValue={isEdit ? currentProject?.end_time.split('.')[0] : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={isEdit ? currentProject?.description : ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:border-gray-400"
                rows={3}
              ></textarea>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="enable" className="block text-sm font-medium text-gray-700">Status</label>
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
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
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
    <div className="min-h-screen bg-gray-100 p-8">
      <GlobalStyles />
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center transition duration-300 ease-in-out"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Project
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(project.start_time).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(project.end_time).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.enable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {project.enable ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditModal(project)} className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-300 ease-in-out">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition duration-300 ease-in-out">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="mr-2 px-3 py-1 border rounded text-sm disabled:opacity-50 transition duration-300 ease-in-out"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2 px-3 py-1 border rounded text-sm disabled:opacity-50 transition duration-300 ease-in-out"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderModal(false)} {/* Add Modal */}
      {renderModal(true)}  {/* Edit Modal */}

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
          {/* <div className="p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold">這是一個內容頁面</h1>
            <p>加載結束後顯示此內容</p>
          </div> */}
        </WithLoading>
      </div>

    </div>
  )
}