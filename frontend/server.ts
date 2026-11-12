import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const serverDistFolder = join(import.meta.dirname, 'browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(
  express.static(serverDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) writeResponseToNodeResponse(response, res);
      else next();
    })
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] ?? 4000);
  app.listen(port, () => console.log(`BharatTools SSR listening on http://localhost:${port}`));
}

export const reqHandler = createNodeRequestHandler(app);
