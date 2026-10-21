import { existsSync } from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';

const STATIC_PRODUCTS_DIR = join(__dirname, '../../static/products');

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(STATIC_PRODUCTS_DIR, imageName);

    if (!existsSync(path))
      throw new BadRequestException(`No product found with image ${imageName}`);

    // Pass root + a bare filename to res.sendFile(), not the full absolute
    // path: `send` rejects any path with a segment starting with a dot
    // (e.g. a project checked out under a `.vscode` folder) as a hidden
    // "dotfile", which otherwise 404s even though the file exists.
    return { root: STATIC_PRODUCTS_DIR, fileName: imageName };
  }
}
