import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private _sharp;
  private _buffer;

  constructor(private electronService: ElectronService) {
    this._sharp = this.electronService.sharp;
    this._buffer = this.electronService.bufferNodeJS;
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

}
