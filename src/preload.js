// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // FILE
  exportTasks: (todoList) => ipcRenderer.invoke('export-tasks', todoList),

  autoSaveTasks: (todoList) => ipcRenderer.invoke('auto-save-tasks', todoList),

  loadAutoSavedTasks: () => ipcRenderer.invoke('load-auto-saved-tasks'),

  // Notifications
  showNotification: (title, body, icon) =>
    ipcRenderer.invoke('show-notification', { title, body, icon }),

  taskCompleted: (task) => ipcRenderer.invoke('task-completed', task),

  taskAdded: (task) => ipcRenderer.invoke('task-added', task),


  taskEdit: (task) => ipcRenderer.invoke('task-edit', task),

});
