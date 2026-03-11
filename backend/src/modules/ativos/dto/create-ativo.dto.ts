import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusAtivo {
  DISPONIVEL = 'DISPONIVEL',
  EM_USO = 'EM_USO',
  MANUTENCAO = 'MANUTENCAO',
  ESTOQUE = 'ESTOQUE',
  DESCARTADO = 'DESCARTADO',
}

export class CreateAtivoDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsString() fabricante?: string;
  @IsOptional() @IsString() modelo?: string;
  @IsOptional() @IsString() numeroSerie?: string;
  @IsOptional() @IsString() codigoBarras?: string;
  @IsOptional() @IsNumber() valorCompra?: number;
  @IsOptional() @IsDateString() dataCompra?: string;
  @IsOptional() @IsDateString() garantiaFim?: string;
  @IsOptional() @IsEnum(StatusAtivo) status?: StatusAtivo;
  @IsOptional() @IsUUID() departamentoId?: string;
  @IsOptional() @IsUUID() localizacaoId?: string;
  @IsOptional() @IsUUID() responsavelId?: string;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsString() foto?: string;
}
