// index.js
const STUDENTS_PER_PAGE = 5; // Simple pagination limit
let currentPage = 1;
let allStudents = [];

$(document).ready(function() {
    fetchStudents();
});

function fetchStudents() {
    $.ajax({
        url: `${API_BASE_URL}/Students`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
        },
        success: function(data) {
            allStudents = data;
            renderTable(currentPage);
        },
        error: function(xhr) {
            Swal.fire('Error', 'Failed to fetch student data.', 'error');
            if (xhr.status === 401) {
                removeAuthToken();
                window.location.href = 'login.html';
            }
        }
    });
}

function renderTable(page) {
    const tableBody = $('#studentTableBody');
    tableBody.empty();

    const startIndex = (page - 1) * STUDENTS_PER_PAGE;
    const endIndex = startIndex + STUDENTS_PER_PAGE;
    const studentsToDisplay = allStudents.slice(startIndex, endIndex);

    if (studentsToDisplay.length === 0) {
        tableBody.append('<tr><td colspan="8" class="text-center">No students found.</td></tr>');
    }

    studentsToDisplay.forEach(student => {
        const subjects = student.subjects ? student.subjects.join(', ') : 'N/A';
        const photoUrl = student.photoPath ? `${API_BASE_URL.replace('/api', '')}${student.photoPath}` : 'placeholder.png';

        const row = `
            <tr>
                <td>${student.name}</td>
                <td>${student.age}</td>
                <td>${student.address}</td>
                <td>${student.state}</td>
                <td>${student.phoneNumber}</td>
                <td><img src="${photoUrl}" alt="Photo" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${subjects}</td>
                <td>
                    <a href="edit.html?id=${student.studentID}" class="btn btn-sm btn-info">Edit</a>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${student.studentID}">Delete</button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });

    renderPagination();
    $('.delete-btn').on('click', handleDelete);
}

function renderPagination() {
    const totalPages = Math.ceil(allStudents.length / STUDENTS_PER_PAGE);
    const paginationControls = $('#paginationControls');
    paginationControls.empty();

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        const listItem = `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        paginationControls.append(listItem);
    }

    $('.page-link').on('click', function(e) {
        e.preventDefault();
        currentPage = parseInt($(this).data('page'));
        renderTable(currentPage);
    });
}

function handleDelete() {
    const studentId = $(this).data('id');

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_BASE_URL}/Students/${studentId}`,
                type: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + getAuthToken()
                },
                success: function() {
                    Swal.fire('Deleted!', 'Student has been deleted.', 'success');
                    fetchStudents(); // Refresh the list
                },
                error: function(xhr) {
                    Swal.fire('Error', 'Failed to delete student.', 'error');
                }
            });
        }
    });
}
