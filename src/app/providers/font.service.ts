import {Injectable} from '@angular/core';

import {FontItem} from '../models/font.model';
import {ElectronService} from './electron.service';

@Injectable()
export class FontService {
  fonts: FontItem[];

  constructor(private electronService: ElectronService) {
    this.fonts = this.electronService.fontManager.getAvailableFontsSync();
    console.log(this.fonts);
  }

}
