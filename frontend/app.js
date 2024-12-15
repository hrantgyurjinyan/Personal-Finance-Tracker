const expenseForm = document.getElementById('expenseForm')
const expenseList = document.getElementById('expenseList')
const reportList = document.getElementById('reportList') // Monthly report section


async function fetchExpenses() {
  try {
    const response = await fetch('http://localhost:5000/api/expenses')
    const expenses = await response.json()

    expenseList.innerHTML = ''
    reportList.innerHTML = '' // Clear the report section


    expenses.forEach(expense => {
      const listItem = document.createElement('li')
      listItem.innerHTML = `
        <span>${expense.title} - $${expense.amount} (${expense.category})</span>
        <span>${new Date(expense.created_at).toLocaleDateString()}</span>
      `
      expenseList.appendChild(listItem)
    })
    generateMonthlyReport(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

async function addExpense(event) {
  event.preventDefault()

  const title = document.getElementById('title').value
  const amount = document.getElementById('amount').value
  const category = document.getElementById('category').value

  try {
    const response = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({title, amount, category}),
    })

    if (response.ok) {
      expenseForm.reset()
      await fetchExpenses()
    } else {
      alert('Failed to add expense. Please try again.')
    }
  } catch (error) {
    console.error('Error adding expense:', error)
  }
}

expenseForm.addEventListener('submit', addExpense)

await fetchExpenses()

function generateMonthlyReport(expenses) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyReport = expenses.reduce((acc, expense) => {
    const expenseDate = new Date(expense.created_at)

    if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
      const category = expense.category
      const amount = parseFloat(expense.amount)

      if (!acc[category]) {
        acc[category] = 0
      }

      acc[category] += amount
    }

    return acc
  }, {})

  for (const [category, totalAmount] of Object.entries(monthlyReport)) {
    const listItem = document.createElement('li')
    listItem.innerHTML = `<span>${category}</span> - $${totalAmount.toFixed(2)}`
    reportList.appendChild(listItem)
  }
}


async function fetchMonthlyReport() {
  try {
    const response = await fetch('http://localhost:5000/api/expenses/report')
    const report = await response.json()

    const reportList = document.getElementById('reportList')
    reportList.innerHTML = ''

    report.forEach(item => {
      const listItem = document.createElement('li')
      listItem.innerHTML = `${item.category}: $${item.total}`
      reportList.appendChild(listItem)
    })
  } catch (error) {
    console.error('Error fetching monthly report:', error)
  }
}

// Call fetchMonthlyReport when the page loads
await fetchMonthlyReport()