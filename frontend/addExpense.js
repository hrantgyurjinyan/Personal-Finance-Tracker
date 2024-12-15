// addExpense.js
document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const title = document.getElementById('title').value
  const amount = document.getElementById('amount').value
  const category = document.getElementById('category').value
  const token = localStorage.getItem('token')

  if (!token) {
    alert('You must be logged in to add expenses.')
    return
  }

  try {
    const response = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({title, amount, category}),
    })

    if (response.ok) {
      alert('Expense added successfully!')
      window.location.href = 'dashboard.html' // Redirect back to dashboard or expense list
    } else {
      alert('Failed to add expense.')
    }
  } catch (error) {
    console.error('Error adding expense:', error)
  }
})
