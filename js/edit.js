// edit.js
let studentId = null;

$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    studentId = urlParams.get('id');

    if (!studentId) {
        Swal.fire('Error', 'Student ID not provided.', 'error').then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    // Initial load of states and student data
    loadStates();
    fetchStudentData(studentId);
    setupSubjectListeners();
    $('#saveStateBtn').on('click', handleAddState);
    $('#studentForm').on('submit', function(e) {
        e.preventDefault();
        $('#passwordModal').modal('show'); // Open password modal on form submit
    });
    $('#confirmUpdateBtn').on('click', handleUpdate);
});

function fetchStudentData(id) {
    $.ajax({
        url: `${API_BASE_URL}/Students/${id}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        },
        success: function(student) {
            // Fill form fields
            $('#studentId').val(student.studentID);
            $('#name').val(student.name);
            $('#age').val(student.age);
            $('#dob').val(student.dob.split('T')[0]); // Format date for input[type=date]
            $('#phone').val(student.phoneNumber);
            $('#address').val(student.address);
            $('#photoPath').val(student.photoPath);

            // Display current photo
            if (student.photoPath) {
                const photoUrl = `${API_BASE_URL.replace('/api', '')}${student.photoPath}`;
                $('#currentPhoto').html(`<img src="${photoUrl}" alt="Current Photo" style="width: 100px; height: 100px; object-fit: cover;">`);
            }

            // Load states and select the correct one
            loadStates(student.stateID);

            // Populate subjects
            const subjectsBody = $('#subjectsTableBody');
            subjectsBody.empty();
            if (student.subjects && student.subjects.length > 0) {
                student.subjects.forEach(subject => {
                    subjectsBody.append(createSubjectRow(subject));
                });
            } else {
                subjectsBody.append(createSubjectRow(''));
            }
        },
        error: function() {
            Swal.fire('Error', 'Failed to fetch student data for editing.', 'error').then(() => {
                window.location.href = 'index.html';
            });
        }
    });
}

function createSubjectRow(subjectName) {
    return `
        <tr>
            <td><input type="text" class="form-control subject-input" name="Subjects[]" value="${subjectName}" required></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-subject">Remove</button></td>
        </tr>
    `;
}

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
        $('#subjectsTableBody').append(createSubjectRow(''));
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

function handleUpdate() {
    const updatePassword = $('#updatePassword').val();
    if (updatePassword !== '72991') {
        $('#passwordModal').modal('hide');
        Swal.fire('Wrong Password.', 'The password entered is incorrect.', 'error');
        return;
    }

    // Close modal
    $('#passwordModal').modal('hide');

    // Basic Phone Number Validation
    const phoneInput = $('#phone');
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneInput.val())) {
        Swal.fire('Validation Error', 'Phone number must be 10 digits.', 'error');
        return;
    }

    const form = document.getElementById('studentForm');
    const formData = new FormData(form);

    // Collect subjects
    const subjects = [];
    $('.subject-input').each(function() {
        const subject = $(this).val().trim();
        if (subject) {
            subjects.push(subject);
        }
    });

    // Remove individual subject fields from formData
    formData.delete('Subjects[]');
    // Append subjects
    subjects.forEach(subject => {
        formData.append('Subjects', subject);
    });

    // Append the existing photo path if no new file is selected
    if (!$('#photo')[0].files[0]) {
        formData.append('PhotoPath', $('#photoPath').val());
    }

    // Append the StudentID for the API
    formData.append('StudentID', studentId);

    $.ajax({
        url: `${API_BASE_URL}/Students/${studentId}`,
        type: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + getAuthToken(),
            'X-Update-Password': updatePassword // Critical Requirement: Send password in header
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function() {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Student updated successfully!',
                confirmButtonText: 'Go to List'
            }).then(() => {
                window.location.href = 'index.html';
            });
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Failed to update student.';
            Swal.fire('Error', errorMsg, 'error');
        }
    });
}
