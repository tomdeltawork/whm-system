import React from 'react'

const DynamicPage: React.FC<{ pathname: string }> = ({ pathname }) => {
  switch (pathname) {
    case '/':
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">歡迎來到儀表板</h1>
          <p>這裡是您的主要內容區域。您可以在此處查看重要的統計數據和概覽。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">總用戶數</h2>
              <p className="text-3xl font-bold">10,234</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">本月收入</h2>
              <p className="text-3xl font-bold">$52,345</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">活躍專案</h2>
              <p className="text-3xl font-bold">23</p>
            </div>
          </div>
        </div>
      )
    case '/projects':
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">專案列表</h1>
          <p>這裡顯示了所有正在進行的專案。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['網站重新設計', '移動應用開發', '數據分析平台'].map((project, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">{project}</h2>
                <p className="text-sm text-gray-600">進行中</p>
              </div>
            ))}
          </div>
        </div>
      )
    case '/team':
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">團隊成員</h1>
          <p>這裡列出了您的團隊成員。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['張三', '李四', '王五'].map((member, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <h2 className="text-lg font-semibold">{member}</h2>
                  <p className="text-sm text-gray-600">開發者</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    case '/calendar':
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">日曆</h1>
          <p>這裡顯示了您的日程安排。</p>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">今日日程</h2>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>團隊會議</span>
                <span className="text-gray-600">10:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>客戶電話</span>
                <span className="text-gray-600">2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>項目審核</span>
                <span className="text-gray-600">4:30 PM</span>
              </li>
            </ul>
          </div>
        </div>
      )
    case '/documents':
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">文件</h1>
          <p>這裡列出了您的重要文件。</p>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">最近文件</h2>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>項目提案.docx</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>財務報表.xlsx</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>會議記錄.pdf</span>
              </li>
            </ul>
          </div>
        </div>
      )
    default:
      return <div>頁面不存在</div>
  }
}

export default DynamicPage