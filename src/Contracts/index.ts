export interface ILoader {
  mounted: object
  mount (diskName: string, dirPath: string): void
  unmount (diskName: string): void
  resolve (templatePath: string, diskName: string): string
  makePath (templatePath: string, diskName: string): string
}

export interface IPresenter {
  state: any
}
