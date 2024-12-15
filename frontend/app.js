const loginForm = document.getElementById('loginForm')
const expenseForm = document.getElementById('expenseForm')
const expenseList = document.getElementById('expenseList')
const reportList = document.getElementById('reportList') // Monthly report section

// Signup functionality
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = document.getElementById('signupUsername').value
  const email = document.getElementById('signupEmail').value
  const password = document.getElementById('signupPassword').value

  const response = await fetch('http://localhost:5000/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, email, password})
  })

  const result = await response.json()

  alert(result.message)

  if (response.ok) {
    window.location.href = 'login.html'  // Redirect to login after successful sign-up

  }
})

// Login functionality
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('loginEmail').value
  const password = document.getElementById('loginPassword').value

  const response = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  })

  const result = await response.json()

  if (response.ok) {
    localStorage.setItem('token', result.accessToken)
    localStorage.setItem('refreshToken', result.refreshToken)

    alert('Login successful!')

    window.location.href = 'dashboard.html'  // Redirect to the dashboard after successful login

  } else {
    alert(result.message)
  }
})

async function refreshToken() {
  // Implement logic to refresh the token by making a request to your refresh endpoint
  const response = await fetch('http://localhost:5000/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({token: localStorage.getItem('token')}),
  })

  if (response.ok) {
    const result = await response.json()
    return result.token
  }
  return null
}


async function fetchExpenses() {
  let newToken
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('You must be logged in to view expenses.')
      window.location.href = 'login.html'
      return
    }

    const response = await fetch('http://localhost:5000/api/expenses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Send token in Authorization header
      }
    })

    console.log('Response status:', response.status)
    const respond = await response.json()
    console.log('Response body:', JSON.stringify(respond))

    if (!response.ok && response.status === 401) {
      return fetchExpenses()
    }


    const expenses = await response.json()
    const expenseList = document.getElementById('expenseList')
    expenseList.innerHTML = ''

    expenses.forEach(expense => {
      const listItem = document.createElement('li')
      listItem.innerHTML = `
        <span>${expense.title} - $${expense.amount} (${expense.category})</span>
        <span>${new Date(expense.created_at).toLocaleDateString()}</span>
      `
      expenseList.appendChild(listItem)
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

// Add Expense function with token in Authorization header
async function addExpense(event) {
  event.preventDefault()

  const title = document.getElementById('title').value
  const amount = document.getElementById('amount').value
  const category = document.getElementById('category').value
  const token = localStorage.getItem('token') // Get token from localStorage

  if (!token) {
    alert('You must be logged in to add expenses.')
    return
  }

  try {
    const response = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token in Authorization header
      },
      body: JSON.stringify({title, amount, category}),
    })

    if (response.ok) {
      expenseForm.reset()
      await fetchExpenses() // Fetch expenses after adding
    } else {
      alert('Failed to add expense. Please try again.')
    }
  } catch (error) {
    console.error('Error adding expense:', error)
  }
}

expenseForm.addEventListener('submit', addExpense)

// Monthly Report function with token in Authorization header
async function fetchMonthlyReport() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You must be logged in to view the monthly report.')
      return
    }

    const response = await fetch('http://localhost:5000/api/expenses/report', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      alert('Failed to fetch monthly report. Please check your login status.')
      return
    }

    const report = await response.json()
    const reportList = document.getElementById('reportList')
    reportList.innerHTML = '' // Clear the list before adding new items

    report.forEach(item => {
      const listItem = document.createElement('li')
      listItem.innerHTML = `${item.category}: $${item.total}`
      reportList.appendChild(listItem)
    })
  } catch (error) {
    console.error('Error fetching monthly report:', error)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('TOKEN#########', token)
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (accessToken) {
    try {
      const response = await fetch('/api/expenses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-refresh-token': refreshToken, // Pass refresh token explicitly if needed
        },
      })

      if (response.status === 401) {
        // Handle expired access token
        console.log('Access token expired, refreshing...')
        const refreshResponse = await fetch('/api/refresh-token', {
          method: 'POST',
          body: JSON.stringify({refreshToken}),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          // Store the new access token
          localStorage.setItem('accessToken', data.accessToken)

          // Retry the original request
          await fetchExpenses() // or any other request you want to retry
        } else {
          console.log('Failed to refresh token. Redirecting to login.')
          window.location.href = 'login.html' // Redirect to login if refresh fails
        }
      } else if (response.ok) {
        const expenses = await response.json()
        console.log('Expenses:', expenses)
      } else {
        console.log('Failed to fetch expenses')
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  } else {
    window.location.href = 'login.html' // Redirect to login if no access token
  }
})