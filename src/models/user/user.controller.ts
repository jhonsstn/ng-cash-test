import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SignedUser } from '../../decorators/signed-user.decorator';
import { AccountEntity } from '../account/entities/account.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { TransferDto } from './dto/transfer.dto';
import { UserEntity } from './entities/user.entity';
import { TransferData } from './interfaces/transfer-data.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    const createdUser = await this.userService.create(createUserDto);
    return new UserEntity(createdUser);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/balance')
  async getBalance(
    @Param('id') userId: string,
    @SignedUser() signedUser: UserEntity,
  ): Promise<AccountEntity> {
    const account = await this.userService.getBalance(userId, signedUser);
    return new AccountEntity(account);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('transfer')
  async transfer(
    @Body() transferDto: TransferDto,
    @SignedUser() signedUser: UserEntity,
  ): Promise<TransferData> {
    const transferData = await this.userService.transfer(
      transferDto.cashInId,
      signedUser.id,
      transferDto.amount,
    );
    return {
      cashOutUser: new UserEntity(transferData.cashOutUser),
      cashInUser: new UserEntity(transferData.cashInUser),
    };
  }
}
