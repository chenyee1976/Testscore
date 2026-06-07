document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('requisitionForm');
    const fullNameInput = document.getElementById('fullName');
    const charCountSpan = document.getElementById('charCount');
    const ageInput = document.getElementById('age');
    const scoreInput = document.getElementById('testScore');
    const toast = document.getElementById('toast');

    // Real-time character counter for Full Name
    fullNameInput.addEventListener('input', () => {
        const length = fullNameInput.value.length;
        charCountSpan.textContent = length;
        
        if (length > 50) {
            fullNameInput.value = fullNameInput.value.substring(0, 50);
            charCountSpan.textContent = 50;
        }
    });

    // Enforce 2-digit limit strictly on keystroke / input for Test Score
    scoreInput.addEventListener('input', () => {
        if (scoreInput.value.length > 2) {
            scoreInput.value = scoreInput.value.slice(0, 2);
        }
    });

    // Clear validation styling when typing
    const inputs = [fullNameInput, ageInput, scoreInput];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                input.classList.remove('invalid');
                const errorSpan = document.getElementById(getErrorId(input.id));
                if (errorSpan) errorSpan.style.display = 'none';
            }
        });
    });

    function getErrorId(inputId) {
        if (inputId === 'fullName') return 'nameError';
        if (inputId === 'age') return 'ageError';
        if (inputId === 'testScore') return 'scoreError';
        return '';
    }

    // Handle form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;

        // Name Validation
        if (!fullNameInput.value.trim() || fullNameInput.value.length > 50) {
            showError(fullNameInput, 'nameError');
            isValid = false;
        }

        // Age Validation
        const ageVal = parseInt(ageInput.value, 10);
        if (isNaN(ageVal) || ageVal < 0 || ageVal > 150 || ageInput.value === '') {
            showError(ageInput, 'ageError');
            isValid = false;
        }

        // Score Validation: must be numeric and have maximum 2 digits
        const scoreVal = parseInt(scoreInput.value, 10);
        if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 99 || scoreInput.value === '' || scoreInput.value.length > 2) {
            showError(scoreInput, 'scoreError');
            isValid = false;
        }

        if (isValid) {
            const submitBtn = document.getElementById('submitBtn');
            const originalBtnText = submitBtn.innerHTML;
            
            try {
                // Show loading state
                submitBtn.innerHTML = '<span class="btn-text">Submitting...</span>';
                submitBtn.disabled = true;

                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: fullNameInput.value.trim(),
                        age: ageVal,
                        testScore: scoreVal
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to submit form to database');
                }

                showToast();
                form.reset();
                charCountSpan.textContent = '0';
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Database Error: ' + error.message + '\n\nMake sure your Vercel Postgres Database is connected in your Vercel project Settings > Storage!');
            } finally {
                // Restore button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    });

    function showError(input, errorId) {
        input.classList.add('invalid');
        const errorSpan = document.getElementById(errorId);
        if (errorSpan) {
            errorSpan.style.display = 'block';
        }
    }

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
});
