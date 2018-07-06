export interface ILoader {
  mounted: object
  mount (diskName: string, dirPath: string): void
  unmount (diskName: string): void
  resolve (templatePath: string): string
  makePath (templatePath: string): string
}

export interface IPresenterConstructor {
  new (state: any): IPresenter
}

export interface IPresenter {
  state: any
}
