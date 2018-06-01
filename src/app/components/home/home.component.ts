import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';
import {WatermarkOptions} from '../../models/watermark.model';

const IMAGE_REGEXP = /\.jpg$/;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private _sharp;
  private _buffer;

  watermark: string;
  folder: string;
  images: any[];
  queue: any[];

  constructor(private electronService: ElectronService) {
    this._sharp = this.electronService.sharp;
    this._buffer = this.electronService.bufferNodeJS;

    this.images = [];
    this.queue = [];
  }

  ngOnInit() {
  }

  getFullImagePath(name: string) {
    return 'file://' + this.electronService.path.join(this.folder, name);
  }

  onFileChange($event) {
    console.log($event);
    const element = <HTMLSelectElement> event.target;
    if (!element || !element.files || !element.files[0]) {
      this.folder = '';
      this.images = [];
      return;
    }
    this.folder = $event.target.files[0].path;
    this.loadFiles();
  }

  private loadFiles() {
    const filenames = this.electronService.fs.readdirSync(this.folder);

    console.log(filenames);
    const images = filenames.filter(el => IMAGE_REGEXP.test(el));

    this.images = images;
    console.log(images);
  }

  submit() {
    const options = new WatermarkOptions();
    options.text = this.watermark || 'Watermark';
    options.outputPath = '\\watermarked\\';

    if (!this.electronService.fs.existsSync(this.folder + options.outputPath)) {
      this.electronService.fs.mkdirSync(this.folder + options.outputPath);
    }

    Promise.all(this.images.map((item) => this.addWatermark(item, options)))
      .then(() => {
        this.runSerial();
      });
  }

  addWatermark(filename, options: WatermarkOptions) {
    const image = this.electronService.sharp(this.electronService.path.join(this.folder, filename));

    return image.metadata()
      .then(data => {
          const width = data.width;
          const height = data.height;

          console.log(data);
          const fontSize = width / 1024 * 120;

          const roundedCorners = new this._buffer.Buffer(
            `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <style type="text/css">
                .text { font-size: ${fontSize + 'px'}; font-style: italic; opacity: 0.3; fill: white}
            </style>
              <text x="50%" y="50%" transform="translate(0, ${fontSize / 2.25})"
              alignment-baseline="auto" text-anchor="middle" class="text">${options.text}</text>
            </svg>`
          );

          this.pushToQueue(image, roundedCorners, this.electronService.path.join(this.folder, options.outputPath, filename));

          /*image
            .overlayWith(roundedCorners, {gravity: this._sharp.gravity.center})
            .toFile(this.electronService.path.join(this.folder, options.outputPath, filename));*/
        }
      );
  }

  private pushToQueue(image, pipe, outputPath) {
    this.queue.push(() => image
      .overlayWith(pipe, {gravity: this._sharp.gravity.center})
      .toFile(outputPath));
  }

  private runSerial() {
    let result = Promise.resolve();
    this.queue.forEach(task => {
      result = result.then(() => task()).then(() => console.log(123123));
    });
    result.then(() => this.queue = []);
    return result;
  }
}
