import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import {ElectronService} from './electron.service';

import {ProcessingStatus, WatermarkOptions} from '../models/watermark.model';

@Injectable()
export class WatermarkService {
  private _sharp;
  private _buffer;

  private _processingStatus = new ProcessingStatus();
  processingStatus = new Subject<ProcessingStatus>();

  imagesQueue: any[];

  constructor(private electronService: ElectronService) {
    this._sharp = this.electronService.sharp;
    this._buffer = this.electronService.bufferNodeJS;

    this.imagesQueue = [];
  }

  private shareStatus() {
    this.processingStatus.next(this._processingStatus);
  }

  addWatermarks(images: string[], options: WatermarkOptions) {
    if (this._processingStatus.isActive) {
      return;
    }

    this._processingStatus.isActive = true;
    this._processingStatus.processedItems = 0;
    this._processingStatus.totalItems = images.length;
    this.shareStatus();

    if (!this.electronService.fs.existsSync(options.outputFolder)) {
      this.electronService.fs.mkdirSync(options.outputFolder);
    }

    Promise.all(images.map((filename) => this.processWatermark(filename, options)))
      .then(() => this.runSerial());
  }

  private processWatermark(filename: string, options: WatermarkOptions) {
    const image = this.electronService.sharp(this.electronService.path.join(options.inputFolder, filename));

    return image.metadata()
      .then(data => {
          const width = data.width;
          const height = data.height;

          const fontSize = width / 1024 * 120;
          const fontFamily = 'Roboto';

          const roundedCorners = new this._buffer.Buffer(
            `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <style type="text/css">
                .text { font-size: ${fontSize + 'px'}; font-family: ${fontFamily}; opacity: 0.3; fill: white}
            </style>
              <text x="50%" y="50%" transform="translate(0, ${fontSize / 2.25})"
              alignment-baseline="auto" text-anchor="middle" class="text">${options.text}</text>
            </svg>`
          );

          this.pushToQueue(image, roundedCorners, this.electronService.path.join(options.outputFolder, filename));
        }
      );
  }

  private pushToQueue(image, pipe, outputPath) {
    this.imagesQueue.push(() => image
      .overlayWith(pipe, {gravity: this._sharp.gravity.center})
      .toFile(outputPath));
  }

  private runSerial() {
    let result = Promise.resolve();
    this.imagesQueue.forEach(task => {
      result = result.then(() => task()).then(() => {
        this._processingStatus.processedItems += 1;
        this.shareStatus();
      });
    });

    result.then(() => {
      this.imagesQueue = [];
      this._processingStatus.isActive = false;
      this.shareStatus();
    }).catch(() => {
      this.imagesQueue = [];
      this._processingStatus.isActive = false;
      this.shareStatus();
    });

    return result;
  }

}
