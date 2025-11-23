// create.js
$(document).ready(function() {
    // Initial load of states and event listeners
    loadStates();
    setupSubjectListeners();
    $('#saveStateBtn').on('click', handleAddState);
    $('#studentForm').on('submit', handleFormSubmit);
});

function loadStates(selectedStateId = null) {
    const stateSelect = $('#state');
    stateSelect.empty().append('<option value="">Select State</option>');

    $.ajax({
        url: `${API_BASE_URL}/States`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        },
        success: function(states) {
            states.forEach(state => {
                const option = `<option value="${state.stateID}">${state.stateName}</option>`;
                stateSelect.append(option);
            });

            if (selectedStateId) {
                stateSelect.val(selectedStateId);
            }
        },
        error: function() {
            Swal.fire('Error', 'Failed to load states.', 'error');
        }
    });
}

function setupSubjectListeners() {
    // Add Subject Row
    $('#addSubjectBtn').on('click', function() {
        const newRow = `
            <tr>
                <td><input type="text" class="form-control subject-input" name="Subjects[]" required></td>
                <td><button type="button" class="btn btn-danger btn-sm remove-subject">Remove</button></td>
            </tr>
        `;
        $('#subjectsTableBody').append(newRow);
    });

    // Remove Subject Row (Delegated event)
    $('#subjectsTableBody').on('click', '.remove-subject', function() {
        if ($('#subjectsTableBody tr').length > 1) {
            $(this).closest('tr').remove();
        } else {
            Swal.fire('Cannot Remove', 'You must have at least one subject.', 'warning');
        }
    });
}

function handleAddState() {
    const newStateName = $('#newStateName').val().trim();
    if (!newStateName) {
        Swal.fire('Error', 'State name cannot be empty.', 'error');
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/States`,
        type: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        },
        data: JSON.stringify({ stateName: newStateName }),
        success: function(response) {
            Swal.fire('Success', `State "${newStateName}" added successfully.`, 'success');
            $('#addStateModal').modal('hide');
            $('#newStateName').val('');
            loadStates(response.stateID); // Reload and select the new state
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Failed to add state.';
            Swal.fire('Error', errorMsg, 'error');
        }
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Basic Phone Number Validation
    const phoneInput = $('#phone');
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneInput.val())) {
        Swal.fire('Validation Error', 'Phone number must be 10 digits.', 'error');
        return;
    }

    const formData = new FormData(this);

    // Collect subjects into a single array for the backend
    const subjects = [];
    $('.subject-input').each(function() {
        const subject = $(this).val().trim();
        if (subject) {
            subjects.push(subject);
        }
    });

    // Remove individual subject fields from formData to avoid confusion
    formData.delete('Subjects[]');
    // Append subjects as a JSON string or individual entries (backend expects individual entries)
    subjects.forEach(subject => {
        formData.append('Subjects', subject);
    });

    // Check if a photo file is selected
    const photoFile = $('#photo')[0].files[0];
    if (photoFile) {
        formData.append('PhotoFile', photoFile);
    }

    $.ajax({
        url: `${API_BASE_URL}/Students`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        },
        data: formData,
        processData: false, // Important for FormData
        contentType: false, // Important for FormData
        success: function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Student created successfully!',
                confirmButtonText: 'Go to List'
            }).then(() => {
                window.location.href = 'index.html';
            });
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Failed to create student.';
            Swal.fire('Error', errorMsg, 'error');
        }
    });
}
