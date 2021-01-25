// Copyright 2019 The Model Authors. All rights reserved.
// Use of this source code is governed by the Apache License,
// Version 2.0, that can be found in the LICENSE file.

// import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';

import * as canvas from 'canvas';
import { Canvg, presets } from 'canvg';

import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';

import { exists } from '@system-dynamics/core/common';
import { Project as DmProject } from '@system-dynamics/core/datamodel';
import { renderSvgToString } from '@system-dynamics/diagram/render-common';
import { File } from './schemas/file_pb';

const preset = presets.node({
  DOMParser,
  canvas,
  fetch,
});

export async function renderToPNG(fileDoc: File): Promise<Buffer> {
  const project = DmProject.deserializeBinary(fileDoc.getProjectContents_asU8());

  const [svg, viewbox] = renderSvgToString(project, 'main');

  canvas.registerFont('fonts/Roboto-Light.ttf', { family: 'Roboto' });

  const retina = 2; // double the pixels for the same unit of measurement
  const maxPreviewWidth = 400;
  let scale = (maxPreviewWidth * retina) / viewbox.width;
  if (scale > 1) {
    scale = Math.ceil(scale);
  }
  // console.log(`scale ${scale} (w:${viewbox.width * scale})`);
  const c = canvas.createCanvas(viewbox.width * scale, viewbox.height * scale);
  const ctx = c.getContext('2d');
  // const ctx = c.getContext('2d');
  // (ctx as any).parentNode = {
  //   clientWidth: w,
  //   clientHeight: h,
  // };

  // const img = new canvas.Image();
  // img.src = `data:image/svg+xml;utf8,${svg}`;
  // if (!img.complete) {
  //   return [undefined, new Error(`expected Image to be complete w/ data URI`)];
  // }

  // ctx.drawImage(img, 0, 0);

  // console.log(`!! img complete: ${img.complete}`);
  //
  const cvg = Canvg.fromString(
    exists(ctx),
    svg,
    Object.assign({}, preset, {
      window: undefined,
      ignoreMouse: true,
      ignoreAnimation: true,
      // ignoreDimensions: false,
    }),
  );

  await cvg.render();

  return c.toBuffer('image/png', {
    compressionLevel: 6,
    filters: c.PNG_ALL_FILTERS,
    resolution: 192,
  });
}

// TODO: revisit whe this works.
// if (!isMainThread) {
//   console.log('HELLO FROM WORKER');
//   const fileDoc: FileDocument = workerData;
//   const png = renderToPNGSync(fileDoc);
//   exists(parentPort).postMessage(png);
// }
