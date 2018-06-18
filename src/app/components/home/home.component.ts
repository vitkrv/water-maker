import {Component, OnInit} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';
import {ProcessingStatus, WatermarkOptions} from '../../models/watermark.model';
import {FontService} from '../../providers/font.service';
import {WatermarkService} from '../../providers/watermark.service';
import {DestroyableComponent} from '../../shared/destroyable.component';

const IMAGE_REGEXP = /\.jpg$/;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends DestroyableComponent implements OnInit {
  private _sharp;
  private _buffer;

  isProcessing: boolean;
  processedItems: number;
  totalItems: number;

  watermark: string;
  folder: string;
  images: any[];
  queue: any[];

  constructor(private electronService: ElectronService,
              private fontService: FontService,
              private watermarkService: WatermarkService) {
    super();
    this._sharp = this.electronService.sharp;
    this._buffer = this.electronService.bufferNodeJS;

    this.images = [];
    this.queue = [];

    this.isProcessing = false;
    this.processedItems = 0;
    this.totalItems = 0;
  }

  ngOnInit() {
    this.watermarkService.processingStatus
      .takeUntil(this.onDestroy)
      .subscribe((data: ProcessingStatus) => {
        this.isProcessing = data.isActive;
        this.processedItems = data.processedItems;
        this.totalItems = data.totalItems;
      });
  }

  getFullImagePath(name: string) {
    return 'file://' + this.electronService.path.join(this.folder, name);
  }

  onFileChange($event) {
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

    this.images = filenames.filter(el => IMAGE_REGEXP.test(el));
  }

  openFolder(path) {
    this.electronService.childProcess.exec(`start "" "${path}"`);
  }

  submit() {
    const options = new WatermarkOptions();
    options.text = this.watermark || 'Watermark';
    options.inputFolder = this.folder;
    options.outputFolder = this.electronService.path.join(this.folder, '\\watermarked\\');

    this.watermarkService.addWatermarks(this.images, options);
  }
}
