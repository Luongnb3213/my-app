import './index.css';

var todoList = [];

var stylePriority = {
  High: {
    bg: 'bg-[#fff1f0]',
    border: 'border-[#ffa39e]',
    text: 'text-[#cf1322]',
  },
  Medium: {
    bg: 'bg-[#e6f7ff]',
    border: 'border-[#91d5ff]',
    text: 'text-[#096dd9]',
  },
  Low: {
    bg: 'bg-gray-600',
    border: 'border-[#0000]',
    text: 'text-white',
  },
};

var filters = {
  searchText: '',
  priority: [],
  completed: 'all',
  sortType: 'default',
};

const SelectComboBox = (() => {
  var priority_items = [];

  return {
    init() {
      this.events();
      this.searchPriority();
    },

    events() {
      var _this = this;
      const filter_wrapper = document.querySelector('.filter_priority');
      const priority_wrapper = document.querySelector(
        '.priority_wrapper_select'
      );

      const priority_items_select = priority_wrapper.querySelectorAll(
        '.priority-item_select'
      );

      priority_items_select.forEach((item) => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          _this.selectedPriority(item);
        });
      });

      filter_wrapper.addEventListener('click', (e) => {
        priority_wrapper.classList.toggle('opacity-0');
        priority_wrapper.classList.toggle('invisible');
      });

      document.body.addEventListener('click', (e) => {
        if (!e.target.closest('.filter_priority')) {
          priority_wrapper.classList.add('opacity-0');
          priority_wrapper.classList.add('invisible');

          return;
        }
      });

      priority_wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    },

    selectedPriority(element) {
      element.classList.toggle('selected');
      if (priority_items.includes(element.dataset.value)) {
        priority_items = priority_items.filter(
          (val) => val !== element.dataset.value
        );
      } else {
        priority_items.push(element.dataset.value);
      }
      this.render();
    },

    deletePriority() {
      const priority_inputs = document.querySelectorAll(
        '.priority_inputs .priority_input_delete'
      );
      priority_inputs.forEach((item) => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          priority_items = priority_items.filter(
            (val) => val !== item.dataset.value
          );
          document
            .querySelector(
              `.priority-item_select[data-value="${item.dataset.value}"]`
            )
            .classList.remove('selected');
          this.render();
        });
      });
    },

    searchPriority() {
      const priority_search_input = document.querySelector(
        '#priority_search_input'
      );
      priority_search_input.addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const priority_items_select = document.querySelectorAll(
          '.priority-item_select'
        );
        priority_items_select.forEach((item) => {
          if (item.dataset.value.toLowerCase().includes(searchValue)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    },

    render() {
      const priority_inputs = document.querySelector('.priority_inputs');
      priority_inputs.innerHTML = ''; // Clear existing items
      const priority_search_input = document.querySelector(
        '#priority_search_input'
      );
      priority_search_input.focus();
      if (priority_items.length > 0) {
        priority_search_input.placeholder = '';
      } else {
        priority_search_input.placeholder = 'Please select priority';
      }

      priority_items.forEach((item) => {
        const priority_item = document.createElement('div');
        priority_item.className = 'priority-item flex items-center';
        priority_item.setAttribute('data-value', item);
        priority_item.innerHTML = `
                <span class="inline-block font-[tabular-nums] [font-feature-settings:'tnum','tnum'] ${stylePriority[item].bg} border ${stylePriority[item].border} ${stylePriority[item].text} rounded-[2px] box-border text-[12px] leading-[20px] list-none m-0 mr-2 opacity-100 px-[7px] whitespace-nowrap transition-all duration-300">
                    ${item}
                </span>
                <span data-value="${item}" class="priority_input_delete cursor-pointer">x</span>
            `;
        priority_inputs.appendChild(priority_item);
      });

      this.deletePriority();
      filters.priority = priority_items;
      MainTodo.render();
    },

    clear() {
      const priority_inputs = document.querySelector('.priority_inputs');
      const priority_item_selects = document.querySelectorAll(
        '.priority-item_select'
      );
      priority_inputs.innerHTML = '';
      priority_items = [];
      filters.priority = [];
      const priority_search_input = document.querySelector(
        '#priority_search_input'
      );
      priority_search_input.value = '';
      priority_search_input.placeholder = 'Please select priority';
      priority_item_selects.forEach((item) => {
        item.classList.remove('selected');
      });
    },
  };
})();
SelectComboBox.init();

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const MainTodo = (() => {
  return {
    init() {
      this.searchInput();
      this.statusFilter();
      this.sortEvent();
      this.render();
      this.dragEvent();
    },

    taskItemClicked() {
      const taskItems = document.querySelectorAll('.task_label');
      taskItems.forEach((item) => {
        item.onclick = (e) => {
          e.stopPropagation();
          if (e.target.type !== 'checkbox') {
            e.preventDefault();
          }
          const todoId = e.currentTarget.dataset.id;
          const todo = todoList.find((todo) => todo.id == todoId);
          if (todo) {
            todo.completed = !todo.completed;
            e.currentTarget.querySelector('input').checked = todo.completed;
            if (e.currentTarget.parentElement.hasAttribute('disabled')) {
              e.currentTarget.parentElement.removeAttribute('disabled');
            } else {
              e.currentTarget.parentElement.setAttribute('disabled', true);
              if (window.electronAPI) {
                window.electronAPI.taskCompleted(todo);
              }
            }
            this.updateStatics();
          }
        };
      });
    },

    statusFilter() {
      const statusFilter = document.querySelectorAll(
        'input[name="option_filter"]'
      );
      statusFilter.forEach((item) => {
        item.addEventListener('change', (e) => {
          filters.completed = e.target.value;
          this.render();
        });
      });
    },

    searchInput() {
      const searchInput = document.getElementById('search_input');
      searchInput.addEventListener('input', (e) => {
        filters.searchText = e.target.value;
        this.render();
      });
    },

    sortEvent() {
      var _this = this;
      const sortMenu = document.querySelector(
        '.sort-wrapper .relative.mt-2 ul'
      );
      const sortButton = document.querySelector(
        '.sort-wrapper .relative.mt-2 button'
      );
      const displaySpan = sortButton.querySelector(
        '.sort-wrapper .block.truncate'
      );

      sortButton.addEventListener('click', function (e) {
        e.stopPropagation();
        sortMenu.style.display =
          sortMenu.style.display === 'block' ? 'none' : 'block';
      });

      sortMenu.querySelectorAll('li').forEach((li) => {
        li.addEventListener('click', function (e) {
          e.stopPropagation();
          displaySpan.textContent =
            this.querySelector('.block.truncate').textContent;
          filters.sortType = e.currentTarget.id;
          sortMenu.style.display = 'none';
          _this.render();
        });
      });

      document.addEventListener('click', function () {
        sortMenu.style.display = 'none';
      });
    },

    clearFilter() {
      const searchInput = document.getElementById('search_input');
      searchInput.value = '';
      filters.searchText = '';

      const statusFilter = document.querySelector(
        'input[name="option_filter"][value="all"]'
      );
      statusFilter.checked = true;
      filters.completed = 'all';
    },

    updateStatics() {
      const pendingTasks = todoList.filter((task) => !task.completed);
      const completedTasks = todoList.filter((task) => task.completed);

      // Update stats
      document.getElementById('totalTasks').textContent = todoList.length;
      document.getElementById('pendingTasks').textContent = pendingTasks.length;
      document.getElementById('completedTasks').textContent =
        completedTasks.length;
    },

    dragEvent() {
      const container = document.getElementById('list_task');
      let draggedItem = null;
      const debouncedUpdate = debounce(updatePositionInTodoList, 500);
      container.addEventListener('dragstart', function (e) {
        if (e.target.classList.contains('task_item')) {
          draggedItem = e.target;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', e.target.dataset.id);
          setTimeout(() => e.target.classList.add('dragging'), 0);
        }
      });

      container.addEventListener('dragend', function (e) {
        if (draggedItem) {
          draggedItem.classList.remove('dragging');
          draggedItem = null;
        }
      });

      container.addEventListener('dragover', function (e) {
        e.preventDefault();
        const dragging = container.querySelector('.dragging');
        const afterElem = getDragAfterElement(container, e.clientY);
        if (afterElem == null) {
          container.appendChild(dragging);
        } else {
          container.insertBefore(dragging, afterElem);
        }
        // update postition in todoList
        debouncedUpdate();
      });

      // Giúp highlight khi kéo qua
      container.addEventListener('dragenter', function (e) {
        e.preventDefault();
      });

      function updatePositionInTodoList() {
        const taskItems = container.querySelectorAll('.task_item');
        todoList = Array.from(taskItems).map((item) => {
          return todoList.find((todo) => todo.id === item.dataset.id);
        });
        console.log(todoList);
      }

      // Hàm hỗ trợ: tìm phần tử gần nhất theo vị trí chuột
      function getDragAfterElement(container, y) {
        const draggableElements = [
          ...container.querySelectorAll('.task_item:not(.dragging)'),
        ];
        return draggableElements.reduce(
          (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
              return { offset: offset, element: child };
            } else {
              return closest;
            }
          },
          { offset: -Infinity }
        ).element;
      }
    },

    deleteTask() {
      const deleteButtons = document.querySelectorAll('.delete_task');
      deleteButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const taskId = e.currentTarget.dataset.id;
          todoList = todoList.filter((todo) => todo.id !== taskId);
          e.currentTarget.closest('.task_item').remove();
          this.updateStatics();
          if (window.electronAPI) {
            window.electronAPI.taskCompleted({ id: taskId, completed: true });
          }
        });
      });
    },

    editTask() {
      const editButtons = document.querySelectorAll('.edit_task');
      editButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          editPopup.openPopup();
        });
      });
    },

    render() {
      const listTaskWrapper = document.querySelector('.list_task');
      const errorInput = document.querySelector('.text-error-input');
      listTaskWrapper.innerHTML = ''; // Clear existing tasks
      errorInput.textContent = ''; // Clear error message
      this.updateStatics();
      let filteredTodos = [];
      switch (filters.sortType) {
        case 'priority':
          const priorityOrder = { High: 0, Medium: 1, Low: 2 };
          filteredTodos = [...todoList].sort((a, b) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });
          break;
        case 'deadline':
          filteredTodos = [...todoList].sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
          });
          break;
        case 'status':
          filteredTodos = [...todoList].sort((a, b) => {
            return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
          });
          break;
        default:
          filteredTodos = [...todoList];
          break;
      }

      filteredTodos = filteredTodos.filter((todo) => {
        // Filter by search text
        if (
          filters.searchText &&
          !todo.text.toLowerCase().includes(filters.searchText.toLowerCase())
        ) {
          return false;
        }

        // Filter by priority
        if (
          filters.priority.length > 0 &&
          !filters.priority.includes(todo.priority)
        ) {
          return false;
        }

        // Filter by completed status
        if (filters.completed == 'all') {
          return true;
        } else {
          return todo.completed == filters.completed;
        }
      });

      filteredTodos.forEach((todo) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'flex items-center justify-between mb-1 task_item';
        taskItem.setAttribute('draggable', true);
        if (todo.completed) {
          taskItem.setAttribute('disabled', true);
        }
        taskItem.setAttribute('data-id', todo.id);
        taskItem.innerHTML = `
              <div  class="flex flex-1 items-start gap-2 cursor-pointer text-sm text-gray-800 task_label" data-id="${
                todo.id
              }">
                  <input type="checkbox" class="w-4 h-4 text-blue-600 bg-white border border-gray-300 rounded-sm focus:ring-0 focus:outline-none cursor-pointer" ${
                    todo.completed ? 'checked' : ''
                  } />
                  <span class="text_task text-base break-words break-all">${
                    todo.text
                  }</span>
              </div>
              <div class="priority-item flex justify-between items-center py-1 transition-all duration-300">
                  <span class="inline-block font-[tabular-nums] [font-feature-settings:'tnum','tnum'] ${
                    stylePriority[todo.priority].bg
                  } border ${stylePriority[todo.priority].border} ${
          stylePriority[todo.priority].text
        } rounded-[2px] box-border text-[14px] leading-[20px] list-none m-0 mr-1 opacity-100 px-[7px] whitespace-nowrap transition-all duration-300">
                  ${todo.priority}
                  </span>
              </div>
               <div class="flex items-center gap-2">
               <span class="cursor-pointer delete_task" data-id="${todo.id}">
               <svg xmlns="http://www.w3.org/2000/svg" view
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
                   <path fill-rule="evenodd" d="M7 4V3a2 2 0 1 1 4 0v1h3.5a.5.5 0 0 1 0 1H16v1a1 1 0 0 1-1 1h-1v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7H5a1 1 0 0 1-1-1V5h1.5a.5.5 0 0 1 0-1H7zm2-1a1 1 0 0 1 2 0v1H9V3zm-3 4v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7H6zm3 2a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6A.5.5 0 0 1 9 9zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0v-6z" clip-rule="evenodd"/>
               </svg> 
               </span>
               
               <span class="cursor-pointer edit_task" data-id="${todo.id}">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
  <path d="M17.414 2.586a2 2 0 0 0-2.828 0l-9.086 9.086a2 2 0 0 0-.516.878l-1.342 4.03a1 1 0 0 0 1.263 1.263l4.03-1.342a2 2 0 0 0 .878-.516l9.086-9.086a2 2 0 0 0 0-2.828zm-11.03 10.616 7.793-7.792 2.207 2.207-7.793 7.793-2.207-2.208zm-1.072 1.692 1.207 1.207-2.15.717.717-2.151z"/>
</svg>
               </span>



               </div>


              `;
        listTaskWrapper.appendChild(taskItem);
      });

      this.taskItemClicked();
      this.deleteTask();
      this.editTask();
    },
  };
})();

const editPopup = (() => {
  const popup = document.getElementById('edit-popup');
  const popupInner = document.getElementById('edit-popup-inner');

  return {
    init() {
      this.bindEvents();
    },

    bindEvents() {
      const edit_cancel_button = document.getElementById('edit-cancel-button');
      const edit_confirm_button = document.getElementById(
        'edit-confirm-button'
      );

      edit_cancel_button.addEventListener('click', (e) => {
        e.preventDefault();
        this.closePopup();
      });

      edit_confirm_button.addEventListener('click', (e) => {
        e.preventDefault();
        this.closePopup();
      });

      document.getElementById('edit-popup')?.addEventListener('click', (e) => {
        if (!document.getElementById('edit-popup-inner').contains(e.target)) {
          this.closePopup();
        }
      });
    },

    openPopup() {
      popup.classList.remove('hidden');
      setTimeout(() => {
        popupInner.classList.remove('opacity-0', 'scale-95');
        popupInner.classList.add('opacity-100', 'scale-100');
      }, 10);
    },

    closePopup() {
      popupInner.classList.remove('opacity-100', 'scale-100');
      popupInner.classList.add('opacity-0', 'scale-95');

      setTimeout(() => {
        popup.classList.add('hidden');
      }, 300);
    },
  };
})();

editPopup.init();

const AddTodo = (() => {
  return {
    init() {
      this.submitButton();
    },

    submitButton() {
      const submitButton = document.getElementById('submit-button');
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const todoInput = document.getElementById('todo-input');
        const selectedOption = document.getElementById('priority-dropdown-add')?.querySelector(".selected-option");
        const errorInput = document.querySelector('.text-error-input');

        if (todoInput.value.trim() === '') {
          errorInput.textContent = 'Please enter a task.';
          return;
        }

        const newTodo = {
          id: Date.now().toString(),
          text: todoInput.value.trim(),
          priority: selectedOption.dataset.value,
          completed: false,
        };

        todoList.push(newTodo);
        todoInput.value = '';
        MainTodo.clearFilter();
        SelectComboBox.clear();
        MainTodo.render();
        if (window.electronAPI) {
          window.electronAPI.taskAdded(newTodo);
        }
      });
    },
  };
})();

AddTodo.init();

async function exportTasks() {
  if (window.electronAPI) {
    const result = await window.electronAPI.exportTasks(todoList);
    if (result.success) {
      console.log('Tasks exported to:', result.filePath);
    } else {
      console.error('Export failed:', result.message);
    }
  }
}

const exportButton = document.getElementById('export-button');
if (exportButton) {
  exportButton.addEventListener('click', (e) => {
    e.preventDefault();
    exportTasks();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadAutoSavedTasks();
  setupAutoSave();
});

function setupAutoSave() {
  return;
  setInterval(async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.autoSaveTasks(todoList);
    }
  }, 5000);
}

async function loadAutoSavedTasks() {
  if (window.electronAPI) {
    const result = await window.electronAPI.loadAutoSavedTasks();
    if (result.success && result.todoList) {
      todoList = result.todoList;
    }
  }
  MainTodo.init();
}




class PriorityDropdown extends HTMLElement {
  connectedCallback() {
    console.log(this)
    const button = this.querySelector('.select-button');
    const dropdown = this.querySelector('.dropdown');
    const selected = this.querySelector('.selected-option');

    button?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    this.querySelectorAll('li').forEach((item) => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        selected.dataset.value = value;
        selected.innerHTML = `
          <span class="inline-block font-[tabular-nums] [font-feature-settings:'tnum','tnum'] ${
            stylePriority[value].bg
          } border ${stylePriority[value].border} ${stylePriority[value].text} rounded-[2px] box-border text-[12px] leading-[20px] m-0 mr-2 px-[7px]">
            ${value}
          </span>`;
        dropdown.classList.add('hidden');
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
      }
    });
  }
}

customElements.define('priority-dropdown', PriorityDropdown);