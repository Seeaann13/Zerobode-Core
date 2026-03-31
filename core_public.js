// core_public.js

// Improved error handling and memory management for core_public.js

// Initialize variables
let timeout;
let logs = [];

function initialize() {
    return new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
            reject(new Error('Initialization timed out after 30 seconds.'));
        }, 30000);

        try {
            // Execute the code for initialization here (example):
            // connectToGroqAPI();

            // If successful:
            clearTimeout(timeout);
            resolve();
        } catch (error) {
            clearTimeout(timeout);
            reject(new Error('Error during initialization: ' + error.message));
        }
    });
}

function connectToGroqAPI() {
    try {
        // Simulate Groq API integration
        // const result = callGroqAPI();
        logMessage('Connected to Groq API successfully.');
    } catch (error) {
        logMessage('Error connecting to Groq API: ' + error.message);
    }
}

// Limiting log lines to 50
function logMessage(message) {
    if (logs.length >= 50) {
        logs.shift(); // Remove the oldest log
    }
    logs.push(message);
    console.log(message);
}

// Function to execute on button click
function executeAction() {
    const button = document.getElementById('executeButton');
    button.disabled = true; // Disable button during execution

    initialize()
        .then(() => {
            // Proceed with action after initialization
            logMessage('Action executed successfully.');
        })
        .catch((error) => {
            logMessage('Execution failed: ' + error.message);
        })
        .finally(() => {
            button.disabled = false; // Enable button after execution
        });
}

// Support for Enter key
document.getElementById('inputField').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        executeAction();
    }
});
