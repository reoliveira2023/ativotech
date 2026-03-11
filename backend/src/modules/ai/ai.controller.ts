import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('IA') @ApiBearerAuth() @Controller('ai')
export class AiController {
  constructor(private s: AiService) {}
  @Post('chat')
  chat(@Body('pergunta') pergunta: string, @CurrentUser('empresaId') e: string) {
    return this.s.chat(pergunta, e);
  }
}
