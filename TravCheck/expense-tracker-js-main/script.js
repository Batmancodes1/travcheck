const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const balanceDisplay = document.getElementById('balance');
const incomeDisplay = document.getElementById('income');
const expenseDisplay = document.getElementById('expense');
const budgetInput = document.getElementById('budget');
const setBudgetButton = document.getElementById('setBudget');
const statusDisplay = document.getElementById('status');
const pieChartCanvas = document.getElementById('pieChart');
const exportReportButton = document.getElementById('exportReport');

let transactions = [];
let budget = 0;

// Initialize Chart.js for pie chart
const ctx = pieChartCanvas.getContext('2d');
let pieChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#36A2EB', '#FF6384'],
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
  }
});

// Handle form submission
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('type').checked ? 'Expense' : 'Income';
  const name = transactionForm.name.value;
  const amount = parseFloat(transactionForm.amount.value);
  const category = transactionForm.category.value;
  const date = transactionForm.date.value;

  addTransaction(type, name, amount, category, date);
  transactionForm.reset();
});

// Add transaction to the list
function addTransaction(type, name, amount, category, date) {
  const transaction = { type, name, amount, category, date };
  transactions.push(transaction);
  updateBalances();
  renderTransactions();
  updatePieChart();
}

// Update total balances
function updateBalances() {
  const income = transactions
    .filter(t => t.type === 'Income')
    .reduce((total, t) => total + t.amount, 0);
  const expense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((total, t) => total + t.amount, 0);

  balanceDisplay.textContent = `$${(income - expense).toFixed(2)}`;
  incomeDisplay.textContent = `$${income.toFixed(2)}`;
  expenseDisplay.textContent = `$${expense.toFixed(2)}`;

  // Alert if expenses exceed income
  if (expense > income) {
    alert('Warning: Your expenses exceed your income!');
  }
}

// Render transactions
function renderTransactions() {
  transactionList.innerHTML = '';
  transactions.forEach((t, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="name">
        <h4>${t.name}</h4>
        <p>${t.category} - ${t.date}</p>
      </div>
      <span class="amount ${t.type.toLowerCase()}">${t.type === 'Income' ? '+' : '-'} $${t.amount.toFixed(2)}</span>
      <div class="action" onclick="removeTransaction(${index})">
        <svg width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5zm2.5-4a.5.5 0 0 1 .5.5v.5H16v1H1V2h8V1a.5.5 0 0 1 .5-.5h4zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
        </svg>
      </div>
    `;
    transactionList.appendChild(li);
  });
}

// Remove a transaction
function removeTransaction(index) {
  transactions.splice(index, 1);
  updateBalances();
  renderTransactions();
  updatePieChart();
}

// Set budget
setBudgetButton.addEventListener('click', () => {
  budget = parseFloat(budgetInput.value);
  updateStatus();
});

// Update status message for budget
function updateStatus() {
  const totalExpense = transactions.reduce((total, t) => {
    return t.type === 'Expense' ? total + t.amount : total;
  }, 0);

  if (budget < totalExpense) {
    statusDisplay.textContent = `Warning: You are over your budget by $${(totalExpense - budget).toFixed(2)}`;
  } else {
    statusDisplay.textContent = '';
  }
}

// Update pie chart based on transactions
function updatePieChart() {
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((total, t) => total + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((total, t) => total + t.amount, 0);

  pieChart.data.datasets[0].data = [totalIncome, totalExpense];
  pieChart.update();
}

// Export report to CSV
exportReportButton.addEventListener('click', () => {
  const csvRows = [];
  csvRows.push(['Type', 'Name', 'Amount', 'Category', 'Date']); // Header row

  transactions.forEach(t => {
    csvRows.push([t.type, t.name, t.amount, t.category, t.date]);
  });

  const csvString = csvRows.map(row => row.join(',')).join('\n');
  downloadCSV(csvString, 'travel_expense_report.csv');
});

// Function to download CSV
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
