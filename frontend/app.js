const expenseForm = document.getElementById('expenseForm')
const expenseList = document.getElementById('expenseList')

async function fetchExpenses() {
  try {
    const response = await fetch('http://localhost:5000/api/expenses')
    const expenses = await response.json()

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

// Add new expense
export async function addExpense(event) {
  event.preventDefault()

  const title = document.getElementById('title').value
  const amount = document.getElementById('amount').value
  const category = document.getElementById('category').value

  try {
    const response = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({title, amount, category})
    })

    if (response.ok) {
      expenseForm.reset()
      await fetchExpenses()  // Refresh the expenses list
    } else {
      alert('Failed to add expense. Please try again.')
    }
  } catch (error) {
    console.error('Error adding expense:', error)
  }
}

expenseForm.addEventListener('submit', addExpense)

// Fetch expenses when the page loads
await fetchExpenses()
