import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { OrdersService } from './orders.service';
import { OrderType } from './entities/order.entity';

@WebSocketGateway({ cors: true })
export class OrdersGateway {
  constructor(private readonly ordersService: OrdersService) {}
  @SubscribeMessage('orders/create')
  async handleMessage(
    client: any,
    payload: {
      assetId: string;
      walletId: string;
      shares: number;
      type: OrderType;
      price: number;
    },
  ) {
    const order = await this.ordersService.create({
      assetId: payload.assetId,
      walletId: payload.walletId,
      shares: payload.shares,
      type: payload.type,
      price: payload.price,
    });
    return order;
  }
}
