import {Injectable} from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, remote, webFrame} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as buffer from 'buffer';
import * as path from 'path';
import {FontManager} from '../models/font.model';

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  path: typeof path;
  bufferNodeJS: typeof buffer;

  sharp: typeof sharp;
  fontManager: FontManager;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.sharp = window.require('sharp');
      this.bufferNodeJS = window.require('buffer');
      this.path = window.require('path');
      this.fontManager = window.require('font-manager');
    }
  }

  isElectron() {
    return window && window.process && window.process.type;
  }
}
