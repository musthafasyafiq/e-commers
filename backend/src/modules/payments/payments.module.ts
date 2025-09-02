import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MidtransService } from './services/midtrans.service';
import { StripeService } from './services/stripe.service';
import { EscrowService } from './services/escrow.service';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order, User])],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MidtransService,
    StripeService,
    EscrowService,
  ],
  exports: [PaymentsService, MidtransService, StripeService, EscrowService],
})
export class PaymentsModule {}
