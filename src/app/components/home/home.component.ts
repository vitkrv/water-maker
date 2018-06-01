import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';

const IMAGE_REGEXP = /\.jpg$/;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private _sharp;
  private _buffer;

  folder: string;
  images: any[];

  constructor(private electronService: ElectronService) {
    this._sharp = this.electronService.sharp;
    this._buffer = this.electronService.bufferNodeJS;

    this.images = [];
  }

  ngOnInit() {
    const image = this.electronService.sharp('D:\\test.jpg');
    // const image = this.electronService.sharp('D:\\LUDUS_icon.jpg');

    image.metadata()
      .then(data => {
        const width = data.width;
        const height = data.height;
        console.log(data);
        const fontSize = width / 1024 * 120;

        const roundedCorners = new this._buffer.Buffer(
          `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <style type="text/css">
                .text { font-size: ${fontSize + 'px'}; font-style: italic; opacity: 0.4; fill: red}
            </style>
              <text x="50%" y="50%" transform="translate(0, ${fontSize / 2.25})" alignment-baseline="auto" text-anchor="middle" class="text">watermark</text>
            </svg>`
        );

        image
          .overlayWith(roundedCorners, {gravity: this._sharp.gravity.center})
          .toFile('D:\\output.jpg', function (err) {
            console.log(err);
            if (!err) {
              console.log('done');
            }
          });
      });
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
}
