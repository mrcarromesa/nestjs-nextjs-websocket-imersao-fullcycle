import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Model } from 'mongoose';
import { Asset } from './entities/asset.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Observable } from 'rxjs';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private readonly assetSchema: Model<Asset>,
  ) {}

  create(createAssetDto: CreateAssetDto) {
    return this.assetSchema.create(createAssetDto);
  }

  findAll() {
    return this.assetSchema.find();
  }

  findOne(symbol: string) {
    return this.assetSchema.findOne({ symbol });
  }

  subscribeNewPriceChangedEvent(): Observable<Asset> {
    return new Observable((observer) => {
      this.assetSchema
        .watch(
          [
            {
              $match: {
                $or: [
                  {
                    operationType: 'update', // atualiza alguma informação do documento
                  },
                  {
                    operationType: 'replace', // atualiza todas as informações do documento
                  },
                ],
              },
            },
          ],
          {
            fullDocument: 'updateLookup', // copia do documento gerado ou totalmente substituído
            fullDocumentBeforeChange: 'whenAvailable',
          },
        )
        .on('change', async (data) => {
          if (data.fullDocument.price === data.fullDocumentBeforeChange.price) {
            return;
          }
          const asset = await this.assetSchema.findById(data.fullDocument._id);
          observer.next(asset!);
        });
    });
  }
}
