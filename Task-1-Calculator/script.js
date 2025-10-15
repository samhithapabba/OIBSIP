document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');
    let currentExpression = '';
    let resultDisplayed = false;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');

            // Handle Clear (AC)
            if (value === 'clear') {
                currentExpression = '';
                display.value = '0';
                resultDisplayed = false;
                return;
            }

            // Handle Delete (DEL)
            if (value === 'del') {
                if (currentExpression.length > 0) {
                    currentExpression = currentExpression.slice(0, -1);
                }
                display.value = currentExpression === '' ? '0' : currentExpression;
                resultDisplayed = false;
                return;
            }

            // Handle Equals (=)
            if (value === '=') {
                try {
                    // Replace special operator symbols for evaluation (if needed, e.g., 'x' for '*')
                    let finalExpression = currentExpression.replace(/x/g, '*').replace(/%/g, '/100*');
                    
                    // Use a safe function to evaluate the expression
                    let result = eval(finalExpression); 
                    
                    currentExpression = String(result);
                    display.value = currentExpression;
                    resultDisplayed = true;

                } catch (e) {
                    display.value = 'Error';
                    currentExpression = '';
                    resultDisplayed = true;
                }
                return;
            }

            // Handle Number and Operator input
            if (resultDisplayed) {
                // If a result is displayed, a new number/operator starts a new calculation
                if (button.classList.contains('number') || value === '.') {
                    currentExpression = value;
                } else {
                    currentExpression += value;
                }
                resultDisplayed = false;
            } else {
                currentExpression += value;
            }

            display.value = currentExpression;
        });
    });
});