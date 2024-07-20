import * as FileSystem from 'expo-file-system'

enum AppDirectoryNames {
  Logs = 'logs/',
}

const APP_DIR_PATHS: Record<AppDirectoryNames, string> = {
  [AppDirectoryNames.Logs]: FileSystem.documentDirectory + 'logs/',
}

enum AppFileNames {
  RuntimeLog = 'runtime.log',
}

const APP_FILE_DIR: Record<AppFileNames, AppDirectoryNames> = {
  [AppFileNames.RuntimeLog]: AppDirectoryNames.Logs,
}

type AppFileContentTypes = {
  [AppFileNames.RuntimeLog]: string
}

const WRITE_METHODS_BY_FILE = {
  [AppFileNames.RuntimeLog]: async (path: string, content: string) => {
    await FileSystem.writeAsStringAsync(path, content)
  },
}

export class FileSystemUtil {
  static appFiles = AppFileNames

  private static async ensureDirExists(dir: AppDirectoryNames) {
    const dirInfo = await FileSystem.getInfoAsync(APP_DIR_PATHS[dir])

    if (!dirInfo.exists) {
      console.log('Creating directory:', dir)
      await FileSystem.makeDirectoryAsync(APP_DIR_PATHS[dir])
    }
  }

  static async writeFile<T extends AppFileNames>(fileName: T, content: AppFileContentTypes[T]) {
    await FileSystemUtil.ensureDirExists(APP_FILE_DIR[fileName])

    const writeMethod = WRITE_METHODS_BY_FILE[fileName]

    writeMethod(APP_DIR_PATHS[APP_FILE_DIR[fileName]] + fileName, content)
  }

  static async getFileContent<T extends AppFileNames>(
    appFileName: T,
  ): Promise<AppFileContentTypes[T]> {
    const file = await FileSystem.readAsStringAsync(
      APP_DIR_PATHS[APP_FILE_DIR[appFileName]] + appFileName,
    )

    // TODO: check for other content types neither string
    return file as AppFileContentTypes[T]
  }

  static async deleteFile(appFileName: AppFileNames) {
    const fileToDelete = APP_DIR_PATHS[APP_FILE_DIR[appFileName]] + appFileName

    await FileSystem.deleteAsync(fileToDelete)
  }
}
