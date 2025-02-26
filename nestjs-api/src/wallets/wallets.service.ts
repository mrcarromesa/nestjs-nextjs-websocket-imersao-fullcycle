import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Wallet } from './entities/wallet.entity';
import mongoose, { Model } from 'mongoose';
import { WalletAsset } from './entities/wallet-assets.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private walletSchema: Model<Wallet>,
    @InjectModel(WalletAsset.name)
    private walletAssetSchema: Model<WalletAsset>,
    @InjectConnection() private connection: mongoose.Connection,
  ) {}

  create(createWalletDto: CreateWalletDto) {
    return this.walletSchema.create(createWalletDto);
  }

  findAll() {
    return this.walletSchema.find();
  }

  findOne(id: string) {
    // this.walletAssetSchema.find({ wallet: id }).populate(['asset', 'wallet']);
    return this.walletSchema.findById(id).populate([
      {
        path: 'assets', // walletassets é o nome do relacionamento em entity Wallet.assets que seria WalletAssetDocument
        populate: ['asset'], // e para cada item do array de assets carregar o asset!
      },
    ]);
  }

  async createWalletAsset(data: {
    walletId: string;
    assetId: string;
    shares: number;
  }) {
    const session = await this.connection.startSession();
    await (session.startTransaction() as unknown as Promise<mongoose.mongo.ClientSession>);
    try {
      const docs = await this.walletAssetSchema.create(
        [
          {
            wallet: data.walletId,
            asset: data.assetId,
            shares: data.shares,
          },
        ],
        {
          session,
        },
      ); // return a array;

      const walletAsset = docs[0];

      await this.walletSchema.updateOne(
        { _id: data.walletId },
        { $push: { assets: walletAsset._id } }, // is the that do array push in JS
        {
          session,
        },
      );

      await session.commitTransaction();
      return walletAsset;
    } catch (error) {
      console.error(error);
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }
  }
}
