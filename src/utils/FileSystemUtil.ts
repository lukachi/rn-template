import { Directory, File, Paths } from 'expo-file-system' // FIXME

enum AppDirectoryNames {
  Logs = 'logs/',
}

const APP_DIR_PATHS: Record<AppDirectoryNames, string> = {
  [AppDirectoryNames.Logs]: Paths.document + 'logs/',
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
    new File(path).write(content)
  },
}

export class FileSystemUtil {
  static appFiles = AppFileNames

  private static async ensureDirExists(dir: AppDirectoryNames) {
    const dirInfo = await new File(APP_DIR_PATHS[dir]).info()

    if (!dirInfo.exists) {
      new Directory(APP_DIR_PATHS[dir]).create()
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
    const file = new File(APP_DIR_PATHS[APP_FILE_DIR[appFileName]] + appFileName)

    // TODO: check for other content types neither string
    return file.text()
  }

  static async deleteFile(appFileName: AppFileNames) {
    const fileToDelete = new File(APP_DIR_PATHS[APP_FILE_DIR[appFileName]] + appFileName)

    fileToDelete.delete()
  }
}
