import { ITag as BaseTag } from 'edge-parser/build/src/Contracts'

export interface ILoaderConstructor {
  new (): ILoader
}

export interface ILoader {
  mounted: object
  mount (diskName: string, dirPath: string): void
  unmount (diskName: string): void
  resolve (templatePath: string, withResolver: boolean): { template: string, Presenter?: IPresenterConstructor }
  makePath (templatePath: string): string
}

export interface ICompiler {
  cache: boolean
  compile (templatePath: string, inline: boolean): { template: string, Presenter?: IPresenterConstructor }
}

export interface ITag extends BaseTag {
  tagName: string
}

export type Tags = {
  [key: string]: ITag,
}

export interface IPresenterConstructor {
  new (state: any): IPresenter
}

export interface IPresenter {
  state: any
}
