import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmpresaDto {
  @ApiProperty({ example: 'Tech Corp' })
  @IsString()
  nomeEmpresa: string;

  @ApiProperty({ example: 'contato@techcorp.com' })
  @IsEmail()
  emailEmpresa: string;

  @ApiProperty({ example: '12.345.678/0001-90', required: false })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ example: '(11) 99999-0000', required: false })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nomeAdmin: string;

  @ApiProperty({ example: 'admin@techcorp.com' })
  @IsEmail()
  emailAdmin: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  senhaAdmin: string;
}
