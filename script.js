// Add entry  spread operator
const addEntry = () => {
    const amount = parseFloat(document.getElementById('amountInput').value);
    const remark = document.getElementById('remarkInput').value.trim();
    const category = document.getElementById('categoryInput').value.trim();

    if (!amount || !remark || !category) {
        alert('Please fill in all fields!');
        return;
    }

    const entry = {
        id: Date.now(),
        amount,
        remark,
        category,
        type: selectedType,
        date: new Date().toLocaleString()
    };

    transactionManager.add(entry);


    document.getElementById('amountInput').value = '';
    document.getElementById('remarkInput').value = '';
    document.getElementById('categoryInput').value = '';

    updatecomposite();
};

// gett all the categores from input category
const getAllCategories = () => {
    const entries = transactionManager.getAll();

    const categories = entries.map(e => e.category);

    return [...new Set(categories)];
};



// Data storage using closures
const createTransactionManager = () => {
    let entries = [];

    return {
        getAll: () => [...entries],
        add: (entry) => entries = [entry, ...entries],
        delete: (id) => entries = entries.filter(e => e.id !== id),
        filter: (predicate) => entries.filter(predicate)
    };
};

const transactionManager = createTransactionManager();


let selectedType = 'income';
let activeFilter = 'all';

//fun Higher order for create filter functions
const createFilter = (type) => (entry) => type === 'all' || entry.type === type;

const createCategoryFilter = (category) => (entry) => entry.category === category;


// for select buttom income and expense
const selectType = (type) => {
    selectedType = type;
    const incomeBtn = document.getElementById('incomeBtn');
    const expenseBtn = document.getElementById('expenseBtn');

    if (type === 'income') {
        incomeBtn.className = 'type-btn income';
        expenseBtn.className = 'type-btn inactive';
    } else {
        incomeBtn.className = 'type-btn inactive';
        expenseBtn.className = 'type-btn expense';
    }
};



// Calculate totals using higher-order functions (filter and reduce)
const calculateTotal = (type) =>
    transactionManager.getAll()
        .filter(e => e.type === type)
        .reduce((sum, e) => sum + e.amount, 0);


const getCategoryTotals = (type) => {
    const totals = {};
    transactionManager.getAll()
        .filter(e => e.type === type)
        .forEach(e => {
            totals[e.category] = (totals[e.category] || 0) + e.amount;
        });
    return totals;
};


// first-class functions
const renderFilterButtons = () => {
    const filterButtons = document.getElementById('filterButtons');

    const dynamicCategories = getAllCategories();

    const filters = ['all', 'income', 'expense', ...dynamicCategories];

    filterButtons.innerHTML = filters.map(filter =>
        `<button class="filter-btn ${activeFilter === filter ? 'active' : ''}"
                 onclick="setFilter('${filter}')">
            ${filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>`
    ).join('');
};

// Set filter and re-render
const setFilter = (filter) => {
    activeFilter = filter;
    updatecomposite();
};

//  closures 
const renderCharts = () => {
    const totalIncome = calculateTotal('income');
    const totalExpense = calculateTotal('expense');
    const maxTotal = Math.max(totalIncome, totalExpense, 1);

    const incomeBar = document.getElementById('incomeBar');
    const expenseBar = document.getElementById('expenseBar');
    const incomeBarText = document.getElementById('incomeBarText');
    const expenseBarText = document.getElementById('expenseBarText');

    const incomePercent = (totalIncome / maxTotal) * 100;
    const expensePercent = (totalExpense / maxTotal) * 100;

    incomeBar.style.width = `${incomePercent}%`;
    expenseBar.style.width = `${expensePercent}%`;
    incomeBarText.textContent = totalIncome > 0 ? `$${totalIncome.toFixed(2)}` : '';
    expenseBarText.textContent = totalExpense > 0 ? `$${totalExpense.toFixed(2)}` : '';

    renderCategoryChart('income');
    renderCategoryChart('expense');
};


const renderHistory = () => {
    const historyList = document.getElementById('historyList');
    let filteredEntries = transactionManager.getAll();

    //higher-order functions
    if (activeFilter !== 'all') {
        if (activeFilter === 'income' || activeFilter === 'expense') {
            filteredEntries = transactionManager.filter(createFilter(activeFilter));
        } else {
            filteredEntries = transactionManager.filter(createCategoryFilter(activeFilter));
        }
    }

    if (filteredEntries.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No entries found for this filter!</div>';
        return;
    }


    historyList.innerHTML = filteredEntries.map(entry => `
                <div class="entry-item ${entry.type}">
                    <div class="entry-header">
                        <span class="entry-amount ${entry.type}">
                            ${entry.type === 'income' ? '+' : '-'}$${entry.amount.toFixed(2)}
                        </span>
                        <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
                    </div>
                    <div class="entry-category">${entry.category}</div>
                    <div class="entry-remark">${entry.remark}</div>
                    <div class="entry-date">${entry.date}</div>
                </div>
            `).join('');
};


// Delete entry using arrow function
const deleteEntry = (id) => {
    if (confirm('Do you want to delete this entry?')) {
        transactionManager.delete(id);
        updatecomposite();
    }
};



const updatecomposite = () => {
    const totalIncome = calculateTotal('income');
    const totalExpense = calculateTotal('expense');
    const balance = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `$${totalExpense.toFixed(2)}`;
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('entryCount').textContent = `${transactionManager.getAll().length} entries`;

    renderFilterButtons();
    renderHistory();
    renderCharts();
};

updatecomposite();