// viewReport.js
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    alert('You must be logged in to view the report.')
    window.location.href = 'login.html'
    return
  }

  const response = await fetch('http://localhost:5000/api/expenses/report', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    alert('Failed to fetch report')
    return
  }

  const report = await response.json()
  const reportList = document.getElementById('reportList')
  reportList.innerHTML = ''

  report.forEach(item => {
    const listItem = document.createElement('li')
    listItem.innerHTML = `${item.category}: $${item.total}`
    reportList.appendChild(listItem)
  })
})
