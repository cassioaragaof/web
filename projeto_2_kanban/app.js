// DADOS E FUNÇÕES GERAIS
let tasks = JSON.parse(localStorage.getItem('scrum_tasks')) || [
    { id: 1, title: 'Estruturar Banco de Dados', status: 'todo', dueDate: '2026-06-20' },
    { id: 2, title: 'Criar Interface do Kanban', status: 'in-progress', dueDate: '2026-06-18' }
];

function saveTasks() {
    localStorage.setItem('scrum_tasks', JSON.stringify(tasks));
}

function formatBRDate(dateString) {
    if (!dateString) return 'Sem data';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// LÓGICA DO QUADRO KANBAN
function renderKanban() {
    const columns = {
        'todo': document.getElementById('col-todo'),
        'in-progress': document.getElementById('col-in-progress'),
        'review': document.getElementById('col-review'),
        'done': document.getElementById('col-done')
    };

    const columnTitles = {
        'todo': 'Sprint Backlog',
        'in-progress': 'Em Desenvolvimento',
        'review': 'Revisão / QA',
        'done': 'Concluído'
    };

    Object.keys(columns).forEach(status => {
        if (!columns[status]) return;

        const filteredTasks = tasks.filter(t => t.status === status);
        columns[status].innerHTML = `<h2 class="column-title">${columnTitles[status]} <span>${filteredTasks.length}</span></h2>`;

        filteredTasks.forEach(task => {
            columns[status].insertAdjacentHTML('beforeend', `
                <div class="task-card">
                    <h4>${task.title}</h4>
                    <p>📅 Entrega: ${formatBRDate(task.dueDate)}</p>
                    <div class="task-actions">
                        <button class="btn-delete" onclick="deleteTask(${task.id})">🗑 Excluir</button>
                        <button class="btn-move" onclick="moveTask(${task.id})">Mover ➡️</button>
                    </div>
                </div>
            `);
        });
    });

    updateDashboard();
}

window.addNewTask = () => {
    const titleInput = document.getElementById('taskTitle');
    const dateInput = document.getElementById('taskDate');

    if (!titleInput.value) return alert("Por favor, digite um título para a tarefa!");

    const newTask = {
        id: Date.now(),
        title: titleInput.value,
        status: 'todo',
        dueDate: dateInput.value
    };

    tasks.push(newTask);
    saveTasks();
    
    titleInput.value = '';
    dateInput.value = '';
    renderKanban();
};

window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderKanban();
};

window.moveTask = (id) => {
    const task = tasks.find(t => t.id === id);
    const order = ['todo', 'in-progress', 'review', 'done'];
    let nextIndex = order.indexOf(task.status) + 1;
    
    if (nextIndex < order.length) {
        task.status = order[nextIndex];
        saveTasks();
        renderKanban();
    }
};

// LÓGICA DO DASHBOARD
function updateDashboard() {
    if (!document.querySelector('.dashboard-container')) return;

    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const total = tasks.length || 1;

    const inboxList = document.getElementById('inbox-list');
    if (inboxList) {
        inboxList.innerHTML = '';
        if (pendingTasks.length === 0) {
            inboxList.innerHTML = '<li>🎉 Nenhuma tarefa pendente no momento!</li>';
        } else {
            pendingTasks.slice(0, 5).forEach(task => {
                inboxList.insertAdjacentHTML('beforeend', `
                    <li><strong>${formatBRDate(task.dueDate)}:</strong> ${task.title}</li>
                `);
            });
        }
    }

    const closestDateEl = document.getElementById('closest-due-date');
    if (closestDateEl) {
        const tasksWithDate = pendingTasks.filter(t => t.dueDate);
        
        if (tasksWithDate.length > 0) {
            tasksWithDate.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
            const closestTask = tasksWithDate[0];
            closestDateEl.innerHTML = `${formatBRDate(closestTask.dueDate)} <br><span style="font-size:13px; font-weight:normal; color:#b0b8d6;">(${closestTask.title})</span>`;
        } else {
            closestDateEl.innerText = "Nenhuma data próxima";
        }
    }

    const overdueBar = document.getElementById('overdue-bar');
    if (overdueBar) {
        const todayStr = new Date().toISOString().split('T')[0]; 
        
        const overdueCount = pendingTasks.filter(t => t.dueDate && t.dueDate < todayStr).length;
        const percentOverdue = Math.round((overdueCount / total) * 100);

        overdueBar.style.width = `${percentOverdue}%`;
        overdueBar.innerText = `${percentOverdue}%`;
    }

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const doneCount = tasks.filter(t => t.status === 'done').length;
        const percentDone = Math.round((doneCount / total) * 100);
        
        progressBar.style.width = `${percentDone}%`;
        progressBar.innerText = `${percentDone}%`;
    }
}

// LÓGICA DO PERFIL DO USUÁRIO
let userProfile = JSON.parse(localStorage.getItem('user_profile')) || {
    name: 'João Silva',
    role: 'Desenvolvedor Front-end',
    email: 'joao@email.com',
    sector: 'Tecnologia',
    avatar: '👤'
};

function saveUserProfile() {
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
}

function renderProfile() {
    const avatarEl = document.getElementById('profile-avatar');
    if (!avatarEl) return; 

    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const emailEl = document.getElementById('profile-email');
    const sectorEl = document.getElementById('profile-sector');

    if (userProfile.avatar.startsWith('http') || userProfile.avatar.startsWith('data:image')) {
        avatarEl.innerHTML = `<img src="${userProfile.avatar}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid #4da3ff;">`;
    } else {
        avatarEl.innerHTML = userProfile.avatar || '👤';
    }
    
    nameEl.innerText = userProfile.name;
    roleEl.innerText = userProfile.role;
    emailEl.innerText = userProfile.email;
    sectorEl.innerText = userProfile.sector;
}

function loadProfileForEditing() {
    const editNameEl = document.getElementById('editName');
    if (!editNameEl) return; 

    document.getElementById('editName').value = userProfile.name;
    document.getElementById('editRole').value = userProfile.role;
    document.getElementById('editEmail').value = userProfile.email;
    document.getElementById('editSector').value = userProfile.sector;
    document.getElementById('editAvatar').value = userProfile.avatar;
}

window.saveProfileFromPage = () => {
    userProfile.name = document.getElementById('editName').value;
    userProfile.role = document.getElementById('editRole').value;
    userProfile.email = document.getElementById('editEmail').value;
    userProfile.sector = document.getElementById('editSector').value;
    userProfile.avatar = document.getElementById('editAvatar').value;

    saveUserProfile();
    
    window.location.href = 'dashboard.html'; 
};

// INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    
    if (document.querySelector('.scrum-board')) {
        renderKanban();
    }
    
    if (document.querySelector('.dashboard-container') && !document.querySelector('.edit-profile-wrapper')) {
        updateDashboard();
        renderProfile();
    }
    
    if (document.querySelector('.edit-profile-wrapper')) {
        loadProfileForEditing();
    }
});