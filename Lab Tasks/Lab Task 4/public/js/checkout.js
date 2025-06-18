// public/js/checkout.js
// Client-side validation for checkout form

document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) {
        console.error('Checkout form not found.');
        return;
    }

    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const cardFields = document.getElementById('cardFields');

    // Function to show/hide card fields based on payment method
    function toggleCardFields() {
        if (document.getElementById('paymentCard').checked) {
            cardFields.style.display = 'block';
        } else {
            cardFields.style.display = 'none';
        }
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', toggleCardFields);
    });

    // Initial call to set correct state on page load
    toggleCardFields();

    // --- Client-side Validation --- 
    checkoutForm.addEventListener('submit', function(e) {
        let isValid = true;

        // Clear previous error messages and styles
        document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
        document.querySelectorAll('input').forEach(input => input.classList.remove('is-invalid'));
        document.querySelectorAll('select').forEach(select => select.classList.remove('is-invalid'));

        // Helper to display error
        function displayError(inputElement, message) {
            if (inputElement && inputElement.nextElementSibling && inputElement.nextElementSibling.classList.contains('error-message')) {
                inputElement.nextElementSibling.textContent = message;
                inputElement.classList.add('is-invalid');
            }
            isValid = false;
        }

        // Validate Email
        const emailInput = document.getElementById('email');
        if (!emailInput.value.trim()) {
            displayError(emailInput, 'Email is required.');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            displayError(emailInput, 'Please enter a valid email address.');
        }

        // Validate Full Name
        const fullNameInput = document.getElementById('fullName');
        if (!fullNameInput.value.trim()) {
            displayError(fullNameInput, 'Full Name is required.');
        } else if (!/^[A-Za-z ]+$/.test(fullNameInput.value.trim())) {
            displayError(fullNameInput, 'Full Name can only contain alphabets and spaces.');
        }

        // Validate Address
        const addressInput = document.getElementById('address');
        if (!addressInput.value.trim()) {
            displayError(addressInput, 'Address is required.');
        }

        // Validate Phone Number
        const phoneInput = document.getElementById('phone');
        if (!phoneInput.value.trim()) {
            displayError(phoneInput, 'Phone Number is required.');
        } else if (!/^[0-9]{10,12}$/.test(phoneInput.value.trim())) {
            displayError(phoneInput, 'Phone Number must be 10-12 digits.');
        }

        // Validate Credit Card fields if card payment is selected
        if (document.getElementById('paymentCard').checked) {
            const cardNumberInput = document.getElementById('cardNumber');
            const cardExpiryInput = document.getElementById('cardExpiry');
            const cardCVVInput = document.getElementById('cardCVV');

            if (!cardNumberInput.value.trim()) {
                displayError(cardNumberInput, 'Card Number is required.');
            } else if (!/^[0-9]{16}$/.test(cardNumberInput.value.trim())) {
                displayError(cardNumberInput, 'Card Number must be 16 digits.');
            }

            if (!cardExpiryInput.value.trim()) {
                displayError(cardExpiryInput, 'Expiry Date is required.');
            } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiryInput.value.trim())) {
                displayError(cardExpiryInput, 'Invalid Expiry Date format (MM/YY).');
            } else {
                // Future date validation for Expiry Date
                const [month, year] = cardExpiryInput.value.trim().split('/').map(Number);
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    displayError(cardExpiryInput, 'Expiry Date must be in the future.');
                }
            }

            if (!cardCVVInput.value.trim()) {
                displayError(cardCVVInput, 'CVV is required.');
            } else if (!/^[0-9]{3}$/.test(cardCVVInput.value.trim())) {
                displayError(cardCVVInput, 'CVV must be 3 digits.');
            }
        }

        if (!isValid) {
            e.preventDefault(); // Prevent form submission
        }
    });
}); 