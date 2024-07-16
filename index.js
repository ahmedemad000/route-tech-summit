const customersData = [
    { "id": 1, "name": "Ahmed Ali" },
    { "id": 2, "name": "Aya Elsayed" },
    { "id": 3, "name": "Mina Adel" },
    { "id": 4, "name": "Sarah Reda" },
    { "id": 5, "name": "Mohamed Sayed" }
];

const transactionsData = [
    { "id": 1, "customer_id": 1, "date": "2022-01-01", "amount": 1000 },
    { "id": 2, "customer_id": 1, "date": "2022-01-02", "amount": 2000 },
    { "id": 3, "customer_id": 2, "date": "2022-01-01", "amount": 550 },
    { "id": 4, "customer_id": 3, "date": "2022-01-01", "amount": 500 },
    { "id": 5, "customer_id": 2, "date": "2022-01-02", "amount": 1300 },
    { "id": 6, "customer_id": 4, "date": "2022-01-01", "amount": 750 },
    { "id": 7, "customer_id": 3, "date": "2022-01-02", "amount": 1250 },
    { "id": 8, "customer_id": 5, "date": "2022-01-01", "amount": 2500 },
    { "id": 9, "customer_id": 5, "date": "2022-01-02", "amount": 875 }
];

$(document).ready(function() {
    displayCustomers();

    $("#customerList").on("click", "li", function() {
        const customerId = $(this).data("customer-id");
        displayCustomerTransactions(customerId);
    });

    $("#exportTransactionsButton").on("click", function() {
        exportTransactions();
    });

    $("#searchTransactionsInput").on("keyup", function(){
        searchTransactions($(this).val());
    });
});

function displayCustomers() {
    $("#customerList").empty(); // Clear previous data

    $.each(customersData, function(index, customer) {
        const listItem = $("<li>").addClass("list-group-item").text(customer.name).data("customer-id", customer.id);
        $("#customerList").append(listItem);
    });
}

function displayCustomerTransactions(customerId) {
    const filteredTransactions = transactionsData.filter(transaction => transaction.customer_id === customerId);
    $("#customerTransactionsTableBody").empty(); // Clear previous data

    $.each(filteredTransactions, function(index, transaction) {
        const row = $("<tr>");
        const dateCell = $("<td>").text(transaction.date);
        const amountCell = $("<td>").text(transaction.amount);

        row.append(dateCell).append(amountCell);
        $("#customerTransactionsTableBody").append(row);
    });

    // Generate chart
    const dailyTransactions = {}; // To store transactions grouped by day

    $.each(filteredTransactions, function(index, transaction) {
        const date = transaction.date;
        if (dailyTransactions[date]) {
            dailyTransactions[date] += transaction.amount;
        } else {
            dailyTransactions[date] = transaction.amount;
        }
    });

    // Convert dailyTransactions object to an array for Chart.js
    const chartData = [];
    $.each(dailyTransactions, function(date, amount) {
        chartData.push({ x: date, y: amount });
    });

    // Create Chart.js chart
    new Chart($("#transactionChart")[0].getContext("2d"), {
        type: 'bar',
        data: {
            labels: chartData.map(item => item.x), // Date labels
            datasets: [{
                label: 'Total Transaction Amount',
                data: chartData.map(item => item.y), // Transaction amounts
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function exportTransactions() {
    const transactions = $("#customerTransactionsTableBody tr").map(function() {
        const transaction = {};
        transaction.date = $(this).find("td:eq(0)").text();
        transaction.amount = $(this).find("td:eq(1)").text();
        return transaction;
    }).get();

    const csvContent = "Date,Amount\n" + transactions.map(transaction => `${transaction.date},${transaction.amount}`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
}

function searchTransactions(searchTerm) {
    const transactions = $("#customerTransactionsTableBody tr");
    transactions.hide();

    transactions.filter(function() {
        const date = $(this).find("td:eq(0)").text();
        const amount = $(this).find("td:eq(1)").text();
        return date.includes(searchTerm) || amount.includes(searchTerm);
    }).show();
}