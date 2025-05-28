// URL base de la API
const API_BASE_URL = 'http://localhost:8080/grade-logs';

// Elementos del DOM
const createLogForm = document.getElementById('createLogForm');
const deleteLogForm = document.getElementById('deleteLogForm');
const resultsDiv = document.getElementById('results');

// Manejador para crear un log
createLogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const logData = {
        studentId: parseInt(document.getElementById('studentId').value),
        gradeId: parseInt(document.getElementById('gradeId').value),
        periodId: parseInt(document.getElementById('periodId').value),
        teacherCoursesClassroom: parseInt(document.getElementById('teacherCoursesClassroom').value),
        action: document.getElementById('action').value,
        details: document.getElementById('details').value
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logData)
        });
        
        const result = await response.json();
        showResults('Log creado exitosamente:', result);
    } catch (error) {
        showResults('Error al crear log:', error);
    }
});

// Manejador para eliminar un log
deleteLogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('deleteId').value;

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.status === 204) {
            showResults('Log eliminado exitosamente');
        } else {
            showResults('Error al eliminar log:', await response.json());
        }
    } catch (error) {
        showResults('Error al eliminar log:', error);
    }
});

// Manejadores para los botones de consulta
document.getElementById('getAllLogs').addEventListener('click', () => {
    fetchLogs(API_BASE_URL);
});

document.getElementById('getById').addEventListener('click', () => {
    const id = prompt('Ingrese el ID del log:');
    if (id) fetchLogs(`${API_BASE_URL}/${id}`);
});

document.getElementById('getByStudentId').addEventListener('click', () => {
    const studentId = prompt('Ingrese el ID del estudiante:');
    if (studentId) fetchLogs(`${API_BASE_URL}/student/${studentId}`);
});

document.getElementById('getByGradeId').addEventListener('click', () => {
    const gradeId = prompt('Ingrese el ID de la calificación:');
    if (gradeId) fetchLogs(`${API_BASE_URL}/grade/${gradeId}`);
});

document.getElementById('getByPeriodId').addEventListener('click', () => {
    const periodId = prompt('Ingrese el ID del período:');
    if (periodId) fetchLogs(`${API_BASE_URL}/period/${periodId}`);
});

document.getElementById('getByTeacherCoursesClassroom').addEventListener('click', () => {
    const tccId = prompt('Ingrese el ID de profesor-curso-aula:');
    if (tccId) fetchLogs(`${API_BASE_URL}/teacher-courses-classroom/${tccId}`);
});

// Función para obtener logs
async function fetchLogs(url) {
    try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (Array.isArray(result)) {
            showResults('Logs encontrados:', result);
        } else {
            showResults('Log encontrado:', result);
        }
    } catch (error) {
        showResults('Error al obtener logs:', error);
    }
}

// Función para mostrar resultados
function showResults(title, data) {
    resultsDiv.innerHTML = `<h3>${title}</h3>`;
    
    if (data) {
        if (Array.isArray(data)) {
            if (data.length === 0) {
                resultsDiv.innerHTML += '<p>No se encontraron resultados</p>';
            } else {
                const table = document.createElement('table');
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ID Estudiante</th>
                            <th>ID Calificación</th>
                            <th>Acción</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(log => `
                            <tr>
                                <td>${log.id}</td>
                                <td>${log.studentId}</td>
                                <td>${log.gradeId}</td>
                                <td>${log.action}</td>
                                <td>${new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                resultsDiv.appendChild(table);
            }
        } else {
            resultsDiv.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    }
}