import { readdir } from 'node:fs/promises'

import { Router, type NextFunction } from 'express'

const isProd = process.env['NODE_ENV'] === 'production'
const root = process.cwd()
const routesDir = isProd ? `${root}/dist/src/routes` : `${root}/src/routes`

type File = { name: string; path: string; parentPath: string }

const scanRoutes = async (): Promise<{ dir: string; file: string; path: string }[]> => {
  const dir = await readdir(routesDir, { withFileTypes: true, recursive: true })

  const routes = []
  const ext = isProd ? '.mjs' : '.ts'
  for (const file of dir) {
    if (file.isFile() && !file.name.endsWith('d.mts') && file.name.endsWith(ext)) {
      const r = (file as unknown as File).parentPath.replace(routesDir, '')
      const path = `${r}/${(file as unknown as File).name.replace(/\.[^/.]+$/, '').replace(/index/, '')}`

      routes.push({
        dir: (file as unknown as File).parentPath,
        file: `${(file as unknown as File).parentPath}/${(file as unknown as File).name}`,
        path: path.endsWith('/') ? path.slice(0, -1) : path
      })
    }
  }

  console.log(routes)

  return routes
}

type RouteHanlder = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

type RouteObject = {
  path: string
  method: string
  middlewares: RouteHanlder[]
  handler: RouteHanlder
}

const registerRoutes = async (): Promise<Router> => {
  const routes = await scanRoutes()
  const router = Router()

  try {
    for (const route of routes) {
      const routeObj = await import(route.file)

      const routePath = route.path

      for (const { path, method, middlewares, handler } of routeObj.default as RouteObject[]) {
        const pathname = (path === '/' ? routePath : `${routePath}${path}`).replace(/\/\//g, '/').replace(/\[(\w+)\]/g, ':$1')

        if (middlewares.length > 0) {
          // @ts-expect-error type issue
          ;(router as unknown as keyof Router)[method](pathname, ...middlewares, handler)
        } else {
          // @ts-expect-error type issue
          ;(router as unknown as keyof Router)[method](pathname, handler)
        }
        console.log(`Registering ${method.toUpperCase()} /api${pathname}`)
      }
    }

    return router
  } catch (e) {
    console.log('Error in registering routes: ', e)

    return router
  }
}

const routes: Router = await registerRoutes()

export default routes
