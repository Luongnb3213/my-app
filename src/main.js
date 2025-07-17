const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  dialog,
} = require('electron');
const path = require('node:path');
const fs = require('fs');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

};


//  NOTIFICATIONS
function showNotification(title, body, icon = null) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      icon: icon,
      silent: false
    });
    
    notification.show();
    setTimeout(() => {
      notification.close();
    }, 3000);
  }
}

// IPC handler for notifications from renderer
ipcMain.handle('show-notification', async (event, { title, body, icon }) => {
  showNotification(title, body, icon);
});

// Notification for task completion
ipcMain.handle('task-completed', async (event, task) => {
  showNotification(
    'Task Completed!',
    `✅ "${task.text}" has been completed`
  );
});

// Notification for new task added
ipcMain.handle('task-added', async (event, task) => {
  showNotification(
    'New Task Added',
    `📝 "${task.text}" - Priority: ${task.priority}`
  );
});


// Notification for new task edit
ipcMain.handle('task-edit', async (event, task) => {
  showNotification(
    'New Task Edit',
    `📝 "${task.text}" - Priority: ${task.priority}`
  );
});

// FILE

// Export tasks to JSON file
ipcMain.handle('export-tasks', async (event, todoList) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Todo List',
      defaultPath: path.join(app.getPath('documents'), 'todo-backup.json'),
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (filePath) {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalTasks: todoList.length,
        completedTasks: todoList.filter((task) => task.completed).length,
        pendingTasks: todoList.filter((task) => !task.completed).length,
        todoList: todoList,
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

      return { success: true, filePath };
    }

    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, message: error.message };
  }
});

// Auto-save functionality
ipcMain.handle('auto-save-tasks', async (event, todoList) => {
  try {
    const autoSaveDir = path.join(app.getAppPath(), 'autosave');

    if (!fs.existsSync(autoSaveDir)) {
      fs.mkdirSync(autoSaveDir, { recursive: true });
    }

    const autoSaveFile = path.join(autoSaveDir, 'todo-autosave.json');

    const saveData = {
      lastSaved: new Date().toISOString(),
      todoList: todoList,
    };

    fs.writeFileSync(autoSaveFile, JSON.stringify(saveData, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Auto-save error:', error);
    return { success: false, message: error.message };
  }
});

// Load auto-saved tasks
ipcMain.handle('load-auto-saved-tasks', async (event) => {
  try {
    const exportDir = path.join(app.getAppPath(), 'autosave'); 
    const autoSaveFile = path.join(exportDir, 'todo-autosave.json');

    // const autoSaveFile = path.join(app.getPath('userData'), 'autosave', 'todo-autosave.json');

    if (fs.existsSync(autoSaveFile)) {
      const fileContent = fs.readFileSync(autoSaveFile, 'utf8');
      const saveData = JSON.parse(fileContent);
      return {
        success: true,
        todoList: saveData.todoList,
        lastSaved: saveData.lastSaved,
      };
    }

    return { success: false, message: 'No auto-save file found' };
  } catch (error) {
    console.error('Load auto-save error:', error);
    return { success: false, message: error.message };
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
