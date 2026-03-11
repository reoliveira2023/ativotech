import { PartialType } from '@nestjs/swagger';
import { CreateAtivoDto } from './create-ativo.dto';
export class UpdateAtivoDto extends PartialType(CreateAtivoDto) {}
