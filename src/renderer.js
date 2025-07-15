/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

var todoList = [
  {
    id: 1,
    text: 'Learn Yoga',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 2,
    text: 'Learn Yoga ehe',
    priority: 'High',
    completed: true,
  },
  {
    id: 2,
    text: 'Learn Yoga lol',
    priority: 'Low',
    completed: false,
  },
];

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

const MainTodo = (() => {
  return {
    init() {
      this.searchInput();
      this.statusFilter();
      this.render();
    },

    taskItemClicked() {
      const taskItems = document.querySelectorAll('.task_label');
      taskItems.forEach((item) => {
        item.onclick = (e) => {
          e.stopPropagation();
          if (e.target.type !== 'checkbox') {
            e.preventDefault();
          }
          const todoId = item.dataset.id;
          const todo = todoList.find((todo) => todo.id == todoId);
          if (todo) {
            todo.completed = !todo.completed;
            item.querySelector('input').checked = todo.completed;
            if (item.parentElement.hasAttribute('disabled')) {
              item.parentElement.removeAttribute('disabled');
            } else {
              item.parentElement.setAttribute('disabled', true);
            }
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

    render() {
      const listTaskWrapper = document.querySelector('.list_task');
      const errorInput = document.querySelector('.text-error-input');
      listTaskWrapper.innerHTML = ''; // Clear existing tasks
      errorInput.textContent = ''; // Clear error message
      let filteredTodos = todoList.filter((todo) => {
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
        if (todo.completed) {
          taskItem.setAttribute('disabled', true);
        }
        taskItem.setAttribute('data-id', todo.id);
        taskItem.innerHTML = `
              <label  class="flex flex-1 items-center gap-2 cursor-pointer text-sm text-gray-800 task_label" data-id="${
                todo.id
              }">
                  <input type="checkbox" class="w-4 h-4 text-blue-600 bg-white border border-gray-300 rounded-sm focus:ring-0 focus:outline-none cursor-pointer" ${
                    todo.completed ? 'checked' : ''
                  } />
                  <span class="text_task text-base">${todo.text}</span>
              </label>
              <div class="priority-item flex justify-between items-center px-2 py-1 transition-all duration-300">
                  <span class="inline-block font-[tabular-nums] [font-feature-settings:'tnum','tnum'] ${
                    stylePriority[todo.priority].bg
                  } border ${stylePriority[todo.priority].border} ${
          stylePriority[todo.priority].text
        } rounded-[2px] box-border text-[14px] leading-[20px] list-none m-0 mr-2 opacity-100 px-[7px] whitespace-nowrap transition-all duration-300">
                  ${todo.priority}
                  </span>
              </div>
              `;
        listTaskWrapper.appendChild(taskItem);
      });

      this.taskItemClicked();
    },
  };
})();

MainTodo.init();

const AddTodo = (() => {
  return {
    init() {
      this.dropDown();
      this.submitButton();
    },

    dropDown() {
      const selectButton = document.getElementById('select-button');
      const dropdown = document.getElementById('dropdown');
      const selectedOption = document.getElementById('selected-option');

      selectButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });

      dropdown.querySelectorAll('li').forEach((item) => {
        item.addEventListener('click', () => {
          selectedOption.dataset.value = item.dataset.value;
          selectedOption.innerHTML = `
                <span class="inline-block font-[tabular-nums] [font-feature-settings:'tnum','tnum'] ${
                  stylePriority[item.dataset.value].bg
                } border ${stylePriority[item.dataset.value].border} ${
            stylePriority[item.dataset.value].text
          } rounded-[2px] box-border text-[12px] leading-[20px] list-none m-0 mr-2 opacity-100 px-[7px] whitespace-nowrap transition-all duration-300">
                    ${item.dataset.value}
                </span>
            `;
          dropdown.classList.add('hidden');
        });
      });

      document.addEventListener('click', (e) => {
        if (!dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
        }
      });
    },

    submitButton() {
      const submitButton = document.getElementById('submit-button');
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const todoInput = document.getElementById('todo-input');
        const selectedOption = document.getElementById('selected-option');
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
      });
    },
  };
})();

AddTodo.init();
