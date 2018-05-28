import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private electronService: ElectronService) {
  }

  ngOnInit() {
    this.electronService.sharp('D:\\test.jpg')
      .blur(12)
      .toFile('D:\\output.jpg', function (err) {
        console.log(err);
        if (!err) {
          console.log('done');
        }
      });
  }

}
